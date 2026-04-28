import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

import { hasCloudinaryEnv } from "@/lib/env";
import { requireAdminApiSession } from "@/lib/auth/require-admin-api";
import { isTrustedMutationOrigin } from "@/lib/security/request";
import { uploadProductImage, UploadValidationError } from "@/lib/uploads";
import type { AdminMediaUploadResponse } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const adminAccess = await requireAdminApiSession();

  if ("errorResponse" in adminAccess) {
    return adminAccess.errorResponse;
  }

  if (!isTrustedMutationOrigin(request)) {
    const response: AdminMediaUploadResponse = {
      success: false,
      message: "This request origin is not allowed.",
    };

    return NextResponse.json(response, { status: 403 });
  }

  if (!hasCloudinaryEnv) {
    const response: AdminMediaUploadResponse = {
      success: false,
      message:
        "Cloudinary is not configured yet. Add the CLOUDINARY_* variables to enable uploads.",
    };

    return NextResponse.json(response, { status: 503 });
  }

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    const response: AdminMediaUploadResponse = {
      success: false,
      message: "We could not read the uploaded file.",
    };

    return NextResponse.json(response, { status: 400 });
  }

  const file = formData.get("file");

  if (!(file instanceof File)) {
    const response: AdminMediaUploadResponse = {
      success: false,
      message: "Select an image file to upload.",
      fieldErrors: {
        file: ["Select an image file to upload."],
      },
    };

    return NextResponse.json(response, { status: 400 });
  }

  try {
    const uploadedImage = await uploadProductImage(file);
    const response: AdminMediaUploadResponse = {
      success: true,
      message: "Image uploaded successfully.",
      imageUrl: uploadedImage.url,
      publicId: uploadedImage.publicId,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    if (error instanceof UploadValidationError) {
      const response: AdminMediaUploadResponse = {
        success: false,
        message: error.message,
        fieldErrors: {
          file: [error.message],
        },
      };

      return NextResponse.json(response, { status: 400 });
    }

    Sentry.captureException(error);
    console.error("Cloudinary upload failed.", error);

    const response: AdminMediaUploadResponse = {
      success: false,
      message:
        "The image upload failed. Please try again with a different file or use a manual URL.",
    };

    return NextResponse.json(response, { status: 500 });
  }
}
