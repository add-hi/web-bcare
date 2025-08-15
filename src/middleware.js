// middleware.js
import { NextResponse } from "next/server";

// Aturan akses
const RULES = [
  { prefix: "/dashboard/mockdgo", allow: ["uic"] },
  { prefix: "/dashboard/home", allow: ["cxc"] },
  { prefix: "/dashboard/complaint", allow: ["cxc"] },
  { prefix: "/dashboard", allow: ["uic", "cxc"] }, // fallback (halaman dashboard lain)
];

function findRule(pathname) {
  return RULES.find((r) => pathname.startsWith(r.prefix));
}
function allowedForDivision(pathname, division_code) {
  const r = findRule(pathname);
  if (!r) return true;
  return r.allow.includes(division_code);
}

export function middleware(req) {
  const { pathname, origin } = req.nextUrl;

  // Allowlist rute umum
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/" ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/login")
  ) {
    return NextResponse.next();
  }

  const division_code = req.cookies.get("division_code")?.value; // "uic" | "cxc"
  if (!division_code) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  const rule = findRule(pathname);

  // ===== Unauthorized? Balik ke sebelumnya / last_path =====
  if (rule && !rule.allow.includes(division_code)) {
    const referer = req.headers.get("referer");
    let backTarget = null;

    // 1) Kalau ada referer & masih same-origin & allowed -> balik ke situ
    if (referer) {
      try {
        const ref = new URL(referer);
        if (ref.origin === origin && allowedForDivision(ref.pathname, division_code)) {
          backTarget = ref.pathname + ref.search + ref.hash;
        }
      } catch { /* ignore */ }
    }

    // 2) Kalau nggak ada referer valid -> pakai last_path (halaman valid terakhir)
    if (!backTarget) {
      const lastPath = req.cookies.get("last_path")?.value;
      if (lastPath && allowedForDivision(lastPath, division_code)) {
        backTarget = lastPath;
      }
    }

    // 3) Fallback terakhir: ke "/" (atau rute aman yang kamu mau)
    if (!backTarget) backTarget = "/";

    // Hindari redirect loop (jangan arahkan ke diri sendiri)
    if (backTarget === pathname) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    const url = req.nextUrl.clone();
    url.pathname = backTarget;
    url.search = "";
    return NextResponse.redirect(url);
  }

  // ===== Allowed: update last_path supaya ketik manual bisa "balik ke semula" =====
  const res = NextResponse.next();

  // Simpan hanya halaman yang memang allowed untuk division_code ini
  if (allowedForDivision(pathname, division_code)) {
    res.cookies.set("last_path", pathname, {
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 8, // 8 jam
    });
  }

  return res;
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
