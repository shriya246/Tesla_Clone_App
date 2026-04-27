import { AppButton } from "@/components/AppButton";
import type { PageHeaderData } from "@/types";

interface PageHeaderProps {
  header: PageHeaderData;
}

export function PageHeader({ header }: PageHeaderProps) {
  return (
    <section
      className="section-shell relative overflow-hidden pt-32 pb-14 sm:pb-20"
      style={{
        backgroundColor: "#06070a",
        backgroundImage: header.image
          ? `linear-gradient(to bottom, rgba(6, 7, 10, 0.58), rgba(6, 7, 10, 0.84)), url(${header.image})`
          : "linear-gradient(to bottom, rgba(17, 24, 39, 0.92), rgba(6, 7, 10, 1))",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_34%)]" />

      <div className="relative mx-auto max-w-6xl rounded-[2rem] border border-white/10 bg-black/16 px-6 py-10 text-center shadow-halo backdrop-blur-sm sm:px-10 sm:py-14">
        <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
          {header.title}
        </h1>

        <p className="mx-auto mt-5 max-w-3xl text-base text-white/72 sm:text-lg">
          {header.subtitle}
        </p>

        {(header.primaryButton || header.secondaryButton) && (
          <div className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
            {header.primaryButton ? (
              <AppButton href={header.primaryButton.href}>
                {header.primaryButton.label}
              </AppButton>
            ) : null}

            {header.secondaryButton ? (
              <AppButton
                href={header.secondaryButton.href}
                variant="secondary"
              >
                {header.secondaryButton.label}
              </AppButton>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}
