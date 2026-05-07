"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { AppButton } from "@/components/AppButton";
import type { ProductRankingOverrideData } from "@/lib/recommendations/config";
import {
  productRankingOverrideSchema,
  type ProductRankingOverrideFormValues,
} from "@/lib/validations/recommendation-ranking";
import type { FavoriteItemTypeValue, AdminRankingMutationResponse } from "@/types";

interface ProductOption {
  itemType: FavoriteItemTypeValue;
  slug: string;
  title: string;
  categoryLabel: string;
  href: string;
  engagementScore: number;
}

interface ProductRankingOverridesManagerProps {
  products: ProductOption[];
  overrides: ProductRankingOverrideData[];
}

const fieldClasses =
  "w-full rounded-[1.25rem] border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-white/30 focus:bg-black/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-60";

function buildOverrideKey(itemType: FavoriteItemTypeValue, slug: string) {
  return `${itemType}::${slug}`;
}

function getInitialOverrideValues(
  products: ProductOption[],
  overrideMap: Map<string, ProductRankingOverrideData>,
): ProductRankingOverrideFormValues {
  const firstProduct = products[0];

  if (!firstProduct) {
    return {
      itemType: "VEHICLE",
      itemSlug: "",
      pinned: false,
      boostScore: 0,
    };
  }

  const override = overrideMap.get(
    buildOverrideKey(firstProduct.itemType, firstProduct.slug),
  );

  return {
    itemType: firstProduct.itemType,
    itemSlug: firstProduct.slug,
    pinned: override?.pinned ?? false,
    boostScore: override?.boostScore ?? 0,
  };
}

export function ProductRankingOverridesManager({
  products,
  overrides,
}: ProductRankingOverridesManagerProps) {
  const router = useRouter();
  const [formMessage, setFormMessage] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [isRemovingKey, setIsRemovingKey] = useState<string | null>(null);
  const overrideMap = useMemo(
    () =>
      new Map(
        overrides.map((override) => [
          buildOverrideKey(override.itemType, override.itemSlug),
          override,
        ]),
      ),
    [overrides],
  );
  const productMap = useMemo(
    () =>
      new Map(
        products.map((product) => [
          buildOverrideKey(product.itemType, product.slug),
          product,
        ]),
      ),
    [products],
  );
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    clearErrors,
    control,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProductRankingOverrideFormValues>({
    resolver: zodResolver(productRankingOverrideSchema),
    defaultValues: getInitialOverrideValues(products, overrideMap),
  });
  const selectedItemType = useWatch({
    control,
    name: "itemType",
  });
  const selectedItemSlug = useWatch({
    control,
    name: "itemSlug",
  });
  const selectedProductKey =
    selectedItemType && selectedItemSlug
      ? buildOverrideKey(selectedItemType, selectedItemSlug)
      : "";

  function applyProductSelection(productKey: string) {
    const product = productMap.get(productKey);

    if (!product) {
      return;
    }

    const override = overrideMap.get(productKey);

    setValue("itemType", product.itemType, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue("itemSlug", product.slug, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue("pinned", override?.pinned ?? false, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue("boostScore", override?.boostScore ?? 0, {
      shouldDirty: true,
      shouldValidate: true,
    });
    clearErrors("itemSlug");
  }

  async function onSubmit(values: ProductRankingOverrideFormValues) {
    setFormMessage(null);

    const response = await fetch("/api/admin/ranking/overrides", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });
    const result = (await response.json().catch(() => null)) as
      | AdminRankingMutationResponse
      | null;

    if (result?.fieldErrors) {
      for (const [fieldName, messages] of Object.entries(result.fieldErrors)) {
        const firstMessage = messages?.[0];

        if (!firstMessage) {
          continue;
        }

        setError(fieldName as keyof ProductRankingOverrideFormValues, {
          type: "server",
          message: firstMessage,
        });
      }
    }

    if (!response.ok || !result?.success) {
      setFormMessage({
        success: false,
        message:
          result?.message ??
          "We could not update that product ranking override right now.",
      });
      return;
    }

    setFormMessage({
      success: true,
      message: result.message,
    });
    router.refresh();
  }

  async function removeOverride(override: ProductRankingOverrideData) {
    const overrideKey = buildOverrideKey(override.itemType, override.itemSlug);

    setIsRemovingKey(overrideKey);
    setFormMessage(null);

    try {
      const response = await fetch("/api/admin/ranking/overrides", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itemType: override.itemType,
          itemSlug: override.itemSlug,
          pinned: override.pinned,
          boostScore: override.boostScore,
        }),
      });
      const result = (await response.json().catch(() => null)) as
        | AdminRankingMutationResponse
        | null;

      if (!response.ok || !result?.success) {
        setFormMessage({
          success: false,
          message:
            result?.message ??
            "We could not remove that product ranking override right now.",
        });
        return;
      }

      setFormMessage({
        success: true,
        message: result.message,
      });
      router.refresh();
    } finally {
      setIsRemovingKey(null);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[1.75rem] border border-white/8 bg-black/24 p-5 sm:p-6">
        <div className="max-w-3xl">
          <p className="text-xs font-medium uppercase tracking-[0.32em] text-white/42">
            Product Promotion Controls
          </p>
          <h3 className="mt-4 text-2xl font-semibold tracking-tight text-white">
            Pin or boost a specific catalog item.
          </h3>
          <p className="mt-4 text-sm leading-7 text-white/62">
            Use this for targeted launches, seasonal pushes, or practical admin tuning
            when a specific product should surface more often in recommendations and search.
          </p>
        </div>

        {products.length === 0 ? (
          <div className="mt-6 rounded-[1.5rem] border border-dashed border-white/12 bg-white/[0.03] p-5 text-sm leading-6 text-white/62">
            Product overrides will become available once catalog items exist.
          </div>
        ) : (
          <form className="mt-6 space-y-5" noValidate onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <label
                className="text-[0.72rem] font-medium uppercase tracking-[0.24em] text-white/50"
                htmlFor="product-ranking-override-target"
              >
                Product
              </label>
              <select
                id="product-ranking-override-target"
                className={fieldClasses}
                disabled={isSubmitting}
                onChange={(event) => applyProductSelection(event.target.value)}
                value={selectedProductKey}
              >
                {products.map((product) => (
                  <option
                    key={buildOverrideKey(product.itemType, product.slug)}
                    value={buildOverrideKey(product.itemType, product.slug)}
                  >
                    {product.categoryLabel} - {product.title} ({product.slug})
                  </option>
                ))}
              </select>
              <input type="hidden" {...register("itemType")} />
              <input type="hidden" {...register("itemSlug")} />
              {errors.itemSlug ? (
                <p className="text-sm text-rose-300">{errors.itemSlug.message}</p>
              ) : (
                <p className="text-sm leading-6 text-white/54">
                  Stronger engagement items are listed first to make tuning faster.
                </p>
              )}
            </div>

            <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_180px]">
              <label className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] px-4 py-4 text-sm text-white/78">
                <span className="flex items-center gap-3">
                  <input
                    {...register("pinned")}
                    className="h-4 w-4 rounded border-white/20 bg-black/30 text-white"
                    disabled={isSubmitting}
                    type="checkbox"
                  />
                  Pin this product
                </span>
                <span className="mt-3 block text-sm leading-6 text-white/54">
                  Pinned items receive a fixed score lift in recommendations and search.
                </span>
              </label>

              <div className="space-y-2">
                <label
                  className="text-[0.72rem] font-medium uppercase tracking-[0.24em] text-white/50"
                  htmlFor="product-ranking-override-boost"
                >
                  Boost Score
                </label>
                <input
                  {...register("boostScore", {
                    valueAsNumber: true,
                  })}
                  id="product-ranking-override-boost"
                  className={fieldClasses}
                  disabled={isSubmitting}
                  max={20}
                  min={-20}
                  step={0.25}
                  type="number"
                />
                {errors.boostScore ? (
                  <p className="text-sm text-rose-300">{errors.boostScore.message}</p>
                ) : (
                  <p className="text-sm leading-6 text-white/54">
                    Negative values suppress an item. Positive values lift it.
                  </p>
                )}
              </div>
            </div>

            {formMessage ? (
              <div
                className={`rounded-[1.5rem] border px-5 py-4 text-sm leading-6 ${
                  formMessage.success
                    ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-100"
                    : "border-rose-400/30 bg-rose-400/10 text-rose-100"
                }`}
                aria-live="polite"
                role="status"
              >
                {formMessage.message}
              </div>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm leading-7 text-white/60">
                The selected product is updated directly against the shared ranking rules.
              </p>
              <AppButton disabled={isSubmitting || !isDirty} type="submit">
                {isSubmitting ? "Saving Override..." : "Save Product Override"}
              </AppButton>
            </div>
          </form>
        )}
      </section>

      <section className="rounded-[1.75rem] border border-white/8 bg-black/24 p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.32em] text-white/42">
              Active Overrides
            </p>
            <h3 className="mt-4 text-2xl font-semibold tracking-tight text-white">
              Current product-level ranking changes.
            </h3>
          </div>
          <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/62">
            {overrides.length} active override{overrides.length === 1 ? "" : "s"}
          </div>
        </div>

        {overrides.length === 0 ? (
          <div className="mt-6 rounded-[1.5rem] border border-dashed border-white/12 bg-white/[0.03] p-5 text-sm leading-6 text-white/62">
            No pinned or boosted products are active right now. The catalog is ranking
            entirely from shared rules and live engagement signals.
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {overrides.map((override) => {
              const overrideKey = buildOverrideKey(
                override.itemType,
                override.itemSlug,
              );
              const product = productMap.get(overrideKey);

              return (
                <article
                  key={overrideKey}
                  className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-4"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="inline-flex rounded-full border border-white/10 bg-black/24 px-3 py-1 text-[0.65rem] font-medium uppercase tracking-[0.22em] text-white/72">
                          {product?.categoryLabel ?? override.itemType}
                        </span>
                        {override.pinned ? (
                          <span className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/12 px-3 py-1 text-[0.65rem] font-medium uppercase tracking-[0.22em] text-emerald-100">
                            pinned
                          </span>
                        ) : null}
                        <span className="inline-flex rounded-full border border-white/10 bg-black/24 px-3 py-1 text-[0.65rem] font-medium uppercase tracking-[0.22em] text-white/68">
                          boost {override.boostScore.toFixed(2)}
                        </span>
                      </div>
                      <h4 className="mt-4 text-xl font-semibold tracking-tight text-white">
                        {product?.title ?? override.itemSlug}
                      </h4>
                      <p className="mt-2 text-sm text-white/58">{override.itemSlug}</p>
                      <p className="mt-3 text-sm leading-6 text-white/60">
                        Engagement score: {product?.engagementScore.toFixed(1) ?? "0.0"}
                      </p>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      {product ? (
                        <Link
                          href={product.href}
                          className="inline-flex min-h-[2.75rem] items-center justify-center rounded-full border border-white/10 bg-black/24 px-4 text-sm font-medium text-white/72 transition hover:border-white/18 hover:text-white"
                        >
                          View product
                        </Link>
                      ) : null}
                      <button
                        className="inline-flex min-h-[2.75rem] items-center justify-center rounded-full border border-white/10 bg-white/10 px-4 text-sm font-medium text-white/84 transition hover:bg-white/18 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={isSubmitting}
                        onClick={() => applyProductSelection(overrideKey)}
                        type="button"
                      >
                        Edit in form
                      </button>
                      <button
                        className="inline-flex min-h-[2.75rem] items-center justify-center rounded-full border border-rose-400/20 bg-rose-400/10 px-4 text-sm font-medium text-rose-100 transition hover:bg-rose-400/18 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={isRemovingKey === overrideKey}
                        onClick={() => removeOverride(override)}
                        type="button"
                      >
                        {isRemovingKey === overrideKey
                          ? "Removing..."
                          : "Remove override"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
