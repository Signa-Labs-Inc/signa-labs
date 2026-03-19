/**
 * Extracts error message and code from API response bodies.
 *
 * Handles both structured `{ error: { code, message } }` (from handleError)
 * and legacy `{ error: "string" }` shapes.
 */
export function parseApiError(
  body: unknown,
  fallbackStatus: number
): { message: string; code: string | null } {
  if (body && typeof body === 'object' && 'error' in body) {
    const err = (body as Record<string, unknown>).error;

    // Structured shape: { error: { code, message } }
    if (err && typeof err === 'object' && 'message' in err) {
      const obj = err as Record<string, unknown>;
      return {
        message: typeof obj.message === 'string' ? obj.message : `Request failed (${fallbackStatus})`,
        code: typeof obj.code === 'string' ? obj.code : null,
      };
    }

    // Legacy shape: { error: "string" }
    if (typeof err === 'string') {
      return { message: err, code: null };
    }
  }

  return { message: `Request failed (${fallbackStatus})`, code: null };
}
