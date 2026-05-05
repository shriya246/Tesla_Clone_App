"use client";

import Link from "next/link";
import { useState } from "react";

import type {
  SavedBuildMutationResponse,
  VehicleBuildSelectionIds,
} from "@/types";

interface SaveBuildButtonProps {
  vehicleSlug: string;
  selectionIds: VehicleBuildSelectionIds;
  buildLabel?: string;
  isSignedIn: boolean;
  signInHref: string;
  saveLabel?: string;
}

export function SaveBuildButton({
  vehicleSlug,
  selectionIds,
  buildLabel,
  isSignedIn,
  signInHref,
  saveLabel = "Save Build",
}: SaveBuildButtonProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [responseState, setResponseState] =
    useState<SavedBuildMutationResponse | null>(null);

  async function handleSave() {
    if (!isSignedIn) {
      setResponseState({
        success: false,
        message: "Sign in to save this build to your account.",
        redirectTo: signInHref,
      });
      return;
    }

    setIsSubmitting(true);
    setResponseState(null);

    const response = await fetch("/api/builds", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        vehicleSlug,
        buildLabel,
        selectionIds,
      }),
    });

    const result = (await response.json().catch(() => null)) as
      | SavedBuildMutationResponse
      | null;

    setResponseState(
      result ?? {
        success: false,
        message: "We could not save this build right now. Please try again.",
      },
    );
    setIsSubmitting(false);
  }

  return (
    <div className="space-y-4">
      {!isSignedIn ? (
        <div className="rounded-[1.5rem] border border-white/10 bg-black/24 px-5 py-4 text-sm leading-6 text-white/68">
          Save this configuration to your account after signing in.
          <div className="mt-4">
            <Link
              href={signInHref}
              className="inline-flex min-h-[3rem] items-center justify-center rounded-full border border-white/10 bg-white px-5 text-sm font-medium text-slate-950 transition hover:bg-white/90"
            >
              Sign In to Save
            </Link>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="inline-flex min-h-[3.125rem] w-full items-center justify-center rounded-full bg-white px-6 text-sm font-medium tracking-[0.02em] text-slate-950 shadow-[0_12px_40px_rgba(255,255,255,0.14)] transition duration-300 ease-out hover:-translate-y-0.5 hover:bg-white/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isSubmitting}
          onClick={handleSave}
        >
          {isSubmitting ? "Saving Build..." : saveLabel}
        </button>
      )}

      {responseState ? (
        <div
          className={`rounded-[1.5rem] border px-5 py-4 text-sm leading-6 ${
            responseState.success
              ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-100"
              : "border-rose-400/30 bg-rose-400/10 text-rose-100"
          }`}
          aria-live="polite"
          role="status"
        >
          <p>{responseState.message}</p>

          {responseState.redirectTo ? (
            <div className="mt-4">
              <Link
                href={responseState.redirectTo}
                className="inline-flex min-h-[2.75rem] items-center justify-center rounded-full border border-current px-4 text-sm font-medium transition hover:bg-white/10"
              >
                {responseState.success ? "View Saved Build" : "Continue"}
              </Link>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
