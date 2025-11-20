import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { subMonths, startOfMonth } from "date-fns";

export async function GET() {
  try {
    // ---------- VARASTON TIEDOT ----------
    const products = await prisma.product.findMany({
      where: { category: "Tuote" }, // vain tuotteet (ei palvelut)
      select: { quantity: true, price: true, name: true },
    });

    const totalInventoryCount = products.reduce(
      (sum, p) => sum + (p.quantity ?? 0),
      0
    );

    const totalInventoryValue = products.reduce(
      (sum, p) => sum + (p.quantity ?? 0) * p.price,
      0
    );

    // Top 5 tuotteet
    const topProducts= products
  .sort((a, b) => (b.quantity ?? 0) - (a.quantity ?? 0))
  .slice(0, 5)
  .map((p) => ({
  name: p.name,
  Varastosaldo: p.quantity ?? 0,
}));


    // ---------- LASKUT ----------
    const invoiceCounts = await prisma.invoice.groupBy({
      by: ["status"],
      _count: { status: true },
    });

    const openInvoices =
      invoiceCounts.find((i) => i.status === "DRAFT")?._count.status ?? 0;

    const approvedInvoices =
      invoiceCounts.find((i) => i.status === "APPROVED")?._count.status ?? 0;

    // ---------- MYYNTI (kirjanpidosta) ----------
    const startOfThisMonth = startOfMonth(new Date());
    const start12MonthsAgo = subMonths(startOfThisMonth, 11);

    // Käytämme BookkeepingEntry + amount arvoa
    const sales12 = await prisma.bookkeepingEntry.findMany({
      where: {
        type: "TULO", // myyntitapahtumat
        date: {
          gte: start12MonthsAgo,
        },
      },
      select: {
        amount: true,
        date: true,
      },
      orderBy: {
        date: "asc",
      },
    });

    // Ryhmittele kuukaudet
    const salesByMonth: { month: string; total: number }[] = [];

    for (let i = 0; i < 12; i++) {
      const date = subMonths(startOfThisMonth, 11 - i);
      const key = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      const total = sales12
        .filter(
          (s) =>
            s.date.getFullYear() === date.getFullYear() &&
            s.date.getMonth() === date.getMonth()
        )
        .reduce((sum, s) => sum + s.amount, 0);

      salesByMonth.push({ month: key, total });
    }

    // Kuukauden myynti yhteensä
    const monthlySales = sales12
      .filter(
        (s) =>
          s.date.getFullYear() === new Date().getFullYear() &&
          s.date.getMonth() === new Date().getMonth()
      )
      .reduce((sum, s) => sum + s.amount, 0);

    // ---------- TATUOINNIT JA KEIKAT ----------
    const currentYear = new Date().getFullYear();

    const tattoosThisYear = await prisma.tattoo.count({
      where: {
        isPublic: true,
        createdAt: {
          gte: new Date(currentYear, 0, 1),
        },
      },
    });

    const standupGigsThisYear = await prisma.standupGig.count({
      where: {
        date: {
          gte: new Date(currentYear, 0, 1),
        },
      },
    });

    // ---------- VASTAUS ----------
    return NextResponse.json({
      totals: {
        inventoryCount: totalInventoryCount,
        inventoryValue: Number(totalInventoryValue.toFixed(2)),

        openInvoices,
        approvedInvoices,
        monthlySales: Number(monthlySales.toFixed(2)),

        tattoosThisYear,
        standupGigsThisYear,
      },
      charts: {
        salesByMonth,
        topProducts,
      },
    });
 } catch (error) {
  console.error("Dashboard API error:", error);
  return NextResponse.json(
    { error: "API failed", details: String(error) },
    { status: 500 }
  );
}
}
