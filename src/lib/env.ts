import { z } from "zod";

function emptyStringToUndefined(value: unknown) {
  if (typeof value === "string" && value.trim() === "") {
    return undefined;
  }

  return value;
}

const optionalTrimmedString = z.preprocess(
  emptyStringToUndefined,
  z.string().trim().optional(),
);

const optionalUrlString = z.preprocess(
  emptyStringToUndefined,
  z.string().trim().url("Enter a valid URL.").optional(),
);

const optionalEmailString = z.preprocess(
  emptyStringToUndefined,
  z.string().trim().email("Enter a valid email address.").optional(),
);

const publicEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: optionalUrlString,
  NEXT_PUBLIC_SENTRY_DSN: optionalUrlString,
});

const serverEnvSchema = publicEnvSchema.extend({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: optionalUrlString,
  AUTH_SECRET: optionalTrimmedString,
  AUTH_GOOGLE_ID: optionalTrimmedString,
  AUTH_GOOGLE_SECRET: optionalTrimmedString,
  ADMIN_EMAILS: optionalTrimmedString,
  CLOUDINARY_CLOUD_NAME: optionalTrimmedString,
  CLOUDINARY_API_KEY: optionalTrimmedString,
  CLOUDINARY_API_SECRET: optionalTrimmedString,
  RESEND_API_KEY: optionalTrimmedString,
  EMAIL_FROM: optionalTrimmedString,
  ADMIN_NOTIFICATION_EMAIL: optionalEmailString,
});

const rawEnv = serverEnvSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  AUTH_SECRET: process.env.AUTH_SECRET,
  AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID,
  AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET,
  ADMIN_EMAILS: process.env.ADMIN_EMAILS,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  EMAIL_FROM: process.env.EMAIL_FROM,
  ADMIN_NOTIFICATION_EMAIL: process.env.ADMIN_NOTIFICATION_EMAIL,
  NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
});

export const env = rawEnv;

export type ServerEnvName = Exclude<keyof typeof env, "NODE_ENV">;
export type EnvGroup =
  | "site"
  | "database"
  | "auth"
  | "media"
  | "email"
  | "monitoring";

export interface EnvValidationIssue {
  group: EnvGroup;
  variables: string[];
  message: string;
}

export interface EnvValidationReport {
  ok: boolean;
  issues: EnvValidationIssue[];
}

function isValidEmailAddress(value: string) {
  return z.email().safeParse(value).success;
}

function getEmailFromAddressValue(value?: string) {
  if (!value) {
    return undefined;
  }

  const inlineMatch = value.match(/<([^>]+)>/);
  const candidate = (inlineMatch ? inlineMatch[1] : value).trim();

  return isValidEmailAddress(candidate) ? candidate : undefined;
}

export function requireServerEnv(name: ServerEnvName) {
  const value = env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getAdminEmailList() {
  return (env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim())
    .filter(isValidEmailAddress);
}

export function getAdminNotificationEmail() {
  return env.ADMIN_NOTIFICATION_EMAIL ?? getAdminEmailList()[0];
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
export const hasResendEnv = Boolean(env.RESEND_API_KEY && env.EMAIL_FROM);
export const hasAdminNotificationEmail = Boolean(getAdminNotificationEmail());
export const hasTransactionalEmailEnv = Boolean(
  hasResendEnv && hasAdminNotificationEmail,
);
export const hasSentryEnv = Boolean(env.NEXT_PUBLIC_SENTRY_DSN);
export const hasEmailFromAddress = Boolean(getEmailFromAddressValue(env.EMAIL_FROM));

function buildEnvIssue(
  group: EnvGroup,
  variables: string[],
  message: string,
): EnvValidationIssue {
  return {
    group,
    variables,
    message,
  };
}

export function getEnvValidationReport(
  groups: EnvGroup[] = ["site", "database", "auth", "media", "email", "monitoring"],
): EnvValidationReport {
  const issues: EnvValidationIssue[] = [];

  if (groups.includes("site") && !env.NEXT_PUBLIC_APP_URL) {
    issues.push(
      buildEnvIssue(
        "site",
        ["NEXT_PUBLIC_APP_URL"],
        "Set NEXT_PUBLIC_APP_URL so canonical URLs, sitemap generation, and deployment metadata resolve correctly.",
      ),
    );
  }

  if (groups.includes("database") && !env.DATABASE_URL) {
    issues.push(
      buildEnvIssue(
        "database",
        ["DATABASE_URL"],
        "Set DATABASE_URL to enable Prisma, product content, favorites, inquiries, and admin workflows.",
      ),
    );
  }

  if (groups.includes("auth")) {
    if (!env.AUTH_SECRET || env.AUTH_SECRET.length < 32) {
      issues.push(
        buildEnvIssue(
          "auth",
          ["AUTH_SECRET"],
          "Set AUTH_SECRET to a strong 32+ character value for Auth.js sessions and callbacks.",
        ),
      );
    }

    if (!env.AUTH_GOOGLE_ID || !env.AUTH_GOOGLE_SECRET) {
      issues.push(
        buildEnvIssue(
          "auth",
          ["AUTH_GOOGLE_ID", "AUTH_GOOGLE_SECRET"],
          "Set Google OAuth credentials to enable sign-in and admin access flows.",
        ),
      );
    }

    if (getAdminEmailList().length === 0) {
      issues.push(
        buildEnvIssue(
          "auth",
          ["ADMIN_EMAILS"],
          "Set ADMIN_EMAILS to one or more valid comma-separated email addresses so admin role assignment works.",
        ),
      );
    }
  }

  if (groups.includes("media") && !hasCloudinaryEnv) {
    issues.push(
      buildEnvIssue(
        "media",
        [
          "CLOUDINARY_CLOUD_NAME",
          "CLOUDINARY_API_KEY",
          "CLOUDINARY_API_SECRET",
        ],
        "Set the Cloudinary credentials to enable production media uploads and product image management.",
      ),
    );
  }

  if (groups.includes("email")) {
    if (!env.RESEND_API_KEY) {
      issues.push(
        buildEnvIssue(
          "email",
          ["RESEND_API_KEY"],
          "Set RESEND_API_KEY to send admin notifications and user confirmations.",
        ),
      );
    }

    if (!hasEmailFromAddress) {
      issues.push(
        buildEnvIssue(
          "email",
          ["EMAIL_FROM"],
          "Set EMAIL_FROM to a valid sender address, for example: Tesla Inspired <notifications@example.com>.",
        ),
      );
    }

    if (!getAdminNotificationEmail()) {
      issues.push(
        buildEnvIssue(
          "email",
          ["ADMIN_NOTIFICATION_EMAIL", "ADMIN_EMAILS"],
          "Set ADMIN_NOTIFICATION_EMAIL or provide at least one valid ADMIN_EMAILS entry so internal inquiry notifications have a destination.",
        ),
      );
    }
  }

  if (groups.includes("monitoring") && !env.NEXT_PUBLIC_SENTRY_DSN) {
    issues.push(
      buildEnvIssue(
        "monitoring",
        ["NEXT_PUBLIC_SENTRY_DSN"],
        "Set NEXT_PUBLIC_SENTRY_DSN to activate production error tracking.",
      ),
    );
  }

  return {
    ok: issues.length === 0,
    issues,
  };
}

export function formatEnvValidationReport(report: EnvValidationReport) {
  if (report.ok) {
    return "Environment validation passed.";
  }

  return [
    "Environment validation failed:",
    ...report.issues.map(
      (issue) =>
        `- [${issue.group}] ${issue.message} Missing or invalid: ${issue.variables.join(", ")}`,
    ),
  ].join("\n");
}

export function assertEnvGroups(groups: EnvGroup[]) {
  const report = getEnvValidationReport(groups);

  if (!report.ok) {
    throw new Error(formatEnvValidationReport(report));
  }

  return env;
}

export function assertDeploymentEnv() {
  return assertEnvGroups([
    "site",
    "database",
    "auth",
    "media",
    "email",
    "monitoring",
  ]);
}
