"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { AppButton } from "@/components/AppButton";
import {
  recommendationRankingFieldGroups,
  type RecommendationRankingConfigData,
} from "@/lib/recommendations/config";
import {
  recommendationRankingConfigSchema,
  type RecommendationRankingConfigFormValues,
} from "@/lib/validations/recommendation-ranking";
import type { AdminRankingMutationResponse } from "@/types";

const fieldClasses =
  "w-full rounded-[1.25rem] border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-white/30 focus:bg-black/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-60";

export function RecommendationConfigForm({
  initialValues,
}: {
  initialValues: RecommendationRankingConfigData;
}) {
  const router = useRouter();
  const [formMessage, setFormMessage] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<RecommendationRankingConfigFormValues>({
    resolver: zodResolver(recommendationRankingConfigSchema),
    defaultValues: initialValues,
  });

  async function onSubmit(values: RecommendationRankingConfigFormValues) {
    setFormMessage(null);

    const response = await fetch("/api/admin/ranking/config", {
      method: "PATCH",
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

        setError(fieldName as keyof RecommendationRankingConfigFormValues, {
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
          "We could not update the ranking settings right now. Please try again.",
      });
      return;
    }

    setFormMessage({
      success: true,
      message: result.message,
    });
    router.refresh();
  }

  return (
    <form className="space-y-6" noValidate onSubmit={handleSubmit(onSubmit)}>
      {recommendationRankingFieldGroups.map((group) => (
        <section
          key={group.id}
          className="rounded-[1.75rem] border border-white/8 bg-black/24 p-5 sm:p-6"
        >
          <div className="max-w-3xl">
            <p className="text-xs font-medium uppercase tracking-[0.32em] text-white/42">
              {group.title}
            </p>
            <p className="mt-3 text-sm leading-7 text-white/62">
              {group.description}
            </p>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            {group.fields.map((field) => (
              <div key={field.name} className="space-y-2">
                <label
                  className="text-[0.72rem] font-medium uppercase tracking-[0.24em] text-white/50"
                  htmlFor={`ranking-field-${field.name}`}
                >
                  {field.label}
                </label>
                <input
                  {...register(field.name, {
                    valueAsNumber: true,
                  })}
                  id={`ranking-field-${field.name}`}
                  className={fieldClasses}
                  disabled={isSubmitting}
                  max={field.max}
                  min={field.min}
                  step={field.step}
                  type="number"
                />
                {errors[field.name] ? (
                  <p className="text-sm text-rose-300">
                    {errors[field.name]?.message}
                  </p>
                ) : (
                  <p className="text-sm leading-6 text-white/54">
                    {field.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      ))}

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

      <div className="rounded-[1.75rem] border border-white/8 bg-black/24 p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-7 text-white/60">
            These weights update the shared scoring model used by personalized
            recommendations, contextual recommendation modules, and search discovery ordering.
          </p>
          <AppButton disabled={isSubmitting || !isDirty} type="submit">
            {isSubmitting ? "Saving Ranking Settings..." : "Save Ranking Settings"}
          </AppButton>
        </div>
      </div>
    </form>
  );
}
