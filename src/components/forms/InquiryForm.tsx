"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { AppButton } from "@/components/AppButton";
import {
  inquiryFormFieldsSchema,
  type InquiryFormValues,
} from "@/lib/validations/inquiry";
import type { InquiryApiResponse, InquiryFormProps } from "@/types";

const fieldClasses =
  "w-full rounded-[1.25rem] border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-white/30 focus:bg-black/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-60";

const labelClasses =
  "text-[0.72rem] font-medium uppercase tracking-[0.24em] text-white/50";

export function InquiryForm({
  title,
  description,
  submitLabel,
  successTitle,
  successMessage,
  type,
  itemType,
  productSlug,
  contextLabel,
  contextValue,
  messageLabel = "Message",
  messagePlaceholder = "Tell us a little more about what you need.",
  defaultMessage = "",
}: InquiryFormProps) {
  const [responseState, setResponseState] = useState<InquiryApiResponse | null>(
    null,
  );

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<InquiryFormValues>({
    resolver: zodResolver(inquiryFormFieldsSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: defaultMessage,
    },
  });

  async function onSubmit(values: InquiryFormValues) {
    setResponseState(null);

    const response = await fetch("/api/inquiries", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...values,
        type,
        itemType,
        productSlug,
      }),
    });

    const result = (await response.json().catch(() => null)) as
      | InquiryApiResponse
      | null;

    if (!response.ok || !result?.success) {
      const fallbackMessage =
        result?.message ??
        "We could not send your request right now. Please try again.";

      const serverFieldErrors = result?.fieldErrors;

      for (const fieldName of ["name", "email", "phone", "message"] as const) {
        const fieldMessage = serverFieldErrors?.[fieldName]?.[0];

        if (fieldMessage) {
          setError(fieldName, {
            type: "server",
            message: fieldMessage,
          });
        }
      }

      setResponseState({
        success: false,
        message: fallbackMessage,
      });

      return;
    }

    reset({
      name: "",
      email: "",
      phone: "",
      message: defaultMessage,
    });

    setResponseState({
      success: true,
      message: result.message || successMessage,
    });
  }

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-halo backdrop-blur-sm sm:p-8">
      <div className="flex flex-col gap-4 border-b border-white/8 pb-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.32em] text-white/42">
            Inquiry
          </p>
          <h3 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {title}
          </h3>
          <p className="mt-4 text-sm leading-7 text-white/72 sm:text-base">
            {description}
          </p>
        </div>

        {contextValue ? (
          <div className="inline-flex w-fit flex-col rounded-[1.4rem] border border-white/10 bg-black/24 px-5 py-4">
            <span className="text-[0.65rem] font-medium uppercase tracking-[0.24em] text-white/40">
              {contextLabel ?? "Context"}
            </span>
            <span className="mt-2 text-sm font-medium text-white">
              {contextValue}
            </span>
          </div>
        ) : null}
      </div>

      <form className="mt-6 space-y-5" noValidate onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <label className={labelClasses} htmlFor={`${type}-name`}>
              Full Name
            </label>
            <input
              {...register("name")}
              autoComplete="name"
              className={fieldClasses}
              disabled={isSubmitting}
              id={`${type}-name`}
              placeholder="Taylor Morgan"
              type="text"
            />
            {errors.name ? (
              <p className="text-sm text-rose-300">{errors.name.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className={labelClasses} htmlFor={`${type}-email`}>
              Email
            </label>
            <input
              {...register("email")}
              autoComplete="email"
              className={fieldClasses}
              disabled={isSubmitting}
              id={`${type}-email`}
              placeholder="you@example.com"
              type="email"
            />
            {errors.email ? (
              <p className="text-sm text-rose-300">{errors.email.message}</p>
            ) : null}
          </div>
        </div>

        <div className="space-y-2">
          <label className={labelClasses} htmlFor={`${type}-phone`}>
            Phone <span className="text-white/28">(optional)</span>
          </label>
          <input
            {...register("phone")}
            autoComplete="tel"
            className={fieldClasses}
            disabled={isSubmitting}
            id={`${type}-phone`}
            placeholder="+1 (555) 123-4567"
            type="tel"
          />
          {errors.phone ? (
            <p className="text-sm text-rose-300">{errors.phone.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className={labelClasses} htmlFor={`${type}-message`}>
            {messageLabel}
          </label>
          <textarea
            {...register("message")}
            className={`${fieldClasses} min-h-[10rem] resize-y`}
            disabled={isSubmitting}
            id={`${type}-message`}
            placeholder={messagePlaceholder}
          />
          {errors.message ? (
            <p className="text-sm text-rose-300">{errors.message.message}</p>
          ) : null}
        </div>

        <div className="rounded-[1.4rem] border border-white/8 bg-black/24 px-5 py-4 text-sm leading-6 text-white/60">
          We will only use your information to follow up about this request and
          guide you to the right product or next step.
        </div>

        {responseState ? (
          <div
            className={`rounded-[1.4rem] border px-5 py-4 text-sm leading-6 ${
              responseState.success
                ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-100"
                : "border-rose-400/30 bg-rose-400/10 text-rose-100"
            }`}
            aria-live="polite"
            role="status"
          >
            {responseState.success ? (
              <p className="font-medium">{successTitle}</p>
            ) : null}
            <p className={responseState.success ? "mt-2" : ""}>
              {responseState.success ? successMessage : responseState.message}
            </p>
          </div>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-white/44">
            Required fields help us respond with the right context.
          </p>
          <AppButton disabled={isSubmitting} type="submit">
            {isSubmitting ? "Sending Request..." : submitLabel}
          </AppButton>
        </div>
      </form>
    </div>
  );
}
