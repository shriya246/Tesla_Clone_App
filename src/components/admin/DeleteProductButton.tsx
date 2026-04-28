"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import type {
  AdminProductCategory,
  AdminProductMutationResponse,
} from "@/types";

interface DeleteProductButtonProps {
  category: AdminProductCategory;
  id: string;
  title: string;
  redirectTo?: string;
  compact?: boolean;
}

export function DeleteProductButton({
  category,
  id,
  title,
  redirectTo,
  compact = false,
}: DeleteProductButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleDelete() {
    const confirmed = window.confirm(
      `Delete ${title}? This removes it from the admin catalog and public product routes.`,
    );

    if (!confirmed) {
      return;
    }

    setErrorMessage(null);

    const response = await fetch(`/api/admin/products/${category}/${id}`, {
      method: "DELETE",
    });

    const result = (await response.json().catch(() => null)) as
      | AdminProductMutationResponse
      | null;

    if (!response.ok || !result?.success) {
      setErrorMessage(
        result?.message ??
          "We could not delete this product right now. Please try again.",
      );
      return;
    }

    startTransition(() => {
      if (redirectTo) {
        router.push(redirectTo);
      }

      router.refresh();
    });
  }

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      <button
        type="button"
        className={[
          "inline-flex min-h-[3rem] items-center justify-center rounded-full border border-rose-300/20 bg-rose-300/10 px-5 text-sm font-medium text-rose-100 transition hover:bg-rose-300/16 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-100 disabled:cursor-not-allowed disabled:opacity-60",
          compact ? "w-full sm:w-auto" : "w-full",
        ].join(" ")}
        disabled={isPending}
        onClick={handleDelete}
      >
        {isPending ? "Deleting Product..." : "Delete Product"}
      </button>

      {errorMessage ? (
        <p className="text-sm leading-6 text-rose-200">{errorMessage}</p>
      ) : null}
    </div>
  );
}
