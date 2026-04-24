export type AIProvider = "openrouter" | "apipedia";

export const DEFAULT_OPENROUTER_MODEL = "google/gemini-2.5-flash-lite";
export const DEFAULT_APIPEDIA_MODEL = "google/gemini-2.5-flash-lite";

export function getDefaultModel(provider: AIProvider): string {
  return provider === "apipedia"
    ? DEFAULT_APIPEDIA_MODEL
    : DEFAULT_OPENROUTER_MODEL;
}
