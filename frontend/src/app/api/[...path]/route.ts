import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_INTERNAL_URL ?? "http://localhost:8081";

/**
 * Catch-all proxy route: /api/[...path] → Spring Boot backend
 * This is more reliable than next.config.ts rewrites because it runs
 * as a real Next.js Route Handler, not a network-level rewrite.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxy(req, await params);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxy(req, await params);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxy(req, await params);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxy(req, await params);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxy(req, await params);
}

async function proxy(
  req: NextRequest,
  params: { path: string[] }
) {
  const path = params.path?.join("/") ?? "";
  const search = req.nextUrl.search ?? "";
  const url = `${BACKEND}/api/${path}${search}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  let body: string | undefined;
  if (req.method !== "GET" && req.method !== "DELETE") {
    try {
      body = await req.text();
    } catch {
      body = undefined;
    }
  }

  try {
    const backendRes = await fetch(url, {
      method: req.method,
      headers,
      body,
      // No cache — always fresh from Spring Boot
      cache: "no-store",
    });

    const contentType = backendRes.headers.get("content-type") ?? "";
    const data = contentType.includes("application/json")
      ? await backendRes.json()
      : await backendRes.text();

    return NextResponse.json(data, { status: backendRes.status });
  } catch (err) {
    console.error(`[proxy] ${req.method} ${url} failed:`, err);
    return NextResponse.json(
      { message: "Backend unreachable", status: 503, code: "BACKEND_UNAVAILABLE" },
      { status: 503 }
    );
  }
}
