import { NextRequest, NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import { prisma } from "@/lib/prisma";

import fs from "fs";
import path from "path";



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

  // =====================================================
  // 🔹 Luo PDF
  // =====================================================
  const doc = new PDFDocument({ margin: 50 });
  const buffers: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => buffers.push(chunk));

  // 🔹 Logo
  const logoPath = path.join(process.cwd(), "public/keltainenlogo.png");
  if (fs.existsSync(logoPath)) doc.image(logoPath, 50, 40, { width: 90 });

  // 🔹 Otsikko
  doc.font("Times-Bold").fontSize(16).fillColor("black").text("LASKU", 350, 90);

  // =====================================================
  // 🔹 Laskuttajan tiedot
  // =====================================================
  const leftTop = 130;
  doc.font("Times-Bold").fontSize(12).text("Laskuttaja:", 50, leftTop);
  doc.font("Times-Roman").fontSize(10);
  doc.text("Tmi TyöUkkoset", 50, leftTop + 15);
  doc.text("Jesse Kalervo Ukkonen");
  doc.text("Kassarapolku 4");
  doc.text("71800 Siilinjärvi");
  doc.text("tyoukkoset@gmail.com");
  doc.text("Y-tunnus: 3518481-5");

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
if (customerEmail) doc.text(customerEmail, 50);

// 🔹 Näytetään "Asiakastunnus" yksityisille ja "Y-tunnus" yrityksille
if (customer?.customerCode) {
  const tunnusLabel =
    customer?.type?.toLowerCase() === "yksityishenkilö"
      ? "Asiakastunnus"
      : "Y-tunnus";
  doc.text(`${tunnusLabel}: ${customer.customerCode}`, 50);
}

  // =====================================================
  // 🔹 Laskun tiedot
  // =====================================================
  const rightX = 350;
  const infoY = 130;
  doc.font("Times-Bold").fontSize(12).text("Laskun tiedot:", rightX, infoY);
  doc.font("Times-Roman").fontSize(10);
  doc.text(`Laskun numero: ${invoice.invoiceNumber ?? "—"}`, rightX, infoY + 15);
  doc.text(`Laskun päiväys: ${new Date(invoice.date).toLocaleDateString("fi-FI")}`);
  doc.text(`Eräpäivä: ${new Date(invoice.dueDate).toLocaleDateString("fi-FI")}`);
  doc.text(`Maksuehto: ${invoice.paymentTerm} päivää`);
  doc.text("Viivästyskorko: 7,0 %");
  if (invoice.status === "DRAFT") {
    doc.text(`Tila: ${invoice.status}`);
  }

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
    const vatAmount = (line.unitPrice * line.quantity * line.vatRate) / 100;
    const total = line.quantity * line.unitPrice * (1 + line.vatRate / 100);

    doc.text(line.description || "-", 50, currentY);
    doc.text(`${line.quantity}`, 230, currentY);
    doc.text(`${line.unitPrice.toFixed(2)} €`, 290, currentY);
    doc.text(`${vatAmount.toFixed(2)} €`, 370, currentY);
    doc.text(`${line.vatRate.toFixed(1)} %`, 450, currentY);
    doc.text(`${total.toFixed(2)} €`, 520, currentY);
    currentY += 15;
  });

  // =====================================================
// 🔹 Summat (siististi oikeassa reunassa mutta ei yli)
// =====================================================
const netSum = invoice.lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0);
const vatSum = invoice.lines.reduce(
  (s, l) => s + (l.quantity * l.unitPrice * l.vatRate) / 100,
  0
);
const totalSum = netSum + vatSum;

doc.moveDown(2);
doc.fontSize(10);
doc.fillColor("black");

// vähän vasemmalle, ettei karkaa reunasta
const sumRightX = 500;
const labelX = sumRightX - 80; // selitteet vähän vasemmalle
const lineYStart = doc.y;

// Veroton summa
doc.text("Veroton summa:", labelX, lineYStart);
doc.text(`${netSum.toFixed(2)} €`, sumRightX, lineYStart, { align: "right" });

// ALV
const lineY2 = lineYStart + 15;
doc.text("ALV:", labelX, lineY2);
doc.text(`${vatSum.toFixed(2)} €`, sumRightX, lineY2, { align: "right" });

// erotusviiva ennen yhteensä
doc
  .moveTo(labelX, lineY2 + 12)
  .lineTo(sumRightX, lineY2 + 12)
  .strokeColor("#999")
  .lineWidth(0.5)
  .stroke();

// Yhteensä
doc.font("Times-Bold");
const lineY3 = lineY2 + 20;
doc.text("Yhteensä:", labelX, lineY3);
doc.text(`${totalSum.toFixed(2)} €`, sumRightX, lineY3, { align: "right" });
doc.font("Times-Roman");


  // =====================================================
  // 🔹 Jos lasku on LUONNOS → ei maksutietoja, vain vesileima
  // =====================================================
  if (invoice.status === "DRAFT") {
    doc.fontSize(60).fillColor("red").opacity(0.3);
    doc.text("LUONNOS", 150, 400, { angle: 45 });
    doc.opacity(1).fillColor("black");

    // Lopetetaan tähän – ei viitenumeroita tai virtuaaliviivakoodeja
    doc.end();

    const pdfBuffer = await new Promise<Buffer>((resolve) => {
      const bufs: Buffer[] = [];
      doc.on("data", (chunk: Buffer) => bufs.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(bufs)));
    });

    const uint8 = new Uint8Array(pdfBuffer);

    return new NextResponse(uint8, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="luonnos.pdf"`,
      },
    });
  }

  // =====================================================
  // 🔹 Maksutiedot ja virtuaaliviivakoodi (vain hyväksytyille)
  // =====================================================
  const startX = 50;
  let startY = doc.y + 40;
  const tableWidth = 500;
  const col1Width = 200;
  const col2Width = 150;
  const rowHeight = 38;

  const spaceNeeded = rowHeight * 2 + 80;
  if (startY + spaceNeeded > 760) startY = 700 - spaceNeeded;

  doc.lineWidth(0.5).strokeColor("black");
  doc.rect(startX, startY, tableWidth, rowHeight * 2).stroke();
  doc.moveTo(startX + col1Width, startY).lineTo(startX + col1Width, startY + rowHeight * 2).stroke();
  doc.moveTo(startX + col1Width + col2Width, startY).lineTo(startX + col1Width + col2Width, startY + rowHeight * 2).stroke();
  doc.moveTo(startX, startY + rowHeight).lineTo(startX + tableWidth, startY + rowHeight).stroke();

  const iban = "FI49 1078 3500 8152 11";
  const bic = "NDEAFIHH";
  const recipient = "Jesse Kalervo Ukkonen";
  const dueDate = new Date(invoice.dueDate).toLocaleDateString("fi-FI");
  const totalText = `${totalSum.toFixed(2)} €`;
  const refNumber = invoice.referenceNumber || invoice.invoiceNumber?.toString() || "";

  doc.font("Times-Bold").fontSize(10);
  doc.text("Vastaanottajan tilinumero", startX + 5, startY + 6);
  doc.text("BIC", startX + col1Width + 5, startY + 6);
  doc.text("Eräpäivä", startX + col1Width + col2Width + 5, startY + 6);
  doc.font("Times-Roman").fontSize(10);
  doc.text(iban, startX + 5, startY + 20);
  doc.text(bic, startX + col1Width + 5, startY + 20);
  doc.text(dueDate, startX + col1Width + col2Width + 5, startY + 20);

  doc.font("Times-Bold");
  doc.text("Maksun vastaanottaja", startX + 5, startY + rowHeight + 6);
  doc.text("Viitenumero", startX + col1Width + 5, startY + rowHeight + 6);
  doc.text("Maksettava EUR", startX + col1Width + col2Width + 5, startY + rowHeight + 6);

  doc.font("Times-Roman");
  doc.text(recipient, startX + 5, startY + rowHeight + 20);
  doc.text(refNumber, startX + col1Width + 5, startY + rowHeight + 20);
  doc.text(totalText, startX + col1Width + col2Width + 5, startY + rowHeight + 20);

  // =====================================================
  // 🔹 Virtuaaliviivakoodi (versio 4, kotimainen viite, 54 numeroa)
  // =====================================================

  const ibanForCode = "FI4910783500815211";
  const bban = ibanForCode.slice(2); // 16 numeroa ilman FI

  // Summa sentteinä (8 numeroa)
  const amount = Math.round(totalSum * 100).toString().padStart(8, "0");

  // Kotimainen viite (vain numerot, 20 merkkiä, nollilla vasemmalta)
  const baseRef = (invoice.referenceNumber || invoice.invoiceNumber?.toString() || "0").replace(/\D/g, "") || "0";
  const refPadded = baseRef.padStart(23, "0");


  // Eräpäivä VVKKPP
  const due = new Date(invoice.dueDate);
  const dueDateForCode = `${due.getFullYear().toString().slice(2)}${(due.getMonth() + 1)
    .toString()
    .padStart(2, "0")}${due.getDate().toString().padStart(2, "0")}`;

  // Lopullinen koodi
  const virtualCode = `4${bban}${amount}${refPadded}${dueDateForCode}`;

  // Tarkistuslogiikka
  if (virtualCode.length !== 54) {
    console.warn(`⚠️ Virtuaaliviivakoodin pituus ${virtualCode.length}, odotettu 54`);
  }

  // Tulostus PDF:ään
  const virtualY = startY + rowHeight * 2 + 25;
  doc.font("Times-Bold").fontSize(10).fillColor("black");
  doc.text("Virtuaaliviivakoodi:", startX, virtualY);
  doc.font("Courier").fontSize(10);
  doc.text(virtualCode, startX, virtualY + 15);
  // =====================================================
  // 🔹 Palautus
  // =====================================================
  doc.end();

  const pdfBuffer = await new Promise<Buffer>((resolve) => {
    const bufs: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => bufs.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(bufs)));
  });

  const uint8 = new Uint8Array(pdfBuffer);

  return new NextResponse(uint8, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="lasku_${invoice.invoiceNumber}.pdf"`,
    },
  });
}
