/**
 * Plan Generator
 *
 * Takes a user's learning goal and starting level, builds a prompt
 * for Claude, and parses the response into a structured learning plan.
 */

import Anthropic from '@anthropic-ai/sdk';
import type { LearningPlan } from './paths.types';
import { PathError } from './paths.types';

const LLM_MODEL = process.env.GENERATION_LLM_MODEL ?? 'claude-sonnet-4-20250514';

// ============================================================
// Plan generation
// ============================================================

export async function generateLearningPlan(input: {
  userPrompt: string;
  language: string;
  startingLevel: string;
  detectedFramework?: string | null;
}): Promise<{ plan: LearningPlan; title: string; generationTimeMs: number }> {
  const startTime = Date.now();
  const anthropic = new Anthropic();

  const prompt = buildPlanPrompt(input);

  let response: Anthropic.Message;
  try {
    response = await anthropic.messages.create({
      model: LLM_MODEL,
      max_tokens: 4096,
      temperature: 1,
      messages: [{ role: 'user', content: prompt }],
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    throw new PathError('PLAN_GENERATION_FAILED', `Failed to generate learning plan: ${message}`);
  }

  const textBlock = response.content.find((block) => block.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new PathError('PLAN_GENERATION_FAILED', 'Claude returned no text content');
  }

  const rawText = textBlock.text.trim();
  const jsonText = rawText.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '');

  // Extract JSON if there's preamble text
  let cleanJson = jsonText;
  if (!cleanJson.trimStart().startsWith('{')) {
    const firstBrace = cleanJson.indexOf('{');
    const lastBrace = cleanJson.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      cleanJson = cleanJson.slice(firstBrace, lastBrace + 1);
    }
  }

  let parsed: {
    title: string;
    overview: string;
    estimated_duration_hours: number;
    milestones: {
      index: number;
      title: string;
      description: string;
      skills: string[];
      skill_gates: string[];
      topics: string[];
      target_difficulty: string;
      estimated_exercises: number;
    }[];
  };

  try {
    parsed = JSON.parse(cleanJson);
  } catch {
    throw new PathError(
      'PLAN_GENERATION_FAILED',
      'Failed to parse learning plan as JSON. Try rephrasing your goal.'
    );
  }

  // Validate structure
  if (!parsed.title || !parsed.milestones || !Array.isArray(parsed.milestones)) {
    throw new PathError(
      'PLAN_GENERATION_FAILED',
      'Invalid plan structure — missing title or milestones'
    );
  }

  if (parsed.milestones.length < 3 || parsed.milestones.length > 10) {
    throw new PathError(
      'PLAN_GENERATION_FAILED',
      `Plan has ${parsed.milestones.length} milestones — expected 3-10. Try rephrasing your goal.`
    );
  }

  // Normalize to our type structure
  const plan: LearningPlan = {
    overview: parsed.overview,
    estimatedDurationHours: parsed.estimated_duration_hours,
    milestones: parsed.milestones.map((m, i) => ({
      index: i,
      title: m.title,
      description: m.description,
      skills: m.skills ?? [],
      skillGates: m.skill_gates ?? [],
      topics: m.topics ?? [],
      targetDifficulty: m.target_difficulty ?? 'medium',
      estimatedExercises: m.estimated_exercises ?? 4,
    })),
  };

  // Validate each milestone
  for (const milestone of plan.milestones) {
    if (!milestone.title || !milestone.description) {
      throw new PathError(
        'PLAN_GENERATION_FAILED',
        `Milestone ${milestone.index} is missing title or description`
      );
    }
    if (milestone.skills.length === 0) {
      throw new PathError(
        'PLAN_GENERATION_FAILED',
        `Milestone "${milestone.title}" has no skills defined`
      );
    }
    if (milestone.skillGates.length === 0) {
      // Default: use the first skill as the gate
      milestone.skillGates = [milestone.skills[0]];
    }
  }

  return {
    plan,
    title: parsed.title,
    generationTimeMs: Date.now() - startTime,
  };
}

// ============================================================
// Prompt building
// ============================================================

function buildPlanPrompt(input: {
  userPrompt: string;
  language: string;
  startingLevel: string;
  detectedFramework?: string | null;
}): string {
  const levelContext = getStartingLevelContext(input.startingLevel);
  const frameworkContext = input.detectedFramework
    ? `\nThe user is specifically interested in the ${input.detectedFramework} framework/ecosystem.`
    : '';

  return `You are an expert programming curriculum designer who creates personalized learning plans. Your plans are structured, progressive, and lead to real mastery.

## User's Learning Goal

**Goal:** ${input.userPrompt}
**Language:** ${input.language}
**Starting level:** ${input.startingLevel}
${frameworkContext}

## Starting Level Context

${levelContext}

## Plan Requirements

Create a learning plan with 5-8 milestones that progressively build toward mastery of the user's goal.

Each milestone should:
- Have a clear, specific title (not generic like "Advanced Topics")
- Have a description explaining what the user will learn and why it matters
- List 3-6 specific skills it teaches (use short, precise skill names like "useEffect_cleanup" not vague ones like "hooks")
- Define "skill_gates" — the 1-3 most important skills the user MUST demonstrate to advance (subset of skills)
- List concrete topics that exercises should cover
- Set a target difficulty level (beginner, easy, medium, hard, expert)
- Estimate the number of exercises (3-6 per milestone)

The plan should:
- Start from the user's stated level — don't re-teach what they already know
- Build each milestone on skills from previous milestones
- Progress in difficulty naturally (don't jump from beginner to expert)
- Be achievable in 15-30 exercises total
- End with the user confidently able to do what they described in their goal
- Feel like a coherent journey, not a random collection of topics

## Output Format

Respond with ONLY a JSON object (no markdown fences, no preamble):

{
  "title": "A compelling title for this learning path (e.g. 'React Hooks Mastery' not 'Learning Plan')",
  "overview": "2-3 sentence description of the learning journey",
  "estimated_duration_hours": number,
  "milestones": [
    {
      "index": 0,
      "title": "Milestone title",
      "description": "What the user will learn and build",
      "skills": ["skill_1", "skill_2", "skill_3"],
      "skill_gates": ["skill_1"],
      "topics": ["specific topic 1", "specific topic 2"],
      "target_difficulty": "beginner",
      "estimated_exercises": 4
    }
  ]
}

## Critical Rules

1. Skills should be specific and assessable (e.g. "array_destructuring" not "javascript basics")
2. Skill gates must be a subset of skills — they're the minimum the user must prove
3. Topics should be concrete enough to generate an exercise from (e.g. "build a counter with useState" not "state management")
4. Each milestone should feel like an achievement — the user should be able to build something new after completing it
5. Do NOT include any text outside the JSON object`;
}

function getStartingLevelContext(level: string): string {
  switch (level) {
    case 'beginner':
      return `The user is new to this language/topic. Start from the very basics.
Assume no prior knowledge of the specific technology. They may know general
programming concepts but nothing specific to this language or framework.
First milestone should cover fundamental syntax and concepts.`;

    case 'some_experience':
      return `The user has some exposure but isn't comfortable yet. They've seen tutorials
or done a few exercises but couldn't build something from scratch.
Skip the absolute basics (variables, loops) but cover foundational patterns.
First milestone should reinforce core concepts, not teach them from zero.`;

    case 'intermediate':
      return `The user is comfortable with the basics and has built small projects.
They understand core concepts but want to level up on specific skills.
Skip fundamentals entirely. Start from intermediate patterns and best practices.
Focus on the specific skills mentioned in their goal.`;

    case 'advanced':
      return `The user is experienced and wants to master specific advanced topics.
They're already productive in this language/framework.
Start from advanced patterns. Focus on edge cases, performance, architecture,
and expert-level techniques. Assume strong foundational knowledge.`;

    default:
      return `Start from intermediate level. The user has some experience but wants structured practice.`;
  }
}
