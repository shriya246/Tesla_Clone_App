import "server-only";

import { v2 as cloudinary } from "cloudinary";

import { hasCloudinaryEnv, requireServerEnv } from "@/lib/env";

let cloudinaryConfigured = false;

function configureCloudinary() {
  if (!cloudinaryConfigured) {
    cloudinary.config({
      cloud_name: requireServerEnv("CLOUDINARY_CLOUD_NAME"),
      api_key: requireServerEnv("CLOUDINARY_API_KEY"),
      api_secret: requireServerEnv("CLOUDINARY_API_SECRET"),
      secure: true,
    });

    cloudinaryConfigured = true;
  }

  return cloudinary;
}

export function getCloudinary() {
  if (!hasCloudinaryEnv) {
    throw new Error(
      "Cloudinary is not configured. Add the CLOUDINARY_* environment variables to enable uploads.",
    );
  }

  return configureCloudinary();
}
