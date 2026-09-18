const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const SYSTEM_INSTRUCTION = `You generate short, self-contained HTML animations.
Rules:
- Return a single complete HTML document: <!doctype html>, <html>, <head>, <body>.
- All CSS must be inline in a <style> tag and all JS inline in a <script> tag — no external files, no CDN links.
- The animation should visually represent the user's context.
- Do not include any explanation, markdown formatting, or code fences — output raw HTML only.`;

export class GeminiApiError extends Error {}

function extractHtml(rawText: string): string {
  const fenced = rawText.match(/```(?:html)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : rawText;
  return candidate.trim();
}

export async function generateHtmlAnimation(
  apiKey: string,
  context: string,
): Promise<string> {
  if (!apiKey) {
    throw new GeminiApiError("Missing Gemini API key.");
  }

  const response = await fetch(`${GEMINI_ENDPOINT}?key=${encodeURIComponent(apiKey)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: SYSTEM_INSTRUCTION }],
      },
      contents: [
        {
          role: "user",
          parts: [{ text: context }],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    throw new GeminiApiError(
      `Gemini request failed (${response.status}): ${errorBody || response.statusText}`,
    );
  }

  const data = await response.json();
  const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new GeminiApiError("Gemini returned no content.");
  }

  return extractHtml(text);
}
