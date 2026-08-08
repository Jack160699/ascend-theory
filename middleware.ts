import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { validateRedirectUrl } from "@/lib/admin/auth";
import { hasSupabaseConfig } from "@/lib/supabase/env";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Intercept and protect /admin routes
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") {
      return NextResponse.next();
    }

    const { supabaseResponse, user } = await updateSession(request);

    // If Supabase is configured and user is unauthenticated, redirect to login
    if (hasSupabaseConfig() && !user) {
      const safeFrom = validateRedirectUrl(pathname, "/admin");
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", safeFrom);
      return NextResponse.redirect(loginUrl, { headers: supabaseResponse.headers });
    }

    // In local dev without live Supabase keys, fallback session check via cookie
    if (!hasSupabaseConfig() && process.env.NODE_ENV !== "production") {
      const sessionCookie = request.cookies.get("ascend_hq_session");
      if (!sessionCookie || !sessionCookie.value) {
        const safeFrom = validateRedirectUrl(pathname, "/admin");
        const loginUrl = new URL("/admin/login", request.url);
        loginUrl.searchParams.set("from", safeFrom);
        return NextResponse.redirect(loginUrl);
      }
    }

    return supabaseResponse;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
