import { NextResponse } from "next/server";

type ProductList = {
  items?: Array<{
    id: string;
    name: string;
    price: number;
    vat_rate: number;
  }>;
};

export async function GET() {
  const apiKey = process.env.SUMUP_API_KEY;

  try {
    const res = await fetch("https://api.sumup.com/v0.1/me/products", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    const data: ProductList = await res.json();

    return NextResponse.json({ ok: true, products: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
