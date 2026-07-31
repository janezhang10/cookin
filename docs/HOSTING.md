# Private Hosting Plan

## Current Direction

Cookin is prepared for private managed hosting through OpenAI Sites on
Cloudflare infrastructure.

- The website runs as a Cloudflare-compatible Next.js Worker.
- Recipe records are stored in D1 and shared across devices.
- Recipe photos are stored in R2.
- Access defaults to the site owner only.
- A provided hosted address is used, so a purchased domain is optional.
- The local Cloudflare emulator keeps development data separate from hosted
  data.

## Cost Expectations

Cookin is designed to fit comfortably inside the platform's included storage
and request allowances for a personal recipe collection. A payment method or a
paid plan may become necessary if those allowances or platform policies change,
or if usage grows substantially.

## Deployment Sequence

1. Apply and inspect database migrations.
2. Build the standard Next.js application.
3. Build the Cloudflare-compatible deployment bundle.
4. Save a version of the exact validated source.
5. Deploy with owner-only access.
6. Test creating, editing, deleting, importing, photos, and cooking mode from a
   second device.

## Data Notes

- The old local `dev.db` remains untouched as a legacy backup.
- A new hosted database starts with the standard cooking units but no recipes.
- Existing local recipes should be exported or migrated separately instead of
  embedding personal data in the deployment source.
- Hosted data should still be backed up periodically even though D1 provides a
  recovery window.
