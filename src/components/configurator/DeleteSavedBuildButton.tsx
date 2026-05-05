"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import type { SavedBuildMutationResponse } from "@/types";

interface DeleteSavedBuildButtonProps {
  buildId: string;
  buildTitle: string;
  redirectTo?: string;
}

export function DeleteSavedBuildButton({
  buildId,
  buildTitle,
  redirectTo,
}: DeleteSavedBuildButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleDelete() {
    const confirmed = window.confirm(
      `Delete ${buildTitle}? This will remove the saved build from your account.`,
    );

    if (!confirmed) {
      return;
    }

    setErrorMessage(null);

    const response = await fetch(`/api/builds/${buildId}`, {
      method: "DELETE",
    });
    const result = (await response.json().catch(() => null)) as
      | SavedBuildMutationResponse
      | null;

    if (!response.ok || !result?.success) {
      setErrorMessage(
        result?.message ??
          "We could not remove this build right now. Please try again.",
      );
      return;
    }

    startTransition(() => {
      if (redirectTo) {
        router.push(redirectTo);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        className="inline-flex min-h-[3rem] w-full items-center justify-center rounded-full border border-rose-300/20 bg-rose-300/10 px-5 text-sm font-medium text-rose-100 transition hover:bg-rose-300/16 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isPending}
        onClick={handleDelete}
      >
        {isPending ? "Removing Build..." : "Delete Saved Build"}
      </button>

      {errorMessage ? (
        <p className="text-sm leading-6 text-rose-200">{errorMessage}</p>
      ) : null}
    </div>
  );
}
