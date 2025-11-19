import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const productId = Number(id);

    if (Number.isNaN(productId)) {
      return NextResponse.json(
        { error: "Virheellinen ID" },
        { status: 400 }
      );
    }

    // Palautetaan tuote
    const updated = await prisma.product.update({
      where: { id: productId },
      data: { archived: false },
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (err) {
    console.error("❌ Virhe palautuksessa:", err);
    return NextResponse.json(
      { error: "Palautus epäonnistui" },
      { status: 500 }
    );
  }
}
