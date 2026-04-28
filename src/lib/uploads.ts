import "server-only";

import type { UploadApiErrorResponse, UploadApiResponse } from "cloudinary";

import { getCloudinary } from "@/lib/cloudinary";

export const MAX_PRODUCT_IMAGE_BYTES = 10 * 1024 * 1024;
export const DEFAULT_PRODUCT_UPLOAD_FOLDER = "tesla-clone-app/products";

const allowedProductImageMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

export class UploadValidationError extends Error {}

export interface UploadedProductImage {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  bytes: number;
  format?: string;
  originalFilename?: string;
}

export function validateProductImageFile(file: File) {
  if (!allowedProductImageMimeTypes.has(file.type)) {
    throw new UploadValidationError(
      "Upload a JPG, PNG, WEBP, or AVIF image.",
    );
  }

  if (file.size > MAX_PRODUCT_IMAGE_BYTES) {
    throw new UploadValidationError("Image uploads must be 10MB or smaller.");
  }
}

async function uploadBuffer(options: {
  buffer: Buffer;
  fileName: string;
  folder: string;
}) {
  const cloudinary = getCloudinary();

  return new Promise<UploadApiResponse>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder,
        resource_type: "image",
        use_filename: true,
        unique_filename: true,
        overwrite: false,
        filename_override: options.fileName,
      },
      (
        error: UploadApiErrorResponse | undefined,
        result: UploadApiResponse | undefined,
      ) => {
        if (error) {
          reject(error);
          return;
        }

        if (!result) {
          reject(new Error("Cloudinary did not return an upload result."));
          return;
        }

        resolve(result);
      },
    );

    uploadStream.end(options.buffer);
  });
}

export async function uploadProductImage(
  file: File,
  folder = DEFAULT_PRODUCT_UPLOAD_FOLDER,
): Promise<UploadedProductImage> {
  validateProductImageFile(file);

  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await uploadBuffer({
    buffer,
    fileName: file.name,
    folder,
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
    bytes: result.bytes,
    format: result.format,
    originalFilename: result.original_filename,
  };
}
