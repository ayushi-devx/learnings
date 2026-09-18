const GEMINI_API_KEY_STORAGE_KEY = "explainer-maker:gemini-api-key";

export function getGeminiApiKey(): string {
  try {
    return localStorage.getItem(GEMINI_API_KEY_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

export function setGeminiApiKey(apiKey: string): void {
  try {
    if (apiKey) {
      localStorage.setItem(GEMINI_API_KEY_STORAGE_KEY, apiKey);
    } else {
      localStorage.removeItem(GEMINI_API_KEY_STORAGE_KEY);
    }
  } catch {
    // Storage may be unavailable (private browsing, disabled cookies, etc.) — fail silently.
  }
}
