/**
 * Skill Assessor
 *
 * After each exercise completion, analyzes the user's solution
 * and test results to determine which skills were demonstrated.
 * This feeds into the milestone advancement logic.
 */

import Anthropic from '@anthropic-ai/sdk';
import type { SkillAssessment } from './paths.types';
import { PathError } from './paths.types';

const LLM_MODEL = process.env.GENERATION_LLM_MODEL ?? 'claude-sonnet-4-20250514';

/**
 * Assess which skills were demonstrated based on the exercise,
 * test results, and the user's solution code.
 */
export async function assessSkills(input: {
  exerciseTitle: string;
  exerciseDescription: string;
  milestoneSkills: string[];
  testsPassed: number;
  testsTotal: number;
  testResults: { name: string; passed: boolean; error?: string }[];
  userSolutionCode: string;
}): Promise<SkillAssessment[]> {
  // If no tests passed, no skills demonstrated
  if (input.testsPassed === 0) {
    return input.milestoneSkills.map((skill) => ({
      skill,
      demonstrated: false,
      confidence: 0.0,
      reasoning: 'No tests passed',
    }));
  }

  const anthropic = new Anthropic();

  const testResultsFormatted = input.testResults
    .map((t) => `- ${t.name}: ${t.passed ? 'PASSED' : `FAILED — ${t.error ?? 'unknown error'}`}`)
    .join('\n');

  const prompt = `You are a programming skill assessor. Given an exercise, test results, and the user's solution, determine which skills were demonstrated.

## Exercise

**Title:** ${input.exerciseTitle}
**Description:** ${input.exerciseDescription.slice(0, 500)}

## Test Results (${input.testsPassed}/${input.testsTotal} passed)

${testResultsFormatted}

## User's Solution

\`\`\`
${input.userSolutionCode.slice(0, 3000)}
\`\`\`

## Skills to Assess

${input.milestoneSkills.map((s) => `- "${s}"`).join('\n')}

## Instructions

For each skill, determine:
- **demonstrated**: Was this skill shown in the solution? (true/false)
- **confidence**: How confident are you? (0.0 to 1.0)
  - 0.9-1.0: Clearly and correctly demonstrated
  - 0.7-0.8: Demonstrated but with minor issues
  - 0.4-0.6: Partially demonstrated or inferred
  - 0.1-0.3: Barely shown or unclear
  - 0.0: Not demonstrated at all
- **reasoning**: One sentence explaining your assessment

A skill is "demonstrated" if the user's code shows understanding of the concept, even if not all related tests passed. Focus on whether the user UNDERSTANDS the skill, not just whether the code is perfect.

Respond with ONLY a JSON object:
{
  "assessments": [
    {
      "skill": "skill_name",
      "demonstrated": true,
      "confidence": 0.85,
      "reasoning": "Brief explanation"
    }
  ]
}`;

  try {
    const response = await anthropic.messages.create({
      model: LLM_MODEL,
      max_tokens: 2048,
      temperature: 0,
      messages: [{ role: 'user', content: prompt }],
    });

    const textBlock = response.content.find((block) => block.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      return fallbackAssessment(input.milestoneSkills, input.testsPassed, input.testsTotal);
    }

    const rawText = textBlock.text.trim();
    let jsonText = rawText.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '');

    if (!jsonText.trimStart().startsWith('{')) {
      const firstBrace = jsonText.indexOf('{');
      const lastBrace = jsonText.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace > firstBrace) {
        jsonText = jsonText.slice(firstBrace, lastBrace + 1);
      }
    }

    const parsed = JSON.parse(jsonText) as { assessments: unknown[] };

    if (!Array.isArray(parsed.assessments)) {
      return fallbackAssessment(input.milestoneSkills, input.testsPassed, input.testsTotal);
    }

    // Validate, filter to known skills, and normalize
    const validSkills = new Set(input.milestoneSkills);
    const assessmentMap = new Map<string, SkillAssessment>();

    for (const raw of parsed.assessments) {
      const a = raw as Record<string, unknown>;
      if (typeof a.skill !== 'string' || !validSkills.has(a.skill)) continue;

      const confidence = Number(a.confidence);
      assessmentMap.set(a.skill, {
        skill: a.skill,
        demonstrated: Boolean(a.demonstrated),
        confidence: Number.isFinite(confidence) ? Math.max(0, Math.min(1, confidence)) : 0,
        reasoning: typeof a.reasoning === 'string' ? a.reasoning : '',
      });
    }

    if (assessmentMap.size === 0) {
      return fallbackAssessment(input.milestoneSkills, input.testsPassed, input.testsTotal);
    }

    // Ensure every milestone skill has an assessment (fill missing with fallback)
    const passRate = input.testsTotal > 0 ? input.testsPassed / input.testsTotal : 0;
    return input.milestoneSkills.map(
      (skill) =>
        assessmentMap.get(skill) ?? {
          skill,
          demonstrated: false,
          confidence: Math.min(passRate, 0.69),
          reasoning: `Not assessed by AI — requires AI confirmation (${Math.round(passRate * 100)}% pass rate)`,
        }
    );
  } catch (err) {
    // If AI assessment fails, fall back to heuristic
    console.error('[SkillAssessor] AI assessment failed, using heuristic:', err);
    return fallbackAssessment(input.milestoneSkills, input.testsPassed, input.testsTotal);
  }
}

/**
 * Heuristic fallback when AI assessment fails.
 * Based purely on test pass rate.
 */
function fallbackAssessment(
  skills: string[],
  testsPassed: number,
  testsTotal: number
): SkillAssessment[] {
  const passRate = testsTotal > 0 ? testsPassed / testsTotal : 0;

  return skills.map((skill) => ({
    skill,
    demonstrated: false,
    confidence: Math.min(passRate, 0.69),
    reasoning: `AI assessment unavailable — requires AI confirmation (${Math.round(passRate * 100)}% pass rate)`,
  }));
}
