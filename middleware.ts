import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("admin_token")?.value;

  // Ei tokenia → ei pääsyä adminiin
  if (!token) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET!);
    return NextResponse.next(); // ✅ OK
  } catch (err) {
    // Token virheellinen / vanhentunut
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }
}

// Suojataan kaikki /admin-polut PÄÄSÄÄNTÖISESTI
export const config = {
  matcher: ["/admin/:path*"],
};
