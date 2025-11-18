import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const start = searchParams.get("start");
    const end = searchParams.get("end");

    if (!start || !end) {
      return NextResponse.json({ error: "start ja end puuttuvat" });
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    // Loppupäivä 23:59:59.999
    endDate.setHours(23, 59, 59, 999);

    // -----------------------------
    // 🔹 Haetaan tapahtumat aikaväliltä
    // -----------------------------
    const entries = await prisma.bookkeepingEntry.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        contact: true,
        category: true,
      },
      orderBy: { date: "asc" },
    });

    // -----------------------------
    // 🔹 Yhteenveto (Tulot / Menot)
    // -----------------------------
    let income = 0;
    let expenses = 0;

    for (const e of entries) {
  if (e.type.toLowerCase() === "tulo") income += e.amount;
  else expenses += e.amount;
}

    const profit = income - expenses;

    // 🔹 ALV-laskenta: Myynti ja ostot
const emptyVatRow = { net: 0, vat: 0, total: 0 };

// 🔥 Avaimet tunnetaan TS:lle
const VAT_KEYS = ["0", "10", "14", "25.5"] as const;

const salesVat: Record<(typeof VAT_KEYS)[number], typeof emptyVatRow> = {
  "0": { ...emptyVatRow },
  "10": { ...emptyVatRow },
  "14": { ...emptyVatRow },
  "25.5": { ...emptyVatRow },
};

const purchaseVat: Record<(typeof VAT_KEYS)[number], typeof emptyVatRow> = {
  "0": { ...emptyVatRow },
  "10": { ...emptyVatRow },
  "14": { ...emptyVatRow },
  "25.5": { ...emptyVatRow },
};

// Laskenta
for (const e of entries) {
  const rate = String(e.vatRate) as (typeof VAT_KEYS)[number];
  const vat = (e.amount * e.vatRate) / (100 + e.vatRate);
  const net = e.amount - vat;

if (e.type.toLowerCase() === "tulo") {
    salesVat[rate].net += net;
    salesVat[rate].vat += vat;
    salesVat[rate].total += e.amount;
  } else {
    purchaseVat[rate].net += net;
    purchaseVat[rate].vat += vat;
    purchaseVat[rate].total += e.amount;
  }
}

// 🔥 Maksettava ALV ilman virheitä
let payableVat = 0;
for (const rate of VAT_KEYS) {
  payableVat += salesVat[rate].vat - purchaseVat[rate].vat;
}

    // -----------------------------
    // 🔹 Muotoillaan tapahtumadata
    // -----------------------------
    const resultEntries = entries.map(e => ({
      id: e.id,
      date: e.date.toISOString().split("T")[0],
      contact: e.contact?.name ?? null,
      category: e.category?.name ?? null,
      type: e.type,
      description: e.description,
      amount: e.amount,
      vatRate: e.vatRate,
      paymentMethod: e.paymentMethod ?? null,
    }));

    // -----------------------------
    // 🔹 Palautetaan kaikki
    // -----------------------------
    return NextResponse.json({
      income,
      expenses,
      profit,
      salesVat,
      purchaseVat,
      payableVat,
      entries: resultEntries,
    });

  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Serverivirhe" });
  }
}
