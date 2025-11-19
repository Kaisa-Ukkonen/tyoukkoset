import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { productId, change, note } = await req.json();

    if (!productId || !change) {
      return NextResponse.json(
        { error: "Tuote ja muutosarvo ovat pakollisia." },
        { status: 400 }
      );
    }

    // 1️⃣ Lisää StockMovement -kirjaus
    await prisma.stockMovement.create({
      data: {
        productId,
        change,
        note: note || "",
      },
    });

    // 2️⃣ Päivitä varastosaldo
    await prisma.product.update({
      where: { id: productId },
      data: {
        quantity: { increment: change },
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Stock update failed", err);
    return NextResponse.json(
      { error: "Varaston päivittäminen epäonnistui." },
      { status: 500 }
    );
  }
}
