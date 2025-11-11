import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 🔹 Suomen viitenumeron tarkisteen laskenta
function generateFinnishReference(base: number): string {
  const weights = [7, 3, 1];
  const digits = base.toString().split("").reverse().map(Number);
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    sum += digits[i] * weights[i % 3];
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  return `${base}${checkDigit}`;
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const invoiceId = Number(id);

    if (Number.isNaN(invoiceId)) {
      return NextResponse.json(
        { error: "Virheellinen laskun ID" },
        { status: 400 }
      );
    }

    // 🔹 Hae lasku
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: "Laskua ei löytynyt" },
        { status: 404 }
      );
    }

    // 🔹 Estä tuplahyväksyntä
    if (invoice.status === "APPROVED") {
      return NextResponse.json(
        { message: "Lasku on jo hyväksytty." },
        { status: 400 }
      );
    }

    // 🔹 Hae laskunumerolaskuri (tai luo jos ei ole)
    let counter = await prisma.invoiceCounter.findFirst();
    if (!counter) {
      counter = await prisma.invoiceCounter.create({
        data: { current: 103 },
      });
    }

    const nextNumber = counter.current + 1;
    const referenceNumber = generateFinnishReference(nextNumber);

    // 🔹 Päivitä lasku
    const updatedInvoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        invoiceNumber: nextNumber,
        referenceNumber,
        status: "APPROVED",
      },
    });

    // 🔹 Päivitä laskurin arvo
    await prisma.invoiceCounter.update({
      where: { id: counter.id },
      data: { current: nextNumber },
    });

    return NextResponse.json({
      message: "Lasku hyväksytty onnistuneesti.",
      invoice: updatedInvoice,
    });
  } catch (error) {
    console.error("Virhe laskun hyväksynnässä:", error);
    return NextResponse.json(
      { error: "Laskun hyväksyntä epäonnistui." },
      { status: 500 }
    );
  }
}
