import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login", "/auth", "/api/auth"];

function buildCsp(nonce: string) {
  const isDev = process.env.NODE_ENV === "development";
  const apiOrigin = (() => {
    try {
      return new URL(process.env.NEXT_PUBLIC_API_HOST ?? "").origin;
    } catch {
      return "";
    }
  })();

  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data: https://fonts.gstatic.com",
    `connect-src 'self' ${apiOrigin}${isDev ? " ws: wss:" : ""}`.trim(),
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self' https://login.microsoftonline.com https://accounts.google.com",
    "frame-ancestors 'none'",
  ].join("; ");
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = buildCsp(nonce);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const withCsp = (response: NextResponse) => {
    response.headers.set("Content-Security-Policy", csp);
    return response;
  };
  const next = () => withCsp(NextResponse.next({ request: { headers: requestHeaders } }));

  const isPublic = PUBLIC_PATHS.some((path) => pathname.startsWith(path));
  if (isPublic) {
    return next();
  }

  const baseName = process.env.SESSION_TOKEN_NAME ?? "next-auth.session-token";
  const hasSession = request.cookies.has(baseName) || request.cookies.has(`${baseName}.0`);

  if (!hasSession) {
    const loginUrl = new URL("/login", request.url);
    return withCsp(NextResponse.redirect(loginUrl));
  }

  return next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*|public).*)"],
};
