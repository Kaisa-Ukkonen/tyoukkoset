import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Haetaan vain tuotteet (ei palvelut)
    const products = await prisma.product.findMany({
      where: { category: "Tuote", archived: false },
    });

    let totalNet = 0;
    let totalGross = 0;

    const rows = products.map((p) => {
      const qty = p.quantity ?? 0;
      const vat = p.vatRate;
      const gross = p.price;                          // sis. ALV
      const net = gross / (1 + vat / 100);            // veroton
      const vatPart = gross - net;                    // ALV-osuus

      const netValue = net * qty;
      const grossValue = gross * qty;

      totalNet += netValue;
      totalGross += grossValue;

      return {
        id: p.id,
        name: p.name,
        qty,
        gross,       // kpl-hinta ALV sis.
        vat,
        net,
        vatPart,
        netValue,
        grossValue,
      };
    });

    return NextResponse.json({
      totalNet,
      totalGross,
      rows,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Varastoraportti epäonnistui" },
      { status: 500 }
    );
  }
}
