const serverEnvNames = [
  "DATABASE_URL",
  "AUTH_SECRET",
  "AUTH_GOOGLE_ID",
  "AUTH_GOOGLE_SECRET",
  "ADMIN_EMAILS",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
] as const;

type ServerEnvName = (typeof serverEnvNames)[number];

function getOptionalEnv(name: ServerEnvName) {
  const value = process.env[name]?.trim();

  return value ? value : undefined;
}

export const env = {
  DATABASE_URL: getOptionalEnv("DATABASE_URL"),
  AUTH_SECRET: getOptionalEnv("AUTH_SECRET"),
  AUTH_GOOGLE_ID: getOptionalEnv("AUTH_GOOGLE_ID"),
  AUTH_GOOGLE_SECRET: getOptionalEnv("AUTH_GOOGLE_SECRET"),
  ADMIN_EMAILS: getOptionalEnv("ADMIN_EMAILS"),
  CLOUDINARY_CLOUD_NAME: getOptionalEnv("CLOUDINARY_CLOUD_NAME"),
  CLOUDINARY_API_KEY: getOptionalEnv("CLOUDINARY_API_KEY"),
  CLOUDINARY_API_SECRET: getOptionalEnv("CLOUDINARY_API_SECRET"),
};

export function requireServerEnv(name: ServerEnvName) {
  const value = getOptionalEnv(name);

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const hasDatabaseUrl = Boolean(env.DATABASE_URL);
export const hasGoogleAuthEnv = Boolean(
  env.AUTH_GOOGLE_ID && env.AUTH_GOOGLE_SECRET,
);
export const hasCloudinaryEnv = Boolean(
  env.CLOUDINARY_CLOUD_NAME &&
    env.CLOUDINARY_API_KEY &&
    env.CLOUDINARY_API_SECRET,
);
