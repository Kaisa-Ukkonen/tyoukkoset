import { NextRequest, NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const invoiceId = Number(id);

  if (Number.isNaN(invoiceId)) {
    return NextResponse.json({ error: "Virheellinen laskun ID" }, { status: 400 });
  }

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { customer: true, lines: { include: { product: true } } },
  });

  if (!invoice) {
    return NextResponse.json({ error: "Laskua ei löytynyt" }, { status: 404 });
  }

  // 🔹 Luo PDF oletusfontilla (Times-Roman)
  const doc = new PDFDocument({ margin: 50 });

  const buffers: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => buffers.push(chunk));
  doc.on("end", () => {});

  // 🔹 Logo
  const logoPath = path.join(process.cwd(), "public/keltainenlogo.png");
  if (fs.existsSync(logoPath)) doc.image(logoPath, 50, 40, { width: 90 });

  // 🔹 Otsikko “LASKU”
  doc.font("Times-Bold").fontSize(20).fillColor("#FFD700").text("LASKU", 400, 50, { align: "right" });

  // 🔹 Yrityksen tiedot
  doc.font("Times-Roman").fontSize(10).fillColor("black");
  doc.text("TyöUkkoset", 50, 140);
  doc.text("Kuopion alueella", 50);
  doc.text("tyoukkoset@gmail.com");
  doc.text("Y-tunnus: 1234567-8");
  doc.moveDown();

  // 🔹 Laskun ja asiakkaan tiedot
  const yStart = 180;
  doc.fontSize(12).fillColor("black");
  doc.text(`Laskun numero: ${invoice.invoiceNumber}`, 50, yStart);
  doc.text(`Asiakas: ${invoice.customCustomer || invoice.customer?.name || "Asiakas"}`);
  doc.text(`Laskun päiväys: ${new Date(invoice.date).toLocaleDateString("fi-FI")}`);
  doc.text(`Eräpäivä: ${new Date(invoice.dueDate).toLocaleDateString("fi-FI")}`);
  doc.text(`Maksuehto: ${invoice.paymentTerm} päivää`);
  doc.moveDown(1.5);

  // 🔹 Tuoterivit otsikko
  doc.fontSize(12).fillColor("#FFD700").text("Tuotteet / palvelut:");
  doc.moveDown(0.3);

  // Taulukon otsakkeet
  doc.fontSize(10).fillColor("black");
  doc.text("Kuvaus", 50, doc.y);
  doc.text("Määrä", 250, doc.y);
  doc.text("Hinta (€)", 320, doc.y);
  doc.text("Yhteensä (€)", 420, doc.y);
  doc.moveDown(0.5);
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();

  // 🔹 Tuoterivit
  invoice.lines.forEach((line) => {
    const total = line.quantity * line.unitPrice;
    doc.text(line.description || "-", 50, doc.y + 5);
    doc.text(`${line.quantity}`, 260, doc.y);
    doc.text(line.unitPrice.toFixed(2), 340, doc.y);
    doc.text(total.toFixed(2), 440, doc.y);
    doc.moveDown(0.5);
  });

  doc.moveDown(1);

  // 🔹 Summat
  doc.fontSize(10).fillColor("black");
  doc.text(`Veroton summa: ${invoice.netAmount.toFixed(2)} €`, 400);
  doc.text(`ALV: ${invoice.vatAmount.toFixed(2)} €`, 400);
  doc.text(`Yhteensä: ${invoice.totalAmount.toFixed(2)} €`, 400);
  doc.moveDown(1);

  // 🔹 LUONNOS-vesileima
  doc.fontSize(60).fillColor("red").opacity(0.3);
  doc.text("LUONNOS", 150, 400, { angle: 45 });

  // Lopeta PDF
  doc.end();

  // 🔹 Muodosta buffer ja palauta PDF
  const pdfBuffer = await new Promise<Buffer>((resolve) => {
    const buffers: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => buffers.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
  });

  const uint8 = new Uint8Array(pdfBuffer);

  return new NextResponse(uint8, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="lasku_${invoice.invoiceNumber}.pdf"`,
    },
  });
}
