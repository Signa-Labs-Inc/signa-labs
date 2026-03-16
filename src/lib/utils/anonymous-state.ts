/**
 * Persists anonymous user state to localStorage before sign-up redirect,
 * and retrieves it after sign-up so in-progress work isn't lost.
 *
 * Each state type is stored under its own key with a TTL so stale data
 * doesn't resurface days later.
 */

const TTL_MS = 30 * 60 * 1000; // 30 minutes

// ── Exercise draft code ─────────────────────────────────────

const EXERCISE_DRAFT_KEY = 'signa:anon:exercise-draft';

type ExerciseDraftState = {
  exerciseId: string;
  /** filePath → content for editable files */
  files: Record<string, string>;
  savedAt: number;
};

export function saveAnonymousExerciseDraft(
  exerciseId: string,
  files: Record<string, string>
): void {
  try {
    const state: ExerciseDraftState = { exerciseId, files, savedAt: Date.now() };
    localStorage.setItem(EXERCISE_DRAFT_KEY, JSON.stringify(state));
  } catch {
    // localStorage may be full or disabled — non-critical
  }
}

export function loadAnonymousExerciseDraft(
  exerciseId: string
): Record<string, string> | null {
  try {
    const raw = localStorage.getItem(EXERCISE_DRAFT_KEY);
    if (!raw) return null;

    const state = JSON.parse(raw) as ExerciseDraftState;
    if (state.exerciseId !== exerciseId) return null;
    if (Date.now() - state.savedAt > TTL_MS) {
      localStorage.removeItem(EXERCISE_DRAFT_KEY);
      return null;
    }
    return state.files;
  } catch {
    return null;
  }
}

export function clearAnonymousExerciseDraft(): void {
  try {
    localStorage.removeItem(EXERCISE_DRAFT_KEY);
  } catch {
    // non-critical
  }
}

// ── Generate exercise form ──────────────────────────────────

const GENERATE_KEY = 'signa:anon:generate-form';

type GenerateFormState = {
  prompt: string;
  language: string;
  difficulty: string;
  mode: string;
  savedAt: number;
};

export function saveGenerateFormState(state: Omit<GenerateFormState, 'savedAt'>): void {
  try {
    localStorage.setItem(
      GENERATE_KEY,
      JSON.stringify({ ...state, savedAt: Date.now() })
    );
  } catch {
    // non-critical
  }
}

export function loadGenerateFormState(): Omit<GenerateFormState, 'savedAt'> | null {
  try {
    const raw = localStorage.getItem(GENERATE_KEY);
    if (!raw) return null;

    const state = JSON.parse(raw) as GenerateFormState;
    if (Date.now() - state.savedAt > TTL_MS) {
      localStorage.removeItem(GENERATE_KEY);
      return null;
    }
    return { prompt: state.prompt, language: state.language, difficulty: state.difficulty, mode: state.mode };
  } catch {
    return null;
  }
}

export function clearGenerateFormState(): void {
  try {
    localStorage.removeItem(GENERATE_KEY);
  } catch {
    // non-critical
  }
}
