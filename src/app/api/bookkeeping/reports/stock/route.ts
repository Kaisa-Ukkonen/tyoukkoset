import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const start = searchParams.get("start");
    const end = searchParams.get("end");
    const includeArchived = searchParams.get("includeArchived") === "1";

    if (!start || !end) {
      return NextResponse.json(
        { error: "Puuttuvat päivämäärät." },
        { status: 400 }
      );
    }

    const startDate = new Date(start);
    const endDate = new Date(end);
    endDate.setHours(23, 59, 59, 999);

    // 🔹 HAE KAIKKI TUOTTEET
    const products = await prisma.product.findMany({
      where: {
        category: "Tuote",
        ...(includeArchived ? {} : { archived: false }),
      },
      include: {
        usages: true, // kaikki käyttö- ja lisäystapahtumat
      },
    });

    let totalNet = 0;
    let totalGross = 0;

    const rows = products.map((p) => {
      // 1️⃣ Alkusaldo ennen aikaväliä
      const initialStock =
        p.usages
          .filter((u) => new Date(u.date) < startDate)
          .reduce((s, u) => s + u.quantity, 0) ?? 0;

      // 2️⃣ Lisäys aikavälillä (positiivinen quantity)
      const added =
        p.usages
          .filter(
            (u) =>
              new Date(u.date) >= startDate &&
              new Date(u.date) <= endDate &&
              u.quantity > 0
          )
          .reduce((s, u) => s + u.quantity, 0) ?? 0;

      // 3️⃣ Käyttö aikavälillä (negatiivinen quantity)
      const used =
        p.usages
          .filter(
            (u) =>
              new Date(u.date) >= startDate &&
              new Date(u.date) <= endDate &&
              u.quantity < 0
          )
          .reduce((s, u) => s + Math.abs(u.quantity), 0) ?? 0;

      // 4️⃣ Loppusaldo
      const finalStock = initialStock + added - used;

      // 5️⃣ Hinnat
      const unitNet = Number(p.price);
      const vatRate = Number(p.vatRate);
      const unitVat = unitNet * (vatRate / 100);
      const unitGross = unitNet + unitVat;

      const netValue = finalStock * unitNet;
      const grossValue = finalStock * unitGross;

      totalNet += netValue;
      totalGross += grossValue;

      return {
        id: p.id,
        name: p.name,
        archived: p.archived,
        initialStock,
        added,
        used,
        finalStock,
        unitNet,
        unitVat,
        unitGross,
        netValue,
        grossValue,
      };
    });

    // 🔶 TAPAHTUMAT: productUsage + stockMovement
    const usageEvents = await prisma.productUsage.findMany({
      where: {
        date: { gte: startDate, lte: endDate },
      },
      include: {
        product: true,
        entry: { select: { id: true } },
        invoice: { select: { id: true, invoiceNumber: true } },
      },
    });

    const stockMovements = await prisma.stockMovement.findMany({
      where: { createdAt: { gte: startDate, lte: endDate } },
      include: { product: true },
    });

    const events = [
      ...usageEvents.map((u) => ({
        date: u.date,
        product: u.product.name,
        quantity: u.quantity,
        type: u.quantity > 0 ? "Lisäys (laskulta)" : "Käyttö",
        source: u.invoice
          ? `Lasku #${u.invoice.invoiceNumber}`
          : u.entry
          ? `Tapahtuma #${u.entry.id}`
          : "-",
      })),
      ...stockMovements.map((s) => ({
        date: s.createdAt,
        product: s.product.name,
        quantity: s.change,
        type: s.change > 0 ? "Varastolisäys" : "Manuaalinen vähennys",
        source: s.note || "-",
      })),
    ];

    events.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return NextResponse.json({
      startDate: start,
      endDate: end,
      totalNet,
      totalGross,
      rows,
      events,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Virhe varastoraportissa" },
      { status: 500 }
    );
  }
}
