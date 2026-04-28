# Tesla Clone App

Tesla-inspired full-stack Next.js application built with App Router, TypeScript, Tailwind CSS, Prisma ORM, PostgreSQL, Auth.js, Cloudinary, Resend, Vercel Analytics, Sentry, Vitest, and Playwright.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma ORM + PostgreSQL
- Auth.js with Google sign-in
- Cloudinary media uploads
- Resend transactional email
- Vercel Analytics
- Sentry monitoring
- Vitest + Playwright

## Local setup

1. Install dependencies:
   - `npm install`
2. Copy environment values from `.env.example` into a local `.env`.
3. Validate deployment-critical configuration when needed:
   - `npm run env:check`
4. Generate Prisma client if needed:
   - `npm run db:generate`
5. Run local schema changes:
   - `npm run db:migrate`
6. Seed local catalog content:
   - `npm run db:seed`
7. Start the app:
   - `npm run dev`

## Environment variables

Required for a production-ready deployment:

- `DATABASE_URL`
  - PostgreSQL connection string for Prisma-backed data.
- `NEXT_PUBLIC_APP_URL`
  - Public site URL used for canonical metadata, sitemap, and deployment-ready links.
- `AUTH_SECRET`
  - Strong Auth.js secret, recommended 32+ characters.
- `AUTH_GOOGLE_ID`
  - Google OAuth client ID.
- `AUTH_GOOGLE_SECRET`
  - Google OAuth client secret.
- `ADMIN_EMAILS`
  - Comma-separated list of emails that should receive admin access on sign-in.
- `CLOUDINARY_CLOUD_NAME`
  - Cloudinary cloud name.
- `CLOUDINARY_API_KEY`
  - Cloudinary API key.
- `CLOUDINARY_API_SECRET`
  - Cloudinary API secret.
- `RESEND_API_KEY`
  - Resend API key for transactional email.
- `EMAIL_FROM`
  - Sender used for confirmations and internal notifications.
- `ADMIN_NOTIFICATION_EMAIL`
  - Internal destination for inquiry/demo notifications.
- `NEXT_PUBLIC_SENTRY_DSN`
  - Public Sentry DSN for client/server monitoring.

## Commands

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run test:watch`
- `npm run test:coverage`
- `npm run test:e2e`
- `npm run check`
- `npm run env:check`
- `npm run db:generate`
- `npm run db:migrate`
- `npm run db:push`
- `npm run db:seed`
- `npm run db:studio`

## Auth, admin, media, and email prerequisites

- Google OAuth must be configured for sign-in to work.
- `ADMIN_EMAILS` controls which authenticated users are promoted to the admin role.
- Cloudinary credentials are required for production media upload flows.
- Resend credentials plus `EMAIL_FROM` and `ADMIN_NOTIFICATION_EMAIL` are required for inquiry/demo email delivery.
- The app supports graceful local fallbacks in some areas, but `npm run env:check` reflects the production-ready requirement set.

## Quality and CI

- ESLint covers the Next.js app surface with `next/core-web-vitals`.
- Type safety is verified with `npm run typecheck`.
- Unit tests run with Vitest.
- Browser smoke tests run with Playwright.
- GitHub Actions starter workflow lives at `.github/workflows/ci.yml`.

## Deployment notes

- The app is structured for Vercel-style deployment.
- `NEXT_PUBLIC_APP_URL` should point to the deployed production URL.
- App-wide security headers are configured in `next.config.ts`.
- Admin and account routes are marked `no-store`.
- Public inquiry submissions are rate-limited and restricted to trusted same-origin requests.
- Run `npm run env:check`, `npm run check`, and `npm run build` before shipping.

## Phase 5 status

- Deployment-readiness docs and scripts are in place.
- Zod-based environment validation is centralized.
- Public form rate limiting and same-origin mutation checks are enabled.
- Security headers and no-store behavior are configured.
- CI starter support is present with lint, typecheck, build, unit, and smoke checks.
- Public/admin fallback states are ready for final polish in the app surface.
