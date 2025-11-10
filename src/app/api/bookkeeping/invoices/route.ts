import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 🔹 Yhteinen asiakas-select (käytetään kaikissa kohdissa)
const customerSelect = {
  id: true,
  name: true,
  type: true,
  customerCode: true,
  email: true,      // ✅ uusi
  address: true,    // ✅ uusi
  zip: true,        // ✅ uusi
  city: true,       // ✅ uusi
  enableBilling: true,
};

// 🔹 Hae kaikki laskut
export async function GET() {
  try {
    const invoices = await prisma.invoice.findMany({
      include: {
        lines: {
          include: {
            product: true, // ✅ tuo mukaan tuotteen nimi
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            type: true,
            customerCode: true,
            email: true,
            address: true,
            zip: true,
            city: true,
            enableBilling: true,
          },
        },
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

// 🔹 Laskurivin tyyppi (käytetään sekä create että update)
type InvoiceLineInput = {
  productId?: number | null;
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  total: number;
};

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // 🔹 Päivitetään olemassa oleva lasku
    if (data.id) {
      await prisma.invoiceLine.deleteMany({ where: { invoiceId: data.id } });

      if (Array.isArray(data.lines) && data.lines.length > 0) {
        const lines: InvoiceLineInput[] = data.lines.map((line: InvoiceLineInput) => ({
          productId: line.productId ?? null,
          description: line.description,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          vatRate: line.vatRate,
          total: line.total,
        }));

        await prisma.invoiceLine.createMany({
          data: lines.map((line) => ({
            invoiceId: data.id,
            ...line,
          })),
        });
      }

      const updated = await prisma.invoice.update({
        where: { id: data.id },
        data: {
          invoiceNumber: data.invoiceNumber,
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
        },
        include: {
          lines: { include: { product: true } },
          customer: { select: customerSelect },
        },
      });

      return NextResponse.json(updated);
    }

    // 🔹 Luodaan uusi lasku
    const newInvoice = await prisma.invoice.create({
      data: {
        invoiceNumber: data.invoiceNumber,
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
          create: (data.lines as InvoiceLineInput[]).map((line) => ({
            productId: line.productId ?? null,
            description: line.description,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            vatRate: line.vatRate,
            total: line.total,
          })),
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


// 🔹 Poista lasku
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
