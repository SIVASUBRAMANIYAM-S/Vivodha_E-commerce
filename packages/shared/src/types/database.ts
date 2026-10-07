/**
 * PLACEHOLDER. Replaced in Phase 1 by `pnpm db:types`
 * (supabase gen types typescript --linked). Do not hand-edit after generation.
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
