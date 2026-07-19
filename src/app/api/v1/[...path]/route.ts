import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL =
  process.env.API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://api.angebeauty.net/";

const API_BASE = API_BASE_URL.replace(/\/+$/, "");
const STOREFRONT_ACCESS_COOKIE = "storefront_access_token";
const STOREFRONT_REFRESH_COOKIE = "storefront_refresh_token";

function buildUpstreamCookieHeader(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;

  const forwarded: string[] = [];
  let accessToken: string | null = null;
  let refreshToken: string | null = null;

  for (const part of cookieHeader.split(";")) {
    const pair = part.trim();
    const separator = pair.indexOf("=");
    if (separator <= 0) continue;

    const name = pair.slice(0, separator).trim();
    const value = pair.slice(separator + 1);

    if (name === STOREFRONT_ACCESS_COOKIE) {
      accessToken = value;
    } else if (name === STOREFRONT_REFRESH_COOKIE) {
      refreshToken = value;
    } else if (name !== "access_token" && name !== "refresh_token") {
      forwarded.push(`${name}=${value}`);
    }
  }

  if (accessToken !== null) forwarded.push(`access_token=${accessToken}`);
  if (refreshToken !== null) forwarded.push(`refresh_token=${refreshToken}`);
  return forwarded.length > 0 ? forwarded.join("; ") : null;
}

function getSetCookieHeaders(headers: Headers): string[] {
  const headersWithSetCookie = headers as Headers & {
    getSetCookie?: () => string[];
  };
  const values = headersWithSetCookie.getSetCookie?.();
  if (values?.length) return values;

  const combined = headers.get("set-cookie");
  return combined
    ? combined.split(/,(?=\s*[^;,=\s]+=[^;,]*)/g).map((value) => value.trim())
    : [];
}

function namespaceAuthCookie(setCookie: string): string {
  if (/^access_token=/i.test(setCookie)) {
    return setCookie.replace(/^access_token=/i, `${STOREFRONT_ACCESS_COOKIE}=`);
  }
  if (/^refresh_token=/i.test(setCookie)) {
    return setCookie.replace(/^refresh_token=/i, `${STOREFRONT_REFRESH_COOKIE}=`);
  }
  return setCookie;
}

function buildTargetUrl(request: NextRequest, path: string[]): string {
  const incomingUrl = new URL(request.url);
  const upstreamPath = `/api/v1/${path.join("/")}`;
  return `${API_BASE}${upstreamPath}${incomingUrl.search}`;
}

async function handleProxy(request: NextRequest, path: string[]) {
  const targetUrl = buildTargetUrl(request, path);
  const method = request.method.toUpperCase();

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("content-length");
  headers.delete("accept-encoding");
  headers.delete("connection");
  const upstreamCookie = buildUpstreamCookieHeader(request.headers.get("cookie"));
  if (upstreamCookie) {
    headers.set("cookie", upstreamCookie);
  } else {
    headers.delete("cookie");
  }

  const body =
    method === "GET" || method === "HEAD" ? undefined : await request.arrayBuffer();

  const upstream = await fetch(targetUrl, {
    method,
    headers,
    body,
    redirect: "manual",
  });

  const responseHeaders = new Headers(upstream.headers);
  responseHeaders.delete("content-encoding");
  responseHeaders.delete("content-length");
  responseHeaders.delete("set-cookie");
  for (const setCookie of getSetCookieHeaders(upstream.headers)) {
    responseHeaders.append("set-cookie", namespaceAuthCookie(setCookie));
  }

  const data = await upstream.arrayBuffer();
  return new NextResponse(data, {
    status: upstream.status,
    headers: responseHeaders,
  });
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  return handleProxy(request, path || []);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  return handleProxy(request, path || []);
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  return handleProxy(request, path || []);
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  return handleProxy(request, path || []);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  return handleProxy(request, path || []);
}
