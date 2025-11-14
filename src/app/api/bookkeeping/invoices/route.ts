import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 🔹 Asiakkaan kentät
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

// 🔹 Laskurivi frontista
type InvoiceLineInput = {
  productId?: number | null;
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  total?: number;
  vatHandling: string;
  vatCode?: string | null;
};

// 🔹 Muodosta laskurivit tallennusta varten
const prepareLines = (lines: InvoiceLineInput[]) =>
  lines.map((line) => {
    const total =
      line.total ??
      line.unitPrice * line.quantity * (1 + line.vatRate / 100);

    return {
      productId: line.productId ?? null,
      description: line.description,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      vatRate: line.vatRate,
      vatHandling: line.vatHandling ?? null,
      vatCode: line.vatCode ?? null,
      total,
    };
  });

/* ============================================================
   🔹 HAE LASKUT
============================================================ */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const contactId = searchParams.get("contactId");

    const invoices = await prisma.invoice.findMany({
      where: contactId ? { customerId: Number(contactId) } : {},
      include: {
        lines: { include: { product: true } },
        customer: { select: customerSelect },
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(invoices);
  } catch (error) {
    console.error("Virhe haettaessa laskuja:", error);
    return NextResponse.json(
      { error: "Virhe haettaessa laskuja" },
      { status: 500 }
    );
  }
}

/* ============================================================
   🔹 LUO TAI PÄIVITÄ LASKU
============================================================ */
export async function POST(req: Request) {
  try {
    const data = await req.json();

    /* ============================================================
       🔸 PÄIVITÄ OLEMASSA OLEVA LASKU
    ============================================================ */
    if (data.id) {
      const invoiceId = data.id;

      // Poista vanhat rivit
      await prisma.invoiceLine.deleteMany({ where: { invoiceId } });

      // Lisää uudet rivit
      if (Array.isArray(data.lines) && data.lines.length > 0) {
        const lines = prepareLines(data.lines).map((l) => ({
          ...l,
          invoiceId,
        }));

        await prisma.invoiceLine.createMany({ data: lines });
      }

      // Päivitä laskun metadata
      const updated = await prisma.invoice.update({
        where: { id: invoiceId },
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
          status: data.status,
        },
        include: {
          lines: { include: { product: true } },
          customer: { select: customerSelect },
        },
      });

      return NextResponse.json(updated);
    }

    /* ============================================================
       🔸 LUO UUSI LASKU
    ============================================================ */
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
        status: data.status || "DRAFT",
        lines: {
          create: prepareLines(data.lines), // Prisma lisää invoiceId:n automaattisesti
        },
      },
      include: {
        lines: { include: { product: true } },
        customer: { select: customerSelect },
      },
    });

    return NextResponse.json(newInvoice);
  } catch (error) {
    console.error("Virhe tallennettaessa laskua:", error);
    return NextResponse.json(
      { error: "Virhe tallennettaessa laskua" },
      { status: 500 }
    );
  }
}

/* ============================================================
   🔹 POISTA LASKU
============================================================ */
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
