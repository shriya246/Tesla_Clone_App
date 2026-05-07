import {
  featureFlagConfig,
  getFeatureFlagActorFromSession,
  getFeatureFlags,
  type FeatureFlagKey,
} from "@/lib/flags";
import {
  env,
  getFeatureFlagBetaEmailList,
  getFeatureFlagBetaUserIdList,
} from "@/lib/env";
import { requireAdminSession } from "@/lib/auth/require-admin";

export const dynamic = "force-dynamic";

export default async function AdminFlagsPage() {
  const session = await requireAdminSession("/admin/flags");
  const flags = getFeatureFlags({
    actor: getFeatureFlagActorFromSession(session),
    path: "/admin/flags",
  });
  const flagKeys = Object.keys(featureFlagConfig) as FeatureFlagKey[];
  const betaEmailCount = getFeatureFlagBetaEmailList().length;
  const betaUserIdCount = getFeatureFlagBetaUserIdList().length;

  return (
    <section className="section-shell py-8 pb-16 lg:py-10 lg:pb-20">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-halo backdrop-blur-sm sm:p-8">
          <p className="text-xs font-medium uppercase tracking-[0.32em] text-white/42">
            Feature Flags
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Rollout state for the current admin session.
          </h2>
          <p className="mt-5 max-w-3xl text-sm leading-7 text-white/68 sm:text-base">
            This is a lightweight internal inspector for the app-managed flag
            foundation introduced in V0.6 Phase 1. It shows the current
            environment, rollout mode, beta allowlists, and which rule matched
            for each active flag.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-[1.5rem] border border-white/8 bg-black/24 p-5">
              <p className="text-[0.68rem] font-medium uppercase tracking-[0.24em] text-white/42">
                Environment
              </p>
              <p className="mt-4 text-3xl font-semibold tracking-tight text-white">
                {env.NODE_ENV}
              </p>
              <p className="mt-3 text-sm leading-6 text-white/62">
                Server-side flag evaluation environment.
              </p>
            </article>

            <article className="rounded-[1.5rem] border border-white/8 bg-black/24 p-5">
              <p className="text-[0.68rem] font-medium uppercase tracking-[0.24em] text-white/42">
                Default Mode
              </p>
              <p className="mt-4 text-3xl font-semibold tracking-tight text-white">
                {env.FEATURE_FLAGS_DEFAULT_MODE}
              </p>
              <p className="mt-3 text-sm leading-6 text-white/62">
                Stable keeps defaults tight. Preview expands rollout rules.
              </p>
            </article>

            <article className="rounded-[1.5rem] border border-white/8 bg-black/24 p-5">
              <p className="text-[0.68rem] font-medium uppercase tracking-[0.24em] text-white/42">
                Provider
              </p>
              <p className="mt-4 text-3xl font-semibold tracking-tight text-white">
                {env.FEATURE_FLAG_PROVIDER}
              </p>
              <p className="mt-3 text-sm leading-6 text-white/62">
                Internal today, with future external-provider scaffolding ready.
              </p>
            </article>

            <article className="rounded-[1.5rem] border border-white/8 bg-black/24 p-5">
              <p className="text-[0.68rem] font-medium uppercase tracking-[0.24em] text-white/42">
                Beta Allowlists
              </p>
              <p className="mt-4 text-3xl font-semibold tracking-tight text-white">
                {betaEmailCount + betaUserIdCount}
              </p>
              <p className="mt-3 text-sm leading-6 text-white/62">
                {betaEmailCount} email entries and {betaUserIdCount} user ID
                entries configured.
              </p>
            </article>
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-halo backdrop-blur-sm sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.32em] text-white/42">
                Current Evaluations
              </p>
              <h3 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                What this admin session can see right now.
              </h3>
            </div>
            <div className="rounded-[1.25rem] border border-white/10 bg-black/24 px-4 py-3 text-sm text-white/68">
              {session.user.email ?? "No admin email available"}
            </div>
          </div>

          <div className="mt-8 space-y-4">
            {flagKeys.map((key) => {
              const config = featureFlagConfig[key];
              const flag = flags[key];

              return (
                <article
                  key={key}
                  className="rounded-[1.75rem] border border-white/8 bg-black/24 p-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="max-w-3xl">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="inline-flex rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[0.65rem] font-medium uppercase tracking-[0.22em] text-white/72">
                          {flag.kind}
                        </span>
                        <span
                          className={[
                            "inline-flex rounded-full border px-3 py-1 text-[0.65rem] font-medium uppercase tracking-[0.22em]",
                            flag.enabled
                              ? "border-emerald-400/20 bg-emerald-400/12 text-emerald-100"
                              : "border-white/10 bg-white/[0.05] text-white/58",
                          ].join(" ")}
                        >
                          {flag.enabled ? "active" : "default"}
                        </span>
                      </div>

                      <h4 className="mt-4 text-2xl font-semibold tracking-tight text-white">
                        {key}
                      </h4>
                      <p className="mt-3 text-sm leading-6 text-white/68">
                        {config.description}
                      </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[360px]">
                      <div className="rounded-[1.25rem] border border-white/8 bg-white/[0.03] px-4 py-3">
                        <p className="text-[0.65rem] font-medium uppercase tracking-[0.22em] text-white/42">
                          Current
                        </p>
                        <p className="mt-2 text-base font-medium text-white">
                          {String(flag.value)}
                        </p>
                      </div>
                      <div className="rounded-[1.25rem] border border-white/8 bg-white/[0.03] px-4 py-3">
                        <p className="text-[0.65rem] font-medium uppercase tracking-[0.22em] text-white/42">
                          Default
                        </p>
                        <p className="mt-2 text-base font-medium text-white">
                          {String(config.defaultValue)}
                        </p>
                      </div>
                      <div className="rounded-[1.25rem] border border-white/8 bg-white/[0.03] px-4 py-3">
                        <p className="text-[0.65rem] font-medium uppercase tracking-[0.22em] text-white/42">
                          Matched Rule
                        </p>
                        <p className="mt-2 text-base font-medium text-white">
                          {flag.matchedRule ?? "default"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,0.3fr)]">
                    <div className="rounded-[1.25rem] border border-white/8 bg-white/[0.03] px-4 py-3">
                      <p className="text-[0.65rem] font-medium uppercase tracking-[0.22em] text-white/42">
                        Evaluation Reason
                      </p>
                      <p className="mt-2 text-sm leading-6 text-white/68">
                        {flag.reason}
                      </p>
                    </div>

                    {flag.options ? (
                      <div className="rounded-[1.25rem] border border-white/8 bg-white/[0.03] px-4 py-3">
                        <p className="text-[0.65rem] font-medium uppercase tracking-[0.22em] text-white/42">
                          Variants
                        </p>
                        <p className="mt-2 text-sm leading-6 text-white/68">
                          {flag.options.join(", ")}
                        </p>
                      </div>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </section>
  );
}
