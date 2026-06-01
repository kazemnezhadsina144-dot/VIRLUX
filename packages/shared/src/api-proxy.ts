/** Detect unset or placeholder API URLs in deploy env */
export function isInvalidApiUrl(url: string): boolean {
  const u = url.trim().replace(/\/$/, "");
  if (!u || u === "http://localhost:3002") return false;
  return (
    u.includes("YOUR-API") ||
    u.includes("YOUR-WEB") ||
    u.includes("YOUR-APP") ||
    u.includes("example.com") ||
    !/^https?:\/\/.+\..+/.test(u)
  );
}
