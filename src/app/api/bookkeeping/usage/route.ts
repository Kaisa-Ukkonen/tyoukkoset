import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");

 if (type === "stock") {
  const products = await prisma.product.findMany({
    where: {
      category: "Tuote",   // ⭐ tämä on se oikea kategoria
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(products);
}


  // Fallback: kaikki
  const all = await prisma.product.findMany();
  return NextResponse.json(all);
}
