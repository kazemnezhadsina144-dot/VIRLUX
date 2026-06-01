/** Forward upstream Set-Cookie headers without collapsing multiples (auth needs access + refresh) */
export function forwardSetCookies(upstream: Response, resHeaders: Headers): void {
  const getSetCookie = (upstream.headers as Headers & { getSetCookie?: () => string[] }).getSetCookie;
  const cookies = typeof getSetCookie === "function" ? getSetCookie.call(upstream.headers) : [];
  if (cookies.length > 0) {
    for (const c of cookies) resHeaders.append("set-cookie", c);
    return;
  }
  const raw = upstream.headers.get("set-cookie");
  if (raw) resHeaders.append("set-cookie", raw);
}
