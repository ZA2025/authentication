import { authConfig } from "@/auth.config";
import NextAuth from "next-auth";
import { NextResponse } from "next/server";

import {
  PUBLIC_ROUTES,
  LOGIN,
  ROOT,
  PROTECTED_SUB_ROUTES,
  ADMIN_ROUTES,
} from "@/lib/routes";

const { auth } = NextAuth(authConfig);

export async function proxy(request) {
  if (request.nextUrl.pathname.startsWith("/api/webhook")) {
    return NextResponse.next();
  }

  const { nextUrl } = request;
  const session = await auth();

  const isAuthenticated = !!session?.user;

  const isPublicRoute =
    (PUBLIC_ROUTES.find((route) => nextUrl.pathname.startsWith(route)) ||
      nextUrl.pathname === ROOT) &&
    !PROTECTED_SUB_ROUTES.find((route) => nextUrl.pathname.includes(route));

  const isProtectedRoute = !isPublicRoute;
  const isAdminRoute = ADMIN_ROUTES.some((route) =>
    nextUrl.pathname.startsWith(route)
  );

  if ((!isAuthenticated && !isPublicRoute) || (!isAuthenticated && isProtectedRoute)) {
    return Response.redirect(new URL(LOGIN, nextUrl));
  }

  if (isAdminRoute && session?.user?.role !== "admin") {
    return Response.redirect(new URL(ROOT, nextUrl));
  }

  const response = NextResponse.next();
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "origin-when-cross-origin");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://checkout.stripe.com; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: https:; " +
      "font-src 'self' data:; " +
      "connect-src 'self' https: https://api.stripe.com; " +
      "frame-src 'self' https://js.stripe.com https://checkout.stripe.com;"
  );

  return response;
}

export const config = {
  matcher: [
    "/((?!api/webhook|_next|.*\\..*).*)",
    "/api/admin/:path*",
  ],
};
