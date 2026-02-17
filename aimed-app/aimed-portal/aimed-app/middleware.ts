import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Force Edge Runtime
export const runtime = "edge";

export async function middleware(request: NextRequest) {
  // Create response
  let response = NextResponse.next({
    request,
  });

  // Create Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Auth callback must always pass through — it exchanges the code for a session
  if (request.nextUrl.pathname.startsWith("/auth/callback")) {
    return response;
  }

  // Define public paths
  const publicPaths = ["/login", "/registracija", "/reset-password", "/politika-privatnosti", "/uslovi-koristenja", "/gdpr-sigurnost"];
  const isPublicPath =
    request.nextUrl.pathname === "/" ||
    publicPaths.some((path) => request.nextUrl.pathname.startsWith(path));

  // Redirect to login if not authenticated and trying to access protected route
  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Redirect to dashboard if authenticated and trying to access public route
  if (user && isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - public assets (svg, png, jpg, etc.)
     * - API routes (handled separately)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api/).*)",
  ],
};
