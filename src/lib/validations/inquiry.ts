import { z } from "zod";

export const inquiryTypeValues = [
  "VEHICLE_DEMO_REQUEST",
  "PRODUCT_INQUIRY",
  "ENERGY_CONSULTATION",
  "GENERAL",
] as const;

export const inquiryItemTypeValues = [
  "VEHICLE",
  "ENERGY_PRODUCT",
  "SHOP_PRODUCT",
] as const;

const optionalPhoneSchema = z
  .string()
  .trim()
  .max(30, "Phone number is too long.")
  .refine(
    (value) => value === "" || /^[+0-9().\-\s]{7,30}$/.test(value),
    "Enter a valid phone number.",
  )
  .transform((value) => (value === "" ? undefined : value))
  .optional();

const optionalSlugSchema = z
  .string()
  .trim()
  .max(120, "Product slug is too long.")
  .transform((value) => (value === "" ? undefined : value))
  .optional();

export const inquiryFormFieldsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please enter your full name.")
    .max(80, "Name is too long."),
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address.")
    .max(120, "Email address is too long."),
  phone: optionalPhoneSchema,
  message: z
    .string()
    .trim()
    .min(12, "Please share a bit more detail so we can help.")
    .max(1200, "Message is too long."),
  website: z.string().trim().max(0).optional(),
});

export const inquiryPayloadSchema = inquiryFormFieldsSchema.extend({
  type: z.enum(inquiryTypeValues),
  itemType: z.enum(inquiryItemTypeValues).optional(),
  productSlug: optionalSlugSchema,
});

export type InquiryFormValues = z.infer<typeof inquiryFormFieldsSchema>;
export type InquiryPayloadValues = z.infer<typeof inquiryPayloadSchema>;
