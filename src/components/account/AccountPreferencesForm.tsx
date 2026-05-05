"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import type {
  AccountContinuityPreferences,
  AccountPreferencesActionState,
} from "@/lib/account/types";

interface AccountPreferencesFormProps {
  initialPreferences: AccountContinuityPreferences;
  action: (
    state: AccountPreferencesActionState,
    formData: FormData,
  ) => Promise<AccountPreferencesActionState>;
}

function SavePreferencesButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-[3rem] items-center justify-center rounded-full border border-white/10 bg-white px-5 text-sm font-medium text-slate-950 transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "Saving..." : "Save Preferences"}
    </button>
  );
}

const initialActionState: AccountPreferencesActionState = {
  success: false,
  message: "",
};

export function AccountPreferencesForm({
  initialPreferences,
  action,
}: AccountPreferencesFormProps) {
  const [state, formAction] = useActionState(action, initialActionState);

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <label className="flex items-start justify-between gap-4 rounded-[1.35rem] border border-white/10 bg-black/24 px-5 py-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-white">Build reminders</p>
          <p className="mt-2 text-sm leading-6 text-white/62">
            Keep lightweight continuity reminders enabled so recent saved builds
            stay surfaced more prominently across your account experience.
          </p>
        </div>
        <input
          type="checkbox"
          name="buildReminderOptIn"
          defaultChecked={initialPreferences.buildReminderOptIn}
          className="mt-1 h-5 w-5 rounded border-white/20 bg-black/30 text-slate-950 accent-white"
        />
      </label>

      <label className="flex items-start justify-between gap-4 rounded-[1.35rem] border border-white/10 bg-black/24 px-5 py-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-white">Product updates</p>
          <p className="mt-2 text-sm leading-6 text-white/62">
            Keep a basic preference marker for product follow-up and broader
            catalog updates without adding heavier notification workflows.
          </p>
        </div>
        <input
          type="checkbox"
          name="productUpdatesOptIn"
          defaultChecked={initialPreferences.productUpdatesOptIn}
          className="mt-1 h-5 w-5 rounded border-white/20 bg-black/30 text-slate-950 accent-white"
        />
      </label>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p
          className={`text-sm ${
            state.message
              ? state.success
                ? "text-emerald-200"
                : "text-rose-200"
              : "text-white/54"
          }`}
        >
          {state.message ||
            "These settings stay intentionally lightweight in V0.5."}
        </p>
        <SavePreferencesButton />
      </div>
    </form>
  );
}
