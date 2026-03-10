/**
 * Explanation Generator
 *
 * Generates contextual failure explanations after a failed submission.
 * Uses progressive hinting — gentle nudges on early attempts,
 * more direct guidance on later attempts.
 */

import Anthropic from '@anthropic-ai/sdk';
import type { FailureExplanation, GenerateExplanationInput } from './teaching.types';
import { TeachingError } from './teaching.types';

const LLM_MODEL = process.env.GENERATION_LLM_MODEL ?? 'claude-sonnet-4-20250514';

export async function generateExplanation(
  input: GenerateExplanationInput
): Promise<{ explanation: FailureExplanation; generationTimeMs: number; llmModel: string }> {
  const startTime = Date.now();
  const anthropic = new Anthropic();

  const prompt = buildExplanationPrompt(input);

  let response: Anthropic.Message;
  try {
    response = await anthropic.messages.create({
      model: LLM_MODEL,
      max_tokens: 1024,
      temperature: 0.3,
      messages: [{ role: 'user', content: prompt }],
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    throw new TeachingError(
      'EXPLANATION_GENERATION_FAILED',
      `Failed to generate explanation: ${message}`
    );
  }

  const textBlock = response.content.find((block) => block.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new TeachingError('EXPLANATION_GENERATION_FAILED', 'Claude returned no text content');
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

  let parsed: FailureExplanation;
  try {
    parsed = JSON.parse(jsonText) as FailureExplanation;
  } catch {
    // If parsing fails, return a generic explanation
    return {
      explanation: {
        whatWentWrong: "Some tests didn't pass.",
        whyItFailed: 'Review the test output below to see which cases failed and why.',
        nudge: 'Compare your output with the expected values in the test results.',
        severity: 'logic',
      },
      generationTimeMs: Date.now() - startTime,
      llmModel: LLM_MODEL,
    };
  }

  // Normalize
  const explanation: FailureExplanation = {
    whatWentWrong: parsed.whatWentWrong ?? 'Some tests failed.',
    whyItFailed: parsed.whyItFailed ?? '',
    nudge: parsed.nudge ?? '',
    severity: (['syntax', 'logic', 'conceptual', 'edge_case'].includes(parsed.severity)
      ? parsed.severity
      : 'logic') as FailureExplanation['severity'],
    relatedLessonSection: parsed.relatedLessonSection,
  };

  return {
    explanation,
    generationTimeMs: Date.now() - startTime,
    llmModel: LLM_MODEL,
  };
}

// ============================================================
// Prompt building
// ============================================================

function buildExplanationPrompt(input: GenerateExplanationInput): string {
  const testResultsFormatted = input.testResults
    .map((t) => `- ${t.name}: ${t.passed ? 'PASSED' : `FAILED — ${t.error ?? 'unknown'}`}`)
    .join('\n');

  const previousContext = buildPreviousContext(input);
  const progressiveInstructions = getProgressiveInstructions(input.attemptNumber);

  return `You are a patient, encouraging programming tutor. A student is working on a coding exercise and their submission failed some tests. Help them understand what went wrong without giving away the answer.

## Exercise

**Title:** ${input.exerciseTitle}
**Description:** ${input.exerciseDescription.slice(0, 800)}
**Difficulty:** ${input.exerciseDifficulty}

## Student's Code

\`\`\`
${input.userCode.slice(0, 4000)}
\`\`\`

## Test Results (${input.testsPassed}/${input.testsTotal} passed)

${testResultsFormatted}
${previousContext}
## Guidance Level

This is failed attempt #${input.attemptNumber} on this exercise.

${progressiveInstructions}
${input.lessonTitle ? `\nThe pre-exercise lesson was titled "${input.lessonTitle}". If the student's mistake relates to a concept covered in the lesson, reference it in relatedLessonSection.` : ''}

## Response Format

Respond with ONLY a JSON object:

{
  "whatWentWrong": "Plain English explanation of the issue (1-2 sentences). Be specific about THEIR code, not generic.",
  "whyItFailed": "Conceptual explanation of the underlying misunderstanding (2-3 sentences). Teach the concept, don't just diagnose.",
  "nudge": "A helpful direction without giving the answer (1-2 sentences). Point them toward the right approach.",
  "severity": "syntax | logic | conceptual | edge_case",
  "relatedLessonSection": "Title of the relevant lesson section, or null if not applicable"
}

## Rules

1. Be encouraging — they're learning, not failing.
2. Reference THEIR specific code, not hypothetical code.
3. NEVER include the correct solution or corrected code.
4. The "nudge" should make them think, not copy-paste.
5. If multiple tests failed for different reasons, focus on the most fundamental issue first.
6. Keep language simple and clear.`;
}

function getProgressiveInstructions(attemptNumber: number): string {
  if (attemptNumber <= 2) {
    return `**Level: Gentle nudge**
Give a gentle nudge. Don't reveal the approach or solution. Help them think about the problem differently. Ask a guiding question if appropriate. Focus on helping them understand WHAT went wrong, not HOW to fix it.`;
  }

  if (attemptNumber <= 4) {
    return `**Level: More specific**
Be more specific than a gentle nudge. Point them toward the right area of their code. Mention the relevant concept or technique they should look into. Explain WHY their current approach doesn't work for the failing cases.`;
  }

  return `**Level: Direct guidance**
Be direct. Explain the specific issue and the general approach they should take. Describe the technique or pattern that solves this type of problem. Still don't write the actual code for them, but make it clear what needs to change and why.`;
}

function buildPreviousContext(input: GenerateExplanationInput): string {
  if (!input.previousExplanations || input.previousExplanations.length === 0) {
    return '';
  }

  const prev = input.previousExplanations
    .slice(0, 3)
    .map((e, i) => `- Attempt ${input.attemptNumber - i - 1}: "${e.nudge}"`)
    .join('\n');

  return `
## Previous Guidance Given

The student has already received these hints:
${prev}

Do NOT repeat the same guidance. Escalate your specificity or address a different aspect of the problem.
`;
}
