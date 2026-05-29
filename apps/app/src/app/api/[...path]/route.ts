import { NextRequest, NextResponse } from "next/server";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002";

/** Proxy /api/* to Railway API and forward Set-Cookie headers (auth cookies). */
async function proxy(req: NextRequest, path: string) {
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

  const upstream = await fetch(url, init);
  const resHeaders = new Headers(upstream.headers);
  resHeaders.delete("content-encoding");

  const res = new NextResponse(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: resHeaders,
  });
  return res;
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
