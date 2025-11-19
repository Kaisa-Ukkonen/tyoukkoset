import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    if (!from || !to) {
      return NextResponse.json(
        { error: "Missing date range" },
        { status: 400 }
      );
    }

    const start = new Date(from);
    const end = new Date(to);

    // 🔹 Haetaan kaikki kirjanpitotapahtumat
    const entries = await prisma.bookkeepingEntry.findMany({
      where: {
        date: {
          gte: start,
          lte: end,
        },
      },
      include: {
        category: true,
      },
      orderBy: { date: "asc" },
    });

    // ===========================
    // 🔹 MYYNNIT (TULO)
    // ===========================
    let salesVat = 0;
    let zeroVatSales = 0;

    const salesLines = entries
      .filter((e) => e.type.toLowerCase() === "tulo")
      .map((e) => {
        if (e.vatRate > 0) {
          const vat = e.vatAmount;
          salesVat += vat;
        } else {
          zeroVatSales += e.amount;
        }

        return {
          id: e.id,
          date: e.date.toISOString(),
          description: e.description ?? "",
          net: e.amount,
          vatRate: e.vatRate,
          vat: e.vatAmount,
        };
      });

    // ===========================
    // 🔹 OSTOT (MENO)
    // ===========================
    let purchasesVat = 0;

    const purchaseLines = entries
      .filter((e) => e.type.toLowerCase() === "meno")
      .map((e) => {
        const vat = e.vatAmount;
        purchasesVat += vat;

        return {
          id: e.id,
          date: e.date.toISOString(),
          description: e.description ?? "",
          net: e.amount,
          vatRate: e.vatRate,
          vat,
        };
      });

    // ===========================
    // 🔹 PALAUTETAAN FRONTILLE
    // ===========================
    return NextResponse.json({
      period: { from, to },
      salesVat,
      purchasesVat,
      zeroVatSales,
      payableVat: salesVat - purchasesVat,
      salesLines,
      purchaseLines,
      zeroSalesLines: salesLines.filter((l) => l.vatRate === 0),
    });

  } catch (err) {
    console.error("VAT error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
