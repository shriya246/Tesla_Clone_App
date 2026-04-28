interface RouteLoadingStateProps {
  eyebrow: string;
  title: string;
  description: string;
}

export function RouteLoadingState({
  eyebrow,
  title,
  description,
}: RouteLoadingStateProps) {
  return (
    <section className="section-shell py-20 lg:py-24">
      <div className="mx-auto max-w-5xl rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-halo backdrop-blur-sm sm:p-8 lg:p-10">
        <p className="text-xs font-medium uppercase tracking-[0.32em] text-white/42">
          {eyebrow}
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-white/68 sm:text-base">
          {description}
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="rounded-[1.75rem] border border-white/8 bg-black/24 p-5"
            >
              <div className="h-3 w-20 animate-pulse rounded-full bg-white/12" />
              <div className="mt-5 h-9 w-24 animate-pulse rounded-full bg-white/12" />
              <div className="mt-4 h-3 w-full animate-pulse rounded-full bg-white/10" />
              <div className="mt-2 h-3 w-4/5 animate-pulse rounded-full bg-white/10" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
