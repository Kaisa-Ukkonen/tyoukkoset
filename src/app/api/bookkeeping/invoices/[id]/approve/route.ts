import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

// PDF generointi tehdään API-routea kutsumalla Node-puolella
async function generateInvoicePdfBuffer(invoiceId: number): Promise<Buffer> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  const res = await fetch(
    `${baseUrl}/api/bookkeeping/invoices/${invoiceId}/pdf`,
    { cache: "no-store" }
  );

  if (!res.ok) throw new Error("PDF-generointi epäonnistui");

  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

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
      include: {
        lines: { include: { product: true } },
        customer: true,
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: "Laskua ei löytynyt" },
        { status: 404 }
      );
    }

    if (invoice.status === "APPROVED") {
      return NextResponse.json(
        { message: "Lasku on jo hyväksytty." },
        { status: 400 }
      );
    }

    // 🔹 Hae laskunumerolaskuri
    let counter = await prisma.invoiceCounter.findFirst();
    if (!counter) {
      counter = await prisma.invoiceCounter.create({
        data: { current: 103 },
      });
    }

    const nextNumber = counter.current + 1;
    const referenceNumber = generateFinnishReference(nextNumber);

    // 🔹 Päivitä lasku hyväksytyksi
    const updatedInvoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        invoiceNumber: nextNumber,
        referenceNumber,
        status: "APPROVED",
      },
    });

    // 🔹 Päivitä laskurilaskuri
    await prisma.invoiceCounter.update({
      where: { id: counter.id },
      data: { current: nextNumber },
    });

    // =====================================================
    // 🔥 LUODAAN KIRJANPITOTAPAHTUMA + TOSITE PDF
    // =====================================================

    for (const line of invoice.lines) {
      if (!line.product) continue;
      if (line.product.type !== "Palvelu") continue;

      const product = line.product;

      const category = await prisma.category.findFirst({
        where: { name: "Palvelumyynti" },
      });

      if (!category) {
        console.warn("Kategoriaa ei löytynyt tuotteelle:", product.category);
        continue;
      }

      const net = line.unitPrice * line.quantity;
      const vat = (net * line.vatRate) / 100;
      const total = net + vat;

      // 🔹 Luo kirjanpitotapahtuma
      const entry = await prisma.bookkeepingEntry.create({
        data: {
          date: invoice.date,
          description: product.name,
          type: "tulo",
          amount: total,
          vatRate: line.vatRate,
          vatAmount: vat,
          categoryId: category.id,
          contactId: invoice.customerId ?? null,
          paymentMethod: "lasku",
        },
      });

      // =====================================================
      // 🔥 LUO PDF TÄHÄN ENTRYLLE JA TALLENNA 
      // =====================================================

      const buffer = await generateInvoicePdfBuffer(invoiceId);

      const receiptsDir = path.join(process.cwd(), "public", "receipts");
      if (!fs.existsSync(receiptsDir)) {
        fs.mkdirSync(receiptsDir, { recursive: true });
      }

      const filePath = path.join(
        receiptsDir,
        `lasku_${nextNumber}.pdf`
      );

      fs.writeFileSync(filePath, buffer);

      await prisma.receipt.create({
        data: {
          entryId: entry.id,
          fileUrl: `/receipts/lasku_${nextNumber}.pdf`,
        },
      });
    }

    return NextResponse.json({
      message: "Lasku hyväksytty, PDF luotu ja kirjanpitotapahtumat tallennettu.",
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
