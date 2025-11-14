import { NextResponse } from "next/server";

type MerchantInfo = {
  id?: string;
  email?: string;
  currency?: string;
  merchant_profile?: {
    merchant_code?: string;
    country?: string;
    business_name?: string;
  };
};

export async function GET() {
  const apiKey = process.env.SUMUP_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "Missing SUMUP_API_KEY" }, { status: 500 });
  }

  try {
    const res = await fetch("https://api.sumup.com/v0.1/me", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    const data: MerchantInfo = await res.json();

    return NextResponse.json({ ok: true, merchant: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
