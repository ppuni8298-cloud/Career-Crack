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
  role?: string;
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
  const isOnboardingPage = pathname.startsWith("/onboarding");
  const isAdminPage = pathname.startsWith("/admin");
  const isProtectedAppRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/practice") ||
    pathname.startsWith("/mock-tests") ||
    pathname.startsWith("/mistakes") ||
    pathname.startsWith("/bookmarks") ||
    pathname.startsWith("/analytics") ||
    pathname.startsWith("/progress") ||
    pathname.startsWith("/coach") ||
    pathname.startsWith("/roadmap") ||
    pathname.startsWith("/revision") ||
    pathname.startsWith("/interview") ||
    pathname.startsWith("/study-groups") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/daily-crack") ||
    pathname.startsWith("/crack-mode") ||
    pathname.startsWith("/readiness") ||
    pathname.startsWith("/notifications");

  // 1. If accessing login/signup while already authenticated
  if (isAuthPage && session) {
    if (session.isOnboarded) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    } else {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }
  }

  // 2. If accessing admin pages
  if (isAdminPage) {
    if (!session) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (session.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
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

  // 4. If accessing protected feature/dashboard routes
  if (isProtectedAppRoute) {
    if (!session) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (!session.isOnboarded) {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/practice/:path*",
    "/mock-tests/:path*",
    "/mistakes/:path*",
    "/bookmarks/:path*",
    "/analytics/:path*",
    "/progress/:path*",
    "/coach/:path*",
    "/roadmap/:path*",
    "/revision/:path*",
    "/interview/:path*",
    "/study-groups/:path*",
    "/profile/:path*",
    "/daily-crack/:path*",
    "/crack-mode/:path*",
    "/readiness/:path*",
    "/notifications/:path*",
    "/admin/:path*",
    "/onboarding/:path*",
    "/login",
    "/signup",
  ],
};
