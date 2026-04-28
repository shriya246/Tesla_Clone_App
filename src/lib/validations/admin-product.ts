import { z } from "zod";

import { isMediaUrl } from "@/lib/media";

const itemTypeSchema = z.enum(["VEHICLE", "ENERGY_PRODUCT", "SHOP_PRODUCT"]);
const detailSpecSchema = z.object({
  label: z.string().trim().min(1, "Each spec needs a label."),
  value: z.string().trim().min(1, "Each spec needs a value."),
});
const detailFeatureSchema = z.object({
  title: z.string().trim().min(1, "Each feature needs a title."),
  description: z.string().trim().min(1, "Each feature needs a description."),
});
const detailSpecListSchema = z.array(detailSpecSchema);
const detailFeatureListSchema = z.array(detailFeatureSchema);

function requireTrimmedString(
  fieldLabel: string,
  minimumLength = 1,
  maximumLength = 5000,
) {
  return z
    .string()
    .trim()
    .min(minimumLength, `${fieldLabel} is required.`)
    .max(maximumLength, `${fieldLabel} is too long.`);
}

function parseJsonField<T>(
  value: string,
  schema: z.ZodType<T>,
  fieldLabel: string,
  path: (string | number)[],
  ctx?: z.RefinementCtx,
) {
  let parsedJson: unknown;

  try {
    parsedJson = JSON.parse(value);
  } catch {
    if (ctx) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${fieldLabel} must be valid JSON.`,
        path,
      });
    }

    return null;
  }

  const parsedValue = schema.safeParse(parsedJson);

  if (!parsedValue.success) {
    if (ctx) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${fieldLabel} must match the expected JSON shape.`,
        path,
      });
    }

    return null;
  }

  return parsedValue.data;
}

export const adminProductFormSchema = z
  .object({
    itemType: itemTypeSchema,
    title: requireTrimmedString("Title", 2, 120),
    slug: z
      .string()
      .trim()
      .min(2, "Slug is required.")
      .max(120, "Slug is too long.")
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Use lowercase letters, numbers, and hyphens only.",
      ),
    image: z
      .string()
      .trim()
      .min(1, "Image URL is required.")
      .refine(
        (value) => isMediaUrl(value),
        "Use a public https URL or a local /images path.",
      ),
    subtitle: z.string().trim().max(240, "Subtitle is too long.").default(""),
    description: z
      .string()
      .trim()
      .max(5000, "Description is too long.")
      .default(""),
    longDescription: z
      .string()
      .trim()
      .max(10000, "Long description is too long.")
      .default(""),
    price: z.string().trim().max(120, "Price is too long.").default(""),
    primaryButton: requireTrimmedString("Primary button label", 2, 80),
    secondaryButton: requireTrimmedString("Secondary button label", 2, 80),
    badge: z.string().trim().max(80, "Badge is too long.").default(""),
    specsInput: z.string().trim().default("[]"),
    highlightsInput: z.string().trim().default("[]"),
    detailFeaturesInput: z.string().trim().default("[]"),
  })
  .superRefine((values, ctx) => {
    if (values.itemType === "VEHICLE") {
      if (!values.subtitle) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Subtitle is required for vehicles.",
          path: ["subtitle"],
        });
      }

      if (!values.description) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Long description is required for vehicles.",
          path: ["description"],
        });
      }

      if (!values.price) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Price is required for vehicles.",
          path: ["price"],
        });
      }

      parseJsonField(
        values.specsInput,
        detailSpecListSchema,
        "Vehicle specs",
        ["specsInput"],
        ctx,
      );
      parseJsonField(
        values.highlightsInput,
        detailFeatureListSchema,
        "Vehicle highlights",
        ["highlightsInput"],
        ctx,
      );

      return;
    }

    if (!values.description) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Description is required.",
        path: ["description"],
      });
    }

    if (!values.longDescription) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Long description is required.",
        path: ["longDescription"],
      });
    }

    parseJsonField(
      values.highlightsInput,
      detailFeatureListSchema,
      "Highlights",
      ["highlightsInput"],
      ctx,
    );

    if (values.itemType === "ENERGY_PRODUCT") {
      parseJsonField(
        values.detailFeaturesInput,
        detailFeatureListSchema,
        "Supporting features",
        ["detailFeaturesInput"],
        ctx,
      );

      return;
    }

    if (!values.price) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Price is required for shop products.",
        path: ["price"],
      });
    }

    parseJsonField(
      values.detailFeaturesInput,
      detailSpecListSchema,
      "Shop specs",
      ["detailFeaturesInput"],
      ctx,
    );
  });

export type AdminProductFormValues = z.input<typeof adminProductFormSchema>;

export interface PersistedAdminProductInput {
  itemType: z.infer<typeof itemTypeSchema>;
  title: string;
  slug: string;
  image: string;
  subtitle?: string;
  description: string;
  longDescription?: string;
  price?: string;
  primaryButton: string;
  secondaryButton: string;
  badge?: string;
  specs: Array<{ label: string; value: string }>;
  highlights: Array<{ title: string; description: string }>;
  detailFeatures: Array<
    | { title: string; description: string }
    | { label: string; value: string }
  >;
}

export function parseAdminProductPayload(
  input: unknown,
): PersistedAdminProductInput {
  const values = adminProductFormSchema.parse(input);

  if (values.itemType === "VEHICLE") {
    return {
      itemType: values.itemType,
      title: values.title,
      slug: values.slug,
      image: values.image,
      subtitle: values.subtitle,
      description: values.description,
      price: values.price,
      primaryButton: values.primaryButton,
      secondaryButton: values.secondaryButton,
      specs:
        parseJsonField(
          values.specsInput,
          detailSpecListSchema,
          "Vehicle specs",
          ["specsInput"],
        ) ?? [],
      highlights:
        parseJsonField(
          values.highlightsInput,
          detailFeatureListSchema,
          "Vehicle highlights",
          ["highlightsInput"],
        ) ?? [],
      detailFeatures: [],
    };
  }

  if (values.itemType === "ENERGY_PRODUCT") {
    return {
      itemType: values.itemType,
      title: values.title,
      slug: values.slug,
      image: values.image,
      description: values.description,
      longDescription: values.longDescription,
      primaryButton: values.primaryButton,
      secondaryButton: values.secondaryButton,
      specs: [],
      highlights:
        parseJsonField(
          values.highlightsInput,
          detailFeatureListSchema,
          "Highlights",
          ["highlightsInput"],
        ) ?? [],
      detailFeatures:
        parseJsonField(
          values.detailFeaturesInput,
          detailFeatureListSchema,
          "Supporting features",
          ["detailFeaturesInput"],
        ) ?? [],
    };
  }

  return {
    itemType: values.itemType,
    title: values.title,
    slug: values.slug,
    image: values.image,
    description: values.description,
    longDescription: values.longDescription,
    price: values.price,
    primaryButton: values.primaryButton,
    secondaryButton: values.secondaryButton,
    badge: values.badge,
    specs: [],
    highlights:
      parseJsonField(
        values.highlightsInput,
        detailFeatureListSchema,
        "Highlights",
        ["highlightsInput"],
      ) ?? [],
    detailFeatures:
      parseJsonField(
        values.detailFeaturesInput,
        detailSpecListSchema,
        "Shop specs",
        ["detailFeaturesInput"],
      ) ?? [],
  };
}

export function formatJsonInput(value: unknown) {
  return JSON.stringify(value ?? [], null, 2);
}

export function getAdminProductFormDefaults(
  itemType: AdminProductFormValues["itemType"],
): AdminProductFormValues {
  return {
    itemType,
    title: "",
    slug: "",
    image: "",
    subtitle: "",
    description: "",
    longDescription: "",
    price: "",
    primaryButton: "",
    secondaryButton: "",
    badge: "",
    specsInput: "[]",
    highlightsInput: "[]",
    detailFeaturesInput: "[]",
  };
}
