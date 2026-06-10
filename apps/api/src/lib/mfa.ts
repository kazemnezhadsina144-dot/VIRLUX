import { generateSecret, generateURI, verifySync } from "otplib";

export function generateTotpSecret(): string {
  return generateSecret();
}

export function totpKeyUri(email: string, secret: string): string {
  return generateURI({ issuer: "VIRLUX", label: email, secret });
}

export function verifyTotp(secret: string, code: string): boolean {
  const result = verifySync({ secret, token: code });
  return result.valid === true;
}
