import { AppButton } from "@/components/AppButton";
import type { HeroSectionData } from "@/types";

interface HeroSectionProps {
  section: HeroSectionData;
}

export function HeroSection({ section }: HeroSectionProps) {
  return (
    <section
      className="section-shell relative flex min-h-screen items-center justify-center overflow-hidden py-24 text-center"
      style={{
        backgroundColor: "#06070a",
        backgroundImage: `linear-gradient(to bottom, rgba(6, 7, 10, 0.35), rgba(6, 7, 10, 0.78)), url(${section.image})`,
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.14),transparent_34%)]" />

      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center pt-20 sm:pt-16">
        <span className="mb-6 inline-flex items-center rounded-full border border-white/20 bg-black/20 px-4 py-1 text-[0.65rem] font-medium uppercase tracking-[0.32em] text-white/70 backdrop-blur-sm">
          Tesla Inspired Experience
        </span>

        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-7xl">
          {section.title}
        </h1>

        <p className="mt-4 max-w-xl text-base text-white/80 sm:text-lg">
          {section.subtitle}
        </p>

        <div className="mt-10 flex w-full max-w-md flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
          <AppButton>{section.primaryButton}</AppButton>
          <AppButton variant="secondary">{section.secondaryButton}</AppButton>
        </div>
      </div>
    </section>
  );
}
