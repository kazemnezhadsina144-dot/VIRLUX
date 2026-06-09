import { NextRequest, NextResponse } from "next/server";
import { isInvalidApiUrl } from "@virlux/shared";
import { forwardSetCookies } from "@/lib/api-proxy";

const API = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002").replace(/\/$/, "");

/** Proxy /api/* to live API base URL and forward Set-Cookie headers (auth cookies). */
async function proxy(req: NextRequest, path: string) {
  if (isInvalidApiUrl(API)) {
    return NextResponse.json(
      {
        error: "API not configured",
        hint: "Set NEXT_PUBLIC_API_URL on Vercel to your live API URL, then redeploy virlux-app",
      },
      { status: 503 }
    );
  }

  const url = `${API}/api/${path}${req.nextUrl.search}`;
  const headers = new Headers(req.headers);
  headers.delete("host");

  const init: RequestInit = {
    method: req.method,
    headers,
    redirect: "manual",
  };
  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = await req.text();
  }

  let upstream: Response;
  try {
    upstream = await fetch(url, init);
  } catch {
    return NextResponse.json(
      { error: "API unreachable", hint: "Check NEXT_PUBLIC_API_URL and API /health" },
      { status: 502 }
    );
  }

  const resHeaders = new Headers();
  upstream.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (lower === "set-cookie" || lower === "content-encoding") return;
    resHeaders.append(key, value);
  });
  forwardSetCookies(upstream, resHeaders);

  return new NextResponse(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: resHeaders,
  });
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  return proxy(req, path.join("/"));
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  return proxy(req, path.join("/"));
}

export async function PUT(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  return proxy(req, path.join("/"));
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  return proxy(req, path.join("/"));
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  return proxy(req, path.join("/"));
}
