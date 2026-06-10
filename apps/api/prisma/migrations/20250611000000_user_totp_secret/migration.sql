-- Optional TOTP MFA (recommended for platform admin accounts).
ALTER TABLE "User" ADD COLUMN "totpSecret" TEXT;
