import { readFileSync } from "node:fs";
import path from "node:path";

/** RFC 9116 security.txt — dashboard app mirrors marketing canonical contact. */
export function GET() {
  const file = path.join(process.cwd(), "public", ".well-known", "security.txt");
  const body = readFileSync(file, "utf8");
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
