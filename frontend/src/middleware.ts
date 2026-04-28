import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login", "/auth", "/api/auth"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic = PUBLIC_PATHS.some((path) => pathname.startsWith(path));
  if (isPublic) {
    return NextResponse.next();
  }

  const baseName = process.env.SESSION_TOKEN_NAME ?? "next-auth.session-token";
  const hasSession = request.cookies.has(baseName) || request.cookies.has(`${baseName}.0`);

  if (!hasSession) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*|public).*)"],
};
