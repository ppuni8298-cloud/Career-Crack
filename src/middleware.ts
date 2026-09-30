import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE_NAME = "career_crack_session";
const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "career-crack-super-secret-jwt-key-default-32bytes"
);

interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  isOnboarded: boolean;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;

  let session: SessionPayload | null = null;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, SECRET_KEY);
      session = payload as unknown as SessionPayload;
    } catch {
      session = null;
    }
  }

  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/signup");
  const isProtectedDashboard = pathname.startsWith("/dashboard");
  const isOnboardingPage = pathname.startsWith("/onboarding");

  // 1. If accessing login/signup while already authenticated and onboarded, go to dashboard
  if (isAuthPage && session) {
    if (session.isOnboarded) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    } else {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }
  }

  // 2. If accessing protected dashboard
  if (isProtectedDashboard) {
    if (!session) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (!session.isOnboarded) {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }
  }

  // 3. If accessing onboarding without session
  if (isOnboardingPage) {
    if (!session) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/onboarding/:path*",
    "/login",
    "/signup",
  ],
};
