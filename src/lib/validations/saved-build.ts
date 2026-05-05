import { z } from "zod";

const buildOptionKeyValues = [
  "trim",
  "range",
  "exteriorColor",
  "interior",
] as const;

const buildOptionSelectionSchema = z.object({
  key: z.enum(buildOptionKeyValues),
  label: z.string().trim().min(1).max(80),
  optionId: z.string().trim().min(1).max(120),
  optionLabel: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(500),
  priceDelta: z.number().finite().min(0).max(50000),
  swatch: z.string().trim().max(40).optional(),
  badge: z.string().trim().max(40).optional(),
});

export const vehicleBuildSelectionIdsSchema = z.object({
  trim: z.string().trim().min(1).max(120),
  range: z.string().trim().min(1).max(120),
  exteriorColor: z.string().trim().min(1).max(120),
  interior: z.string().trim().min(1).max(120),
});

export const savedBuildSelectedOptionsSchema = z.object({
  trim: buildOptionSelectionSchema.extend({
    key: z.literal("trim"),
  }),
  range: buildOptionSelectionSchema.extend({
    key: z.literal("range"),
  }),
  exteriorColor: buildOptionSelectionSchema.extend({
    key: z.literal("exteriorColor"),
  }),
  interior: buildOptionSelectionSchema.extend({
    key: z.literal("interior"),
  }),
});

export const saveBuildPayloadSchema = z.object({
  vehicleSlug: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  buildLabel: z
    .string()
    .trim()
    .max(80, "Build name is too long.")
    .transform((value) => (value === "" ? undefined : value))
    .optional(),
  selectionIds: vehicleBuildSelectionIdsSchema,
});

export type SaveBuildPayloadValues = z.infer<typeof saveBuildPayloadSchema>;
