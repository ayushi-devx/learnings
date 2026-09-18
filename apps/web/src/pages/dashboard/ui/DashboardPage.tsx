import { GenerateAnimationForm, useGenerateAnimation } from "@/features/generate-animation";
import { AnimationPreview } from "@/widgets/animation-preview";

export function DashboardPage() {
  const { html, isLoading, error, generate } = useGenerateAnimation();

  return (
    <div className="flex min-h-screen flex-col items-center gap-8 bg-slate-950 px-4 py-12 text-white">
      <h1 className="text-3xl font-bold">Explainer Maker</h1>

      <GenerateAnimationForm isLoading={isLoading} onSubmit={generate} />

      {error && (
        <p className="w-full max-w-xl rounded-md border border-red-800 bg-red-950 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      <AnimationPreview html={html} />
    </div>
  );
}
