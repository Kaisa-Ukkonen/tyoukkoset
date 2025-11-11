import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 🔹 Yhteinen asiakas-select (käytetään kaikissa kohdissa)
const customerSelect = {
  id: true,
  name: true,
  type: true,
  customerCode: true,
  email: true,
  address: true,
  zip: true,
  city: true,

};

// 🔹 Laskurivin tyyppi
type InvoiceLineInput = {
  productId?: number | null;
  description: string;
  quantity: number;
  unitPrice: number; // veroton yksikköhinta
  vatRate: number;
  total?: number; // verollinen kokonaishinta
};

// ============================================================
// 🔹 HAE kaikki laskut
// ============================================================
export async function GET() {
  try {
    const invoices = await prisma.invoice.findMany({
      include: {
        lines: {
          include: { product: true },
        },
        customer: { select: customerSelect },
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(invoices);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Virhe haettaessa laskuja:", error.message, error.stack);
      return NextResponse.json(
        { error: error.message || "Virhe haettaessa laskuja" },
        { status: 500 }
      );
    }

    console.error("Tuntematon virhe haettaessa laskuja:", error);
    return NextResponse.json(
      { error: "Tuntematon virhe haettaessa laskuja" },
      { status: 500 }
    );
  }
}

// ============================================================
// 🔹 LUO tai PÄIVITÄ lasku (tässä laskut tallennetaan valmiiksi laskettuina)
// ============================================================
export async function POST(req: Request) {
  try {
    const data = await req.json();

    // 🔸 Apufunktio laskurivien laskemiseen ennen tallennusta
    const prepareLines = (lines: InvoiceLineInput[], invoiceId?: number) =>
      lines.map((line) => {
        const netPrice = line.unitPrice; // veroton yksikköhinta
        const total = line.quantity * netPrice * (1 + line.vatRate / 100); // verollinen kokonaishinta

        const baseLine = {
          invoiceId: invoiceId ?? 0, // 🔹 Prisma vaatii kentän, mutta 0 korvataan oikealla ID:llä vain update-käytössä
          productId: line.productId ?? null,
          description: line.description,
          quantity: line.quantity,
          unitPrice: netPrice,
          vatRate: line.vatRate,
          total,
        };

        return baseLine;
      });

    // ============================================================
    // 🔸 Päivitetään olemassa oleva lasku
    // ============================================================
    if (data.id) {
      await prisma.invoiceLine.deleteMany({ where: { invoiceId: data.id } });

      if (Array.isArray(data.lines) && data.lines.length > 0) {
        const lines = prepareLines(data.lines, data.id);
        await prisma.invoiceLine.createMany({ data: lines });
      }

      const updated = await prisma.invoice.update({
        where: { id: data.id },
        data: { /* ... */ },
        include: { lines: { include: { product: true } }, customer: { select: customerSelect } },
      });

      return NextResponse.json(updated);
    }

    // ============================================================
    // 🔸 Luodaan uusi lasku
    // ============================================================
    const newInvoice = await prisma.invoice.create({
      data: {

        date: new Date(data.date),
        dueDate: new Date(data.dueDate),
        paymentTerm: data.paymentTerm,
        customerId: data.customerId || null,
        customCustomer: data.customCustomer || null,
        notes: data.notes || "",
        netAmount: data.netAmount,
        vatAmount: data.vatAmount,
        totalAmount: data.totalAmount,
        vatRate: data.vatRate,
        status: data.status || "DRAFT",
        lines: {
          // 🟢 poistetaan invoiceId kun käytetään relaatio-luontia
          create: prepareLines(data.lines).map((line) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { invoiceId, ...rest } = line;
            return rest;
          }),
        },
      },
      include: {
        lines: { include: { product: true } },
        customer: { select: customerSelect },
      },
    });

    return NextResponse.json(newInvoice);
  } catch (error) {
    console.error("Virhe luotaessa tai päivittäessä laskua:", error);
    return NextResponse.json(
      { error: "Virhe tallennettaessa laskua" },
      { status: 500 }
    );
  }
}

// ============================================================
// 🔹 POISTA lasku
// ============================================================
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();

    await prisma.invoiceLine.deleteMany({ where: { invoiceId: id } });
    await prisma.invoice.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Virhe poistettaessa laskua:", error);
    return NextResponse.json(
      { error: "Virhe poistettaessa laskua" },
      { status: 500 }
    );
  }
}
