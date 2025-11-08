import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();


// 🔹 Hae kaikki laskut
export async function GET() {
  try {
    const invoices = await prisma.invoice.findMany({
      include: {
        lines: {
          include: {
            product: true, // jos haluat näyttää myös tuotteen nimen
          },
        },
        customer: true, // jos haluat mukaan asiakkaan
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(invoices);
  } catch (error) {
    console.error("Virhe haettaessa laskuja:", error);
    return NextResponse.json({ error: "Virhe haettaessa laskuja" }, { status: 500 });
  }
}

// 🔹 Luo uusi lasku + rivit

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

    // ✅ Jos laskulla on ID → päivitetään
   if (data.id) {
  // 🔹 Poistetaan vanhat rivit ensin
  await prisma.invoiceLine.deleteMany({
    where: { invoiceId: data.id },
  });

  // 🔹 Luodaan uudet rivit, jos niitä on
  if (data.lines && data.lines.length > 0) {
    await prisma.invoiceLine.createMany({
      data: data.lines.map((line: InvoiceLineInput) => ({
        invoiceId: data.id,
        productId: line.productId || null,
        description: line.description,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        vatRate: line.vatRate,
        total: line.total,
      })),
    });
  }

  // 🔹 Päivitä laskun perustiedot
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
      lines: true, // ✅ tuo mukaan päivitetyt rivit vastaukseen
    },
  });

  return NextResponse.json(updated);
}

    // ✅ Jos ID:tä ei ole → luodaan uusi lasku
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


// 🔹 Poista lasku (ID:n perusteella)
export async function DELETE(req: Request) {
    try {
        const { id } = await req.json();

        // Poistetaan rivit ensin
        await prisma.invoiceLine.deleteMany({ where: { invoiceId: id } });
        // Poistetaan lasku
        await prisma.invoice.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Virhe poistettaessa laskua:", error);
        return NextResponse.json({ error: "Virhe poistettaessa laskua" }, { status: 500 });
    }
}
