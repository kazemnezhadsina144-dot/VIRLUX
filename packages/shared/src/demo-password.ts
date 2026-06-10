/**
 * Server-side / E2E demo password resolution — never import from client components.
 * Local dev fallback is not used on staging/production seeds.
 */
export function resolveDemoSeedPassword(): string {
  const fromEnv = process.env.DEMO_SEED_PASSWORD?.trim();
  if (fromEnv && fromEnv.length >= 12) return fromEnv;

  const nodeEnv = process.env.NODE_ENV ?? "development";
  if (nodeEnv === "production") {
    throw new Error("DEMO_SEED_PASSWORD required (min 12 chars) to seed production/staging databases");
  }

  return "VirluxLocalDev!12";
}

export function resolveE2eDemoPassword(): string {
  const fromEnv = process.env.E2E_DEMO_PASSWORD?.trim() ?? process.env.DEMO_SEED_PASSWORD?.trim();
  if (fromEnv && fromEnv.length >= 12) return fromEnv;
  return resolveDemoSeedPassword();
}
