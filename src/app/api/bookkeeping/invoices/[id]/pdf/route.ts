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
    return NextResponse.json(
      { error: "Virheellinen laskun ID" },
      { status: 400 }
    );
  }

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { customer: true, lines: { include: { product: true } } },
  });

  if (!invoice) {
    return NextResponse.json(
      { error: "Laskua ei löytynyt" },
      { status: 404 }
    );
  }

  // =====================================================
  // 🔹 Luo PDF
  // =====================================================
  const doc = new PDFDocument({ margin: 50 });
  const buffers: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => buffers.push(chunk));
  doc.on("end", () => {});

  // 🔹 Logo
  const logoPath = path.join(process.cwd(), "public/keltainenlogo.png");
  if (fs.existsSync(logoPath)) doc.image(logoPath, 50, 40, { width: 90 });

  // 🔹 Otsikko “LASKU”
  doc
    .font("Times-Bold")
    .fontSize(16)
    .fillColor("black")
    .text("LASKU", 350, 90);

  // =====================================================
  // 🔹 Laskuttajan tiedot
  // =====================================================
  const leftTop = 130;
  doc.font("Times-Bold").fontSize(12).fillColor("black").text("Laskuttaja:", 50, leftTop);
  doc.font("Times-Roman").fontSize(10);
  doc.text("Tmi TyöUkkoset", 50, leftTop + 15);
  doc.text("Kassarapolku 4");
  doc.text("71800 Siilinjärvi");
  doc.text("tyoukkoset@gmail.com");
  doc.text("Y-tunnus: 3518481-5");
  doc.moveDown(1.5);

  // =====================================================
  // 🔹 Asiakkaan tiedot
  // =====================================================
  const customer = invoice.customer;
  const customerName = invoice.customCustomer || customer?.name || "Asiakas";
  const customerAddress = customer?.address || "";
  const customerZipCity = [customer?.zip, customer?.city].filter(Boolean).join(" ");
  const customerEmail = customer?.email || "";

  const leftY = 220;
  doc.font("Times-Bold").fontSize(12).text("Laskutusosoite:", 50, leftY);
  doc.font("Times-Roman").fontSize(10);
  const y = leftY + 15;
  doc.text(customerName, 50, y);
  if (customerAddress) doc.text(customerAddress, 50);
  if (customerZipCity) doc.text(customerZipCity, 50);
  if (customerEmail) doc.text(`Sähköposti: ${customerEmail}`, 50);
  if (customer?.customerCode) doc.text(`Y-tunnus: ${customer.customerCode}`, 50);

  // =====================================================
  // 🔹 Laskun tiedot
  // =====================================================
  const rightX = 350;
  const infoY = 130;
  doc.font("Times-Bold").fontSize(12).text("Laskun tiedot:", rightX, infoY);
  doc.font("Times-Roman").fontSize(10);
  doc.text(`Laskun numero: ${invoice.invoiceNumber}`, rightX, infoY + 15);
  doc.text(`Laskun päiväys: ${new Date(invoice.date).toLocaleDateString("fi-FI")}`);
  doc.text(`Eräpäivä: ${new Date(invoice.dueDate).toLocaleDateString("fi-FI")}`);
  doc.text(`Maksuehto: ${invoice.paymentTerm} päivää`);
  doc.text("Viivästyskorko: 7,0 %");
  doc.text("Maksuviite: XXXXXXXX");

  // =====================================================
  // 🔹 Tuoterivit
  // =====================================================
  doc.moveDown(7);
  const productsStartY = 350;
  doc.fontSize(10).fillColor("black");

  doc.text("Kuvaus", 50, productsStartY);
  doc.text("Määrä", 220, productsStartY);
  doc.text("A-hinta", 280, productsStartY);
  doc.text("ALV-osuus", 360, productsStartY);
  doc.text("ALV %", 440, productsStartY);
  doc.text("Yhteensä", 510, productsStartY);

  doc.moveTo(50, productsStartY + 12).lineTo(580, productsStartY + 12).stroke();

  let currentY = productsStartY + 20;

  invoice.lines.forEach((line) => {
    const unitPrice = line.unitPrice;
    const vatAmount = (unitPrice * line.quantity * line.vatRate) / 100;
    const total = line.quantity * unitPrice * (1 + line.vatRate / 100);

    doc.text(line.description || "-", 50, currentY);
    doc.text(`${line.quantity}`, 230, currentY);
    doc.text(`${unitPrice.toFixed(2)} €`, 290, currentY);
    doc.text(`${vatAmount.toFixed(2)} €`, 370, currentY);
    doc.text(`${line.vatRate.toFixed(1)} %`, 450, currentY);
    doc.text(`${total.toFixed(2)} €`, 520, currentY);
    currentY += 15;
  });

  // =====================================================
  // 🔹 Summat (riveistä laskettuna)
  // =====================================================
  const netSum = invoice.lines.reduce(
    (sum, line) => sum + line.quantity * line.unitPrice,
    0
  );
  const vatSum = invoice.lines.reduce(
    (sum, line) =>
      sum + (line.quantity * line.unitPrice * line.vatRate) / 100,
    0
  );
  const totalSum = netSum + vatSum;

  doc.moveDown(2);
  doc.fontSize(10);
  doc.text(`Veroton summa: ${netSum.toFixed(2)} €`, 400);
  doc.text(`ALV: ${vatSum.toFixed(2)} €`, 400);
  doc.text(`Yhteensä: ${totalSum.toFixed(2)} €`, 400);

 // 🔹 LUONNOS-vesileima
doc.fontSize(60).fillColor("red").opacity(0.3);
doc.text("LUONNOS", 150, 400, { angle: 45 });

// ✅ Palautetaan asetukset normaaleiksi
doc.opacity(1).fillColor("black");

  // =====================================================
  // 🔹 Maksutiedot taulukkomuodossa
  // =====================================================
  doc.moveDown(3);
  const startX = 50;
  const startY = doc.y + 10;
  const tableWidth = 500;
  const col1Width = 200;
  const col2Width = 150;
  const rowHeight = 38;

  // Kehys ja viivat
  doc.save();
  doc.lineWidth(0.5).strokeColor("black");
  doc.rect(startX, startY, tableWidth, rowHeight * 2).stroke();
  doc.moveTo(startX + col1Width, startY).lineTo(startX + col1Width, startY + rowHeight * 2).stroke();
  doc.moveTo(startX + col1Width + col2Width, startY).lineTo(startX + col1Width + col2Width, startY + rowHeight * 2).stroke();
  doc.moveTo(startX, startY + rowHeight).lineTo(startX + tableWidth, startY + rowHeight).stroke();
  doc.restore();

  // Maksutiedot
  const iban = "FI12 7997 7997 1234 56";
  const bic = "HOLVFIHH";
  const recipient = "Tmi TyöUkkoset";
  const dueDate = new Date(invoice.dueDate).toLocaleDateString("fi-FI");
  const total = `${totalSum.toFixed(2)} €`; // ✅ Käytetään oikeaa kokonaissummaa
  const refNumber = invoice.referenceNumber || invoice.invoiceNumber.toString();

  const textOptions = { continued: false, lineBreak: false };

  // ---------- Rivi 1 ----------
  doc.font("Times-Bold").fontSize(10);
  doc.text("Vastaanottajan tilinumero", startX + 5, startY + 6, textOptions);
  doc.text("BIC", startX + col1Width + 5, startY + 6, textOptions);
  doc.text("Eräpäivä", startX + col1Width + col2Width + 5, startY + 6, textOptions);

  doc.font("Times-Roman").fontSize(10);
  doc.text(iban, startX + 5, startY + 20, textOptions);
  doc.text(bic, startX + col1Width + 5, startY + 20, textOptions);
  doc.text(dueDate, startX + col1Width + col2Width + 5, startY + 20, textOptions);

  // ---------- Rivi 2 ----------
  doc.font("Times-Bold").fontSize(10);
  doc.text("Maksun vastaanottaja", startX + 5, startY + rowHeight + 6, textOptions);
  doc.text("Viitenumero", startX + col1Width + 5, startY + rowHeight + 6, textOptions);
  doc.text("Maksettava EUR", startX + col1Width + col2Width + 5, startY + rowHeight + 6, textOptions);

  doc.font("Times-Roman").fontSize(10);
  doc.text(recipient, startX + 5, startY + rowHeight + 20, textOptions);
  doc.text(refNumber, startX + col1Width + 5, startY + rowHeight + 20, textOptions);

  // ✅ Lihavoidaan maksettava summa
  doc.font("Times-Bold");
  doc.text(total, startX + col1Width + col2Width + 5, startY + rowHeight + 20, textOptions);
  doc.font("Times-Roman");

  // =====================================================
  // 🔹 PDF:n palautus
  // =====================================================
  doc.end();

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
