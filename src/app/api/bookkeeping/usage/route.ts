import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");

  // 🔹 Palauta AINOASTAAN aktiiviset varastotuotteet
  if (type === "stock") {
    const products = await prisma.product.findMany({
      where: {
        archived: false,      // 👈 Suodata arkistoidut pois
        category: "Tuote",   // 👈 Vain varastotuotteet
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(products);
  }

  // 🔹 Muut tyypit (jos joskus tarvitaan)
  const all = await prisma.product.findMany({
    where: { archived: false }, // 👈 Suodata nämäkin
  });

  return NextResponse.json(all);
}
