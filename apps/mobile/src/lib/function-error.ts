import { FunctionsHttpError } from '@supabase/supabase-js';

/** Matches every Edge Function's {error:{code,message}} response shape (docs/edge-functions.md). */
export type EdgeFunctionError = { code: string; message: string };

/**
 * Extracts {code,message} from a FunctionsHttpError's response body, if it
 * matches our Edge Functions' error convention. Returns null for anything
 * else (network failure, a non-JSON body, an unexpected shape) so callers
 * can fall back to a generic message.
 */
export async function parseFunctionError(error: unknown): Promise<EdgeFunctionError | null> {
  if (!(error instanceof FunctionsHttpError)) return null;
  try {
    const response = error.context as Response;
    const body: unknown = await response.json();
    if (body && typeof body === 'object' && 'error' in body) {
      const inner = (body as { error?: unknown }).error;
      if (
        inner &&
        typeof inner === 'object' &&
        'code' in inner &&
        'message' in inner &&
        typeof (inner as { code: unknown }).code === 'string' &&
        typeof (inner as { message: unknown }).message === 'string'
      ) {
        return inner as EdgeFunctionError;
      }
    }
  } catch {
    // Body wasn't JSON, or didn't match the expected shape.
  }
  return null;
}
