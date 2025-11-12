import { NextResponse } from "next/server";



// 🔹 Proxy YTJ-rajapintaan
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query");

  if (!query) {
    return NextResponse.json({ error: "Missing query parameter" }, { status: 400 });
  }

  try {
    const apiUrl = `https://avoindata.prh.fi/opendata-ytj-api/v3/companies?name=${encodeURIComponent(
      query
    )}`;

    const res = await fetch(apiUrl);

    if (!res.ok) {
      throw new Error(`YTJ request failed: ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("YTJ API error:", err);
    return NextResponse.json({ error: "YTJ API error" }, { status: 500 });
  }
}
