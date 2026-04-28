"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { AppButton } from "@/components/AppButton";
import { buildMediaBackgroundStyle, isRemoteMediaUrl } from "@/lib/media";
import {
  adminProductFormSchema,
  type AdminProductFormValues,
} from "@/lib/validations/admin-product";
import type {
  AdminMediaUploadResponse,
  AdminProductCategory,
  AdminProductMutationResponse,
} from "@/types";

interface AdminProductFormProps {
  mode: "create" | "edit";
  category: AdminProductCategory;
  initialValues: AdminProductFormValues;
  isCloudinaryConfigured: boolean;
  productId?: string;
  publicHref?: string;
  extraActions?: ReactNode;
}

const fieldClasses =
  "w-full rounded-[1.25rem] border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-white/30 focus:bg-black/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-60";
const labelClasses =
  "text-[0.72rem] font-medium uppercase tracking-[0.24em] text-white/50";
const helpTextClasses = "text-sm leading-6 text-white/54";

const jsonExampleText = {
  specs: `[\n  {\n    "label": "Range",\n    "value": "405 mi"\n  }\n]`,
  highlights: `[\n  {\n    "title": "Immersive cabin",\n    "description": "Panoramic comfort with a quiet electric drive experience."\n  }\n]`,
  supportingFeatures: `[\n  {\n    "title": "Backup resilience",\n    "description": "Keeps essential circuits supported during outages."\n  }\n]`,
};

const editableFieldNames: Array<keyof AdminProductFormValues> = [
  "title",
  "slug",
  "image",
  "subtitle",
  "description",
  "longDescription",
  "price",
  "primaryButton",
  "secondaryButton",
  "badge",
  "specsInput",
  "highlightsInput",
  "detailFeaturesInput",
];

function getCategoryTitle(itemType: AdminProductFormValues["itemType"]) {
  switch (itemType) {
    case "VEHICLE":
      return "Vehicle";
    case "ENERGY_PRODUCT":
      return "Energy Product";
    case "SHOP_PRODUCT":
      return "Shop Product";
  }
}

function getSubmitLabel(mode: AdminProductFormProps["mode"]) {
  return mode === "create" ? "Create Product" : "Save Product";
}

export function AdminProductForm({
  mode,
  category,
  initialValues,
  isCloudinaryConfigured,
  productId,
  publicHref,
  extraActions,
}: AdminProductFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [formMessage, setFormMessage] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [uploadMessage, setUploadMessage] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<AdminProductFormValues>({
    resolver: zodResolver(adminProductFormSchema),
    defaultValues: initialValues,
  });

  const itemType = useWatch({
    control,
    name: "itemType",
  });
  const imageValue = useWatch({
    control,
    name: "image",
  });
  const imageSourceLabel = !imageValue
    ? "Image pending"
    : isRemoteMediaUrl(imageValue)
      ? "Remote media URL"
      : "Local asset path";

  async function uploadSelectedFile() {
    const file = fileInputRef.current?.files?.[0];

    if (!file) {
      setUploadMessage({
        success: false,
        message: "Select an image file before uploading.",
      });
      setError("image", {
        type: "manual",
        message: "Select an image file before uploading.",
      });
      return;
    }

    setUploadMessage(null);
    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/admin/media", {
        method: "POST",
        body: formData,
      });
      const result = (await response.json().catch(() => null)) as
        | AdminMediaUploadResponse
        | null;

      if (!response.ok || !result?.success || !result.imageUrl) {
        const message =
          result?.fieldErrors?.file?.[0] ??
          result?.message ??
          "The image upload failed.";

        setUploadMessage({
          success: false,
          message,
        });
        setError("image", {
          type: "server",
          message,
        });
        return;
      }

      setValue("image", result.imageUrl, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      clearErrors("image");
      setUploadMessage({
        success: true,
        message: "Image uploaded and assigned to this product form.",
      });
    } catch {
      setUploadMessage({
        success: false,
        message: "The image upload failed. Please try again.",
      });
    } finally {
      setIsUploading(false);
    }
  }

  async function onSubmit(values: AdminProductFormValues) {
    setFormMessage(null);

    const endpoint =
      mode === "create"
        ? "/api/admin/products"
        : `/api/admin/products/${category}/${productId}`;
    const method = mode === "create" ? "POST" : "PATCH";

    const response = await fetch(endpoint, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });

    const result = (await response.json().catch(() => null)) as
      | AdminProductMutationResponse
      | null;

    for (const fieldName of editableFieldNames) {
      const fieldMessage = result?.fieldErrors?.[fieldName]?.[0];

      if (fieldMessage) {
        setError(fieldName, {
          type: "server",
          message: fieldMessage,
        });
      }
    }

    if (!response.ok || !result?.success) {
      setFormMessage({
        success: false,
        message:
          result?.message ??
          "We could not save this product right now. Please try again.",
      });
      return;
    }

    if (result.redirectTo) {
      router.push(result.redirectTo);
      router.refresh();
      return;
    }

    setFormMessage({
      success: true,
      message: result.message,
    });
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-halo backdrop-blur-sm sm:p-8">
        <div className="flex flex-col gap-4 border-b border-white/8 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.32em] text-white/42">
              {mode === "create" ? "New Product" : "Edit Product"}
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {getCategoryTitle(itemType)} media and catalog details.
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/68 sm:text-base">
              Keep the existing public routes intact while switching this product to
              a production-minded image source and DB-backed content entry.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/products"
              className="inline-flex min-h-[3rem] items-center justify-center rounded-full border border-white/10 bg-black/24 px-5 text-sm font-medium text-white/72 transition hover:border-white/18 hover:text-white"
            >
              Back to products
            </Link>
            {publicHref ? (
              <Link
                href={publicHref}
                className="inline-flex min-h-[3rem] items-center justify-center rounded-full border border-white/10 bg-white/10 px-5 text-sm font-medium text-white/84 transition hover:bg-white/18 hover:text-white"
              >
                View public page
              </Link>
            ) : null}
            {extraActions}
          </div>
        </div>

        <form className="mt-6 space-y-6" noValidate onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
            <div className="space-y-6">
              <section className="rounded-[1.75rem] border border-white/8 bg-black/24 p-5 sm:p-6">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className={labelClasses} htmlFor="admin-item-type">
                      Product Type
                    </label>
                    <input
                      id="admin-item-type"
                      className={`${fieldClasses} text-white/68`}
                      disabled
                      value={getCategoryTitle(itemType)}
                    />
                    <input type="hidden" {...register("itemType")} />
                  </div>

                  <div className="space-y-2">
                    <label className={labelClasses} htmlFor="admin-slug">
                      Slug
                    </label>
                    <input
                      {...register("slug")}
                      id="admin-slug"
                      className={fieldClasses}
                      disabled={isSubmitting}
                      placeholder="model-s"
                    />
                    {errors.slug ? (
                      <p className="text-sm text-rose-300">{errors.slug.message}</p>
                    ) : (
                      <p className={helpTextClasses}>
                        Lowercase letters, numbers, and hyphens only.
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className={labelClasses} htmlFor="admin-title">
                      Title
                    </label>
                    <input
                      {...register("title")}
                      id="admin-title"
                      className={fieldClasses}
                      disabled={isSubmitting}
                      placeholder="Model S"
                    />
                    {errors.title ? (
                      <p className="text-sm text-rose-300">{errors.title.message}</p>
                    ) : null}
                  </div>

                  {itemType === "VEHICLE" ? (
                    <div className="space-y-2">
                      <label className={labelClasses} htmlFor="admin-subtitle">
                        Subtitle
                      </label>
                      <input
                        {...register("subtitle")}
                        id="admin-subtitle"
                        className={fieldClasses}
                        disabled={isSubmitting}
                        placeholder="Plaid power with executive comfort."
                      />
                      {errors.subtitle ? (
                        <p className="text-sm text-rose-300">
                          {errors.subtitle.message}
                        </p>
                      ) : null}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label className={labelClasses} htmlFor="admin-description">
                        Description
                      </label>
                      <input
                        {...register("description")}
                        id="admin-description"
                        className={fieldClasses}
                        disabled={isSubmitting}
                        placeholder="Home backup and smarter energy control."
                      />
                      {errors.description ? (
                        <p className="text-sm text-rose-300">
                          {errors.description.message}
                        </p>
                      ) : null}
                    </div>
                  )}
                </div>

                {(itemType === "VEHICLE" || itemType === "SHOP_PRODUCT") && (
                  <div className="mt-5 grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className={labelClasses} htmlFor="admin-price">
                        Price
                      </label>
                      <input
                        {...register("price")}
                        id="admin-price"
                        className={fieldClasses}
                        disabled={isSubmitting}
                        placeholder="$79,990"
                      />
                      {errors.price ? (
                        <p className="text-sm text-rose-300">{errors.price.message}</p>
                      ) : null}
                    </div>

                    {itemType === "SHOP_PRODUCT" ? (
                      <div className="space-y-2">
                        <label className={labelClasses} htmlFor="admin-badge">
                          Badge
                        </label>
                        <input
                          {...register("badge")}
                          id="admin-badge"
                          className={fieldClasses}
                          disabled={isSubmitting}
                          placeholder="Best Seller"
                        />
                        {errors.badge ? (
                          <p className="text-sm text-rose-300">{errors.badge.message}</p>
                        ) : (
                          <p className={helpTextClasses}>
                            Optional short callout shown on shop cards.
                          </p>
                        )}
                      </div>
                    ) : null}
                  </div>
                )}

                {itemType === "VEHICLE" ? (
                  <div className="mt-5 space-y-2">
                    <label className={labelClasses} htmlFor="admin-vehicle-description">
                      Long Description
                    </label>
                    <textarea
                      {...register("description")}
                      id="admin-vehicle-description"
                      className={`${fieldClasses} min-h-[10rem] resize-y`}
                      disabled={isSubmitting}
                      placeholder="Describe the full vehicle story, ownership feel, and performance narrative."
                    />
                    {errors.description ? (
                      <p className="text-sm text-rose-300">{errors.description.message}</p>
                    ) : null}
                  </div>
                ) : (
                  <div className="mt-5 space-y-2">
                    <label className={labelClasses} htmlFor="admin-long-description">
                      Long Description
                    </label>
                    <textarea
                      {...register("longDescription")}
                      id="admin-long-description"
                      className={`${fieldClasses} min-h-[10rem] resize-y`}
                      disabled={isSubmitting}
                      placeholder="Describe the product in more depth for the detail page experience."
                    />
                    {errors.longDescription ? (
                      <p className="text-sm text-rose-300">
                        {errors.longDescription.message}
                      </p>
                    ) : null}
                  </div>
                )}
              </section>

              <section className="rounded-[1.75rem] border border-white/8 bg-black/24 p-5 sm:p-6">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className={labelClasses} htmlFor="admin-primary-button">
                      Primary Button
                    </label>
                    <input
                      {...register("primaryButton")}
                      id="admin-primary-button"
                      className={fieldClasses}
                      disabled={isSubmitting}
                      placeholder="Order Now"
                    />
                    {errors.primaryButton ? (
                      <p className="text-sm text-rose-300">
                        {errors.primaryButton.message}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <label className={labelClasses} htmlFor="admin-secondary-button">
                      Secondary Button
                    </label>
                    <input
                      {...register("secondaryButton")}
                      id="admin-secondary-button"
                      className={fieldClasses}
                      disabled={isSubmitting}
                      placeholder="Learn More"
                    />
                    {errors.secondaryButton ? (
                      <p className="text-sm text-rose-300">
                        {errors.secondaryButton.message}
                      </p>
                    ) : null}
                  </div>
                </div>
              </section>

              <section className="rounded-[1.75rem] border border-white/8 bg-black/24 p-5 sm:p-6">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.32em] text-white/42">
                    Structured Content
                  </p>
                  <p className="mt-3 text-sm leading-7 text-white/62">
                    These JSON fields keep the current detail-page architecture stable
                    while letting the product data stay fully database-backed.
                  </p>
                </div>

                {itemType === "VEHICLE" ? (
                  <div className="mt-5 grid gap-5">
                    <div className="space-y-2">
                      <label className={labelClasses} htmlFor="admin-specs">
                        Performance Specs JSON
                      </label>
                      <textarea
                        {...register("specsInput")}
                        id="admin-specs"
                        className={`${fieldClasses} min-h-[14rem] resize-y font-mono text-xs`}
                        disabled={isSubmitting}
                        placeholder={jsonExampleText.specs}
                      />
                      {errors.specsInput ? (
                        <p className="text-sm text-rose-300">{errors.specsInput.message}</p>
                      ) : (
                        <p className={helpTextClasses}>
                          Expected shape: <code>[&#123;&quot;label&quot;:&quot;Range&quot;,&quot;value&quot;:&quot;405 mi&quot;&#125;]</code>
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className={labelClasses} htmlFor="admin-highlights">
                        Highlights JSON
                      </label>
                      <textarea
                        {...register("highlightsInput")}
                        id="admin-highlights"
                        className={`${fieldClasses} min-h-[14rem] resize-y font-mono text-xs`}
                        disabled={isSubmitting}
                        placeholder={jsonExampleText.highlights}
                      />
                      {errors.highlightsInput ? (
                        <p className="text-sm text-rose-300">
                          {errors.highlightsInput.message}
                        </p>
                      ) : (
                        <p className={helpTextClasses}>
                          Expected shape: <code>[&#123;&quot;title&quot;:&quot;...&quot;,&quot;description&quot;:&quot;...&quot;&#125;]</code>
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="mt-5 grid gap-5">
                    <div className="space-y-2">
                      <label className={labelClasses} htmlFor="admin-highlights">
                        Highlights JSON
                      </label>
                      <textarea
                        {...register("highlightsInput")}
                        id="admin-highlights"
                        className={`${fieldClasses} min-h-[14rem] resize-y font-mono text-xs`}
                        disabled={isSubmitting}
                        placeholder={jsonExampleText.highlights}
                      />
                      {errors.highlightsInput ? (
                        <p className="text-sm text-rose-300">
                          {errors.highlightsInput.message}
                        </p>
                      ) : null}
                    </div>

                    <div className="space-y-2">
                      <label className={labelClasses} htmlFor="admin-detail-features">
                        {itemType === "ENERGY_PRODUCT"
                          ? "Supporting Features JSON"
                          : "Shop Specs JSON"}
                      </label>
                      <textarea
                        {...register("detailFeaturesInput")}
                        id="admin-detail-features"
                        className={`${fieldClasses} min-h-[14rem] resize-y font-mono text-xs`}
                        disabled={isSubmitting}
                        placeholder={
                          itemType === "ENERGY_PRODUCT"
                            ? jsonExampleText.supportingFeatures
                            : jsonExampleText.specs
                        }
                      />
                      {errors.detailFeaturesInput ? (
                        <p className="text-sm text-rose-300">
                          {errors.detailFeaturesInput.message}
                        </p>
                      ) : (
                        <p className={helpTextClasses}>
                          {itemType === "ENERGY_PRODUCT"
                            ? "Energy products expect title/description pairs."
                            : "Shop products expect label/value pairs."}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </section>
            </div>

            <aside className="space-y-6">
              <section className="rounded-[1.75rem] border border-white/8 bg-black/24 p-5 sm:p-6">
                <div
                  className="h-72 rounded-[1.5rem] border border-white/10"
                  style={buildMediaBackgroundStyle({
                    image: imageValue,
                    overlay:
                      "linear-gradient(to bottom, rgba(12, 15, 21, 0.14), rgba(12, 15, 21, 0.62))",
                    backgroundColor: "#0c0f15",
                  })}
                />
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <span className="inline-flex rounded-full border border-white/10 bg-white/10 px-4 py-1 text-[0.68rem] font-medium uppercase tracking-[0.24em] text-white/78">
                    {imageSourceLabel}
                  </span>
                  {imageValue ? (
                    <span className="text-xs uppercase tracking-[0.22em] text-white/42">
                      Preview ready
                    </span>
                  ) : (
                    <span className="text-xs uppercase tracking-[0.22em] text-white/42">
                      Add an image URL or upload a file
                    </span>
                  )}
                </div>
              </section>

              <section className="rounded-[1.75rem] border border-white/8 bg-black/24 p-5 sm:p-6">
                <p className="text-xs font-medium uppercase tracking-[0.32em] text-white/42">
                  Media
                </p>
                <h3 className="mt-4 text-2xl font-semibold tracking-tight text-white">
                  Assign a production-ready image.
                </h3>
                <p className="mt-4 text-sm leading-7 text-white/62">
                  Keep the image field DB-backed. You can upload to Cloudinary when it
                  is configured, or paste a public URL manually.
                </p>

                <div className="mt-5 space-y-2">
                  <label className={labelClasses} htmlFor="admin-image">
                    Image URL
                  </label>
                  <input
                    {...register("image")}
                    id="admin-image"
                    className={fieldClasses}
                    disabled={isSubmitting || isUploading}
                    placeholder="https://res.cloudinary.com/..."
                  />
                  {errors.image ? (
                    <p className="text-sm text-rose-300">{errors.image.message}</p>
                  ) : (
                    <p className={helpTextClasses}>
                      Supports Cloudinary delivery URLs and existing <code>/images/...</code>{" "}
                      paths.
                    </p>
                  )}
                </div>

                <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-white">
                        Cloudinary upload
                      </p>
                      <p className="mt-2 text-sm leading-6 text-white/60">
                        {isCloudinaryConfigured
                          ? "Upload a product image and automatically assign the returned URL."
                          : "Upload is disabled until the CLOUDINARY_* environment variables are configured."}
                      </p>
                    </div>
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-[0.65rem] font-medium uppercase tracking-[0.22em] ${
                        isCloudinaryConfigured
                          ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-100"
                          : "border-amber-300/20 bg-amber-300/10 text-amber-100"
                      }`}
                    >
                      {isCloudinaryConfigured ? "Enabled" : "Needs env"}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-col gap-3">
                    <input
                      ref={fileInputRef}
                      accept="image/png,image/jpeg,image/webp,image/avif"
                      className={fieldClasses}
                      disabled={!isCloudinaryConfigured || isSubmitting || isUploading}
                      type="file"
                    />
                    <AppButton
                      disabled={!isCloudinaryConfigured || isSubmitting || isUploading}
                      onClick={uploadSelectedFile}
                      type="button"
                    >
                      {isUploading ? "Uploading Image..." : "Upload to Cloudinary"}
                    </AppButton>
                  </div>

                  {uploadMessage ? (
                    <div
                      className={`mt-4 rounded-[1.25rem] border px-4 py-3 text-sm leading-6 ${
                        uploadMessage.success
                          ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-100"
                          : "border-rose-400/30 bg-rose-400/10 text-rose-100"
                      }`}
                    >
                      {uploadMessage.message}
                    </div>
                  ) : null}
                </div>
              </section>

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
                <p className="text-sm leading-7 text-white/60">
                  Saving here updates the database-backed product used by the public
                  listing and detail pages for this category.
                </p>
                <div className="mt-5 flex flex-col gap-3">
                  <AppButton disabled={isSubmitting || isUploading} type="submit">
                    {isSubmitting ? "Saving Product..." : getSubmitLabel(mode)}
                  </AppButton>
                </div>
              </div>
            </aside>
          </div>
        </form>
      </div>
    </div>
  );
}
