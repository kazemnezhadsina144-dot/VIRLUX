type OtpLib = typeof import("otplib");

let otp: OtpLib | null = null;

async function loadOtp(): Promise<OtpLib> {
  if (!otp) otp = await import("otplib");
  return otp;
}

export async function generateTotpSecret(): Promise<string> {
  const { generateSecret } = await loadOtp();
  return generateSecret();
}

export async function totpKeyUri(email: string, secret: string): Promise<string> {
  const { generateURI } = await loadOtp();
  return generateURI({ issuer: "VIRLUX", label: email, secret });
}

export async function verifyTotp(secret: string, code: string): Promise<boolean> {
  const { verifySync } = await loadOtp();
  const result = verifySync({ secret, token: code });
  return result.valid === true;
}
