import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.SUMUP_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "SUMUP_API_KEY puuttuu .env tiedostosta" },
      { status: 500 }
    );
  }

  try {
    const res = await fetch("https://api.sumup.com/v0.1/me/transactions?limit=5", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();

    return NextResponse.json({
      ok: true,
      transactions: data,
    });
  } catch (err) {
  const message =
    err instanceof Error ? err.message : "Tuntematon virhe";
  return NextResponse.json(
    { error: message },
    { status: 500 }
  );
}
}
