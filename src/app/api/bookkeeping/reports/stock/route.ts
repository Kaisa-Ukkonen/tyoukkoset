import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: {
        category: "Tuote",   // 🔥 tuodaan vain tuotteet
      },
      orderBy: { name: "asc" },
    });

    const rows = products.map((p) => {
      const qty = p.quantity ?? 0;
      const price = p.price ?? 0;

      const stockValue = qty * price;

      return {
        id: p.id,
        name: p.name,
        code: p.code || "",
        quantity: qty,
        unitPrice: price,
        stockValue,
      };
    });

    const totalValue = rows.reduce((sum, r) => sum + r.stockValue, 0);

    return NextResponse.json({
      products: rows,
      totalValue,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Serverivirhe" });
  }
}
