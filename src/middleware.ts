import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https://*.supabase.co https://api.qrserver.com",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
  "font-src 'self' https://fonts.gstatic.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Rutas que no pasan por auth de Supabase ──────────────────────────────
  const isPublicPage =
    pathname === "/" ||
    pathname.startsWith("/seguimiento") ||
    pathname.startsWith("/dev") ||
    pathname.startsWith("/trial-expirado");

  const isAuthPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/auth/") ||
    pathname.startsWith("/registro");

  const isHubApi    = pathname.startsWith("/api/hub/");
  const isDevApi    = pathname.startsWith("/api/dev/");
  const isBotApi    = pathname.startsWith("/api/bot");
  // /superadmin y sus APIs tienen su propia auth con SUPERADMIN_KEY
  const isSuperAdmin =
    pathname.startsWith("/superadmin") ||
    pathname.startsWith("/api/superadmin");

  // Rutas super-admin sin Supabase → solo CSP y dejar pasar
  if (isSuperAdmin) {
    const res = NextResponse.next();
    res.headers.set("Content-Security-Policy", CSP);
    return res;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseUrl.startsWith("http") || !supabaseKey) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();

  if (!user && !isAuthPage && !isPublicPage && !isHubApi && !isDevApi && !isBotApi) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (user && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  supabaseResponse.headers.set("Content-Security-Policy", CSP);
  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
