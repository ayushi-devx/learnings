import { useCallback, useState } from "react";
import { generateHtmlAnimation } from "@/shared/api/geminiClient";

export function useGenerateAnimation() {
  const [html, setHtml] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (apiKey: string, context: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await generateHtmlAnimation(apiKey, context);
      setHtml(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { html, isLoading, error, generate };
}
