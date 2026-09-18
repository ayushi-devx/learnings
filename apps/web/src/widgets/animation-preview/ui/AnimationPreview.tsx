import { useState } from "react";

type Props = {
  html: string;
};

export function AnimationPreview({ html }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(html);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API may be unavailable — user can still select the text manually.
    }
  }

  if (!html) return null;

  return (
    <div className="flex w-full max-w-4xl flex-col gap-4">
      <div className="flex flex-col gap-1">
        <span className="text-sm text-slate-400">Live preview</span>
        <iframe
          title="Animation preview"
          srcDoc={html}
          sandbox="allow-scripts"
          className="h-96 w-full rounded-md border border-slate-700 bg-white"
        />
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-400">Raw HTML</span>
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-md border border-slate-700 px-3 py-1 text-xs text-slate-300 transition hover:bg-slate-800"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        <textarea
          readOnly
          value={html}
          rows={12}
          className="resize-y rounded-md border border-slate-700 bg-slate-900 px-3 py-2 font-mono text-xs text-slate-300 outline-none"
        />
      </div>
    </div>
  );
}
