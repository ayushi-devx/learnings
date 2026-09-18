import { useEffect, useState } from "react";
import { getGeminiApiKey, setGeminiApiKey } from "@/shared/lib/apiKeyStorage";

type Props = {
  isLoading: boolean;
  onSubmit: (apiKey: string, context: string) => void;
};

export function GenerateAnimationForm({ isLoading, onSubmit }: Props) {
  const [apiKey, setApiKey] = useState("");
  const [context, setContext] = useState("");

  useEffect(() => {
    setApiKey(getGeminiApiKey());
  }, []);

  function handleApiKeyChange(value: string) {
    setApiKey(value);
    setGeminiApiKey(value);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!apiKey.trim() || !context.trim()) return;
    onSubmit(apiKey.trim(), context.trim());
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-xl flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="gemini-api-key" className="text-sm text-slate-400">
          Gemini API key
        </label>
        <input
          id="gemini-api-key"
          type="password"
          value={apiKey}
          onChange={(e) => handleApiKeyChange(e.target.value)}
          placeholder="Paste your Gemini API key"
          className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none focus:border-slate-500"
        />
        <span className="text-xs text-slate-500">
          Stored only in this browser's local storage. Never sent anywhere except Google's Gemini API.
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="context" className="text-sm text-slate-400">
          Describe the animation
        </label>
        <textarea
          id="context"
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="e.g. A rocket launching off the ground into space"
          rows={6}
          className="resize-y rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none focus:border-slate-500"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="rounded-md bg-indigo-600 px-4 py-2 font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? "Generating..." : "Generate animation"}
      </button>
    </form>
  );
}
