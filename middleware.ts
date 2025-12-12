import { NextResponse } from "next/server";

export function middleware(req: Request) {
  const authHeader = req.headers.get("authorization");

  const username = process.env.ADMIN_USER;
  const password = process.env.ADMIN_PASS;

  if (!username || !password) {
    console.error("❌ ADMIN_USER tai ADMIN_PASS puuttuu .env-tiedostosta!");
    return new NextResponse("Server error", { status: 500 });
  }

  const validAuth = "Basic " + Buffer.from(`${username}:${password}`).toString("base64");

  // Jos authorization header ei ole oikea → kysytään salasanaa
  if (authHeader !== validAuth) {
    return new NextResponse("Unauthorized", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Restricted Area"',
      },
    });
  }

  return NextResponse.next();
}

// Suojataan KAIKKI polut alkaen /admin
export const config = {
  matcher: [
    "/admin/:path*",
  ],
};
