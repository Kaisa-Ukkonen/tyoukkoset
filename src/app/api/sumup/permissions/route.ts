import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.SUMUP_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "Missing SUMUP_API_KEY" }, { status: 500 });
  }

  try {
    const res = await fetch("https://api.sumup.com/v0.1/me/permissions", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    const data = await res.json();

    return NextResponse.json({ ok: true, permissions: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
