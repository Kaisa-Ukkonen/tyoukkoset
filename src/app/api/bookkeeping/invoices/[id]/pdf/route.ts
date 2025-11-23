import { NextRequest, NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import { prisma } from "@/lib/prisma";

import fs from "fs";
import path from "path";


import JsBarcode from "jsbarcode";
import svg2img from "svg2img";
import { JSDOM } from "jsdom";



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

  doc.on("error", (err: unknown) => {
    console.error("PDF ERROR:", err);
  });

  function writeLine(text: string, x: number, y: number) {
    doc.font("Times-Roman").fontSize(10);
    doc.text(text, x, y);
  }

  function writeInfo(
    label: string,
    value: string | number,
    x: number,
    y: number
  ) {
    doc.font("Times-Roman").fontSize(10);
    doc.text(label, x, y);
    doc.text(String(value), x + 120, y); // muutetaan varmuudella stringiksi
  }


  function formatEuro(value: number): string {
    return value.toFixed(2).replace(".", ",");
  }
  function formatVatRate(rate: number): string {
    return Number.isInteger(rate)
      ? rate.toString()               // esim. 25 → "25"
      : rate.toString().replace(".", ","); // esim. 25.5 → "25,5"
  }

  // 🔹 Logo
  const logoPath = path.join(process.cwd(), "public/logoMustaTeksti.png");
  if (fs.existsSync(logoPath)) doc.image(logoPath, 50, 40, { width: 120 });

  // 🔹 Otsikko
  doc.font("Times-Bold").fontSize(16).fillColor("black").text("LASKU", 350, 90);

  // =====================================================
  // 🔹 Laskuttajan tiedot
  // =====================================================
  const leftTop = 130;
  let yAddr = leftTop + 15;
  doc.font("Times-Bold").fontSize(12).text("Laskuttaja:", 50, leftTop);
  doc.font("Times-Roman").fontSize(10);
  writeLine("Tmi TyöUkkoset", 50, yAddr); yAddr += 12;
  writeLine("Jesse Kalervo Ukkonen", 50, yAddr); yAddr += 12;
  writeLine("Kassarapolku 4", 50, yAddr); yAddr += 12;
  writeLine("71800 Siilinjärvi", 50, yAddr); yAddr += 12;
  writeLine("tyoukkoset@gmail.com", 50, yAddr); yAddr += 12;
  writeLine("Y-tunnus: 3518481-5", 50, yAddr); yAddr += 12;

  // =====================================================
  // 🔹 Asiakkaan tiedot
  // =====================================================
  const customer = invoice.customer;
  const customerName = invoice.customCustomer || customer?.name || "Asiakas";
  const customerAddress = customer?.address || "";
  const customerZipCity = [customer?.zip, customer?.city].filter(Boolean).join(" ");
  const customerEmail = customer?.email || "";

  const leftY = 240;
  doc.font("Times-Bold").fontSize(12).text("Laskutusosoite:", 50, leftY);
  doc.font("Times-Roman").fontSize(10);

  let custY = leftY + 15;

  writeLine(customerName, 50, custY); custY += 12;
  if (customerAddress) { writeLine(customerAddress, 50, custY); custY += 12; }
  if (customerZipCity) { writeLine(customerZipCity, 50, custY); custY += 12; }
  if (customerEmail) { writeLine(customerEmail, 50, custY); custY += 12; }

  if (customer?.customerCode) {
    const label =
      customer.type?.toLowerCase() === "yksityishenkilö"
        ? "Asiakastunnus"
        : "Y-tunnus";

    writeLine(`${label}: ${customer.customerCode}`, 50, custY);
    custY += 12;
  }

  // =====================================================
  // 🔹 Laskun tiedot
  // =====================================================
  const rightX = 350;
  const infoY = 130;
  let rowY = infoY + 14;
  doc.font("Times-Bold").fontSize(12).text("Laskun tiedot:", rightX, infoY);
  doc.font("Times-Roman").fontSize(10);
  writeInfo("Laskun numero:", invoice.invoiceNumber ?? "—", rightX, rowY);
  rowY += 12;

  writeInfo("Päiväys:", new Date(invoice.date).toLocaleDateString("fi-FI"), rightX, rowY);
  rowY += 12;

  writeInfo("Eräpäivä:", new Date(invoice.dueDate).toLocaleDateString("fi-FI"), rightX, rowY);
  rowY += 12;

  writeInfo("Maksuehto:", `${invoice.paymentTerm} päivää`, rightX, rowY);
  rowY += 12;

  writeInfo("Viivästyskorko:", "7,0 %", rightX, rowY);
  rowY += 12;

  if (invoice.status === "DRAFT") {
    writeInfo("Tila:", invoice.status, rightX, rowY);
    rowY += 12;
  }

  // =====================================================
  // 🔹 Tuoterivit
  // =====================================================
  doc.moveDown(7);
  const productsStartY = 350;
  doc.fontSize(10).fillColor("black");

  doc.text("Kuvaus", 50, productsStartY);
  doc.text("Määrä", 220, productsStartY);
  doc.text("A-hinta €", 280, productsStartY);
  doc.text("ALV-osuus €", 360, productsStartY);
  doc.text("ALV %", 440, productsStartY);
  doc.text("Yhteensä €", 510, productsStartY);
  doc.moveTo(50, productsStartY + 12).lineTo(580, productsStartY + 12).stroke();

  let currentY = productsStartY + 20;
  invoice.lines.forEach((line) => {
    const vatAmount = (line.unitPrice * line.quantity * line.vatRate) / 100;
    const total = line.quantity * line.unitPrice * (1 + line.vatRate / 100);

    doc.text(line.description || "-", 50, currentY);
    doc.text(`${line.quantity}`, 230, currentY);

    // A-hinta (ilman €)
    doc.text(`${formatEuro(line.unitPrice)}`, 290, currentY);

    // ALV-osuus (ilman €)
    doc.text(`${formatEuro(vatAmount)}`, 370, currentY);

    // ALV % (kuten halusit: ilman desimaaleja)
    doc.text(`${formatVatRate(line.vatRate)} %`, 450, currentY);

    // Yhteensä (ilman €)
    doc.text(`${formatEuro(total)}`, 520, currentY);

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
  const labelX = sumRightX - 80;
  const lineYStart = doc.y;

  // Veroton summa
  doc.text("Veroton summa:", labelX, lineYStart);
  doc.text(`${formatEuro(netSum)} €`, sumRightX, lineYStart, { align: "right" });

  // ALV
  const lineY2 = lineYStart + 15;
  doc.text("ALV:", labelX, lineY2);
  doc.text(`${formatEuro(vatSum)} €`, sumRightX, lineY2, { align: "right" });

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
  doc.text(`${formatEuro(totalSum)} €`, sumRightX, lineY3, { align: "right" });
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
let startY = doc.y + 100;
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
 const totalText = `${totalSum.toFixed(2).replace(".", ",")} €`;
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
  const bban = ibanForCode.slice(2);

  // Summa (sentteinä 8 numeroa)
  const amount = Math.round(totalSum * 100).toString().padStart(8, "0");

  // Viite (23 numeroa, nollat vasemmalle)
  const baseRef = (invoice.referenceNumber || invoice.invoiceNumber?.toString() || "0")
    .replace(/\D/g, "") || "0";
  const refPadded = baseRef.padStart(23, "0");

  // Eräpäivä VVKKPP
  const due = new Date(invoice.dueDate);
  const dueDateForCode =
    `${due.getFullYear().toString().slice(2)}` +
    `${(due.getMonth() + 1).toString().padStart(2, "0")}` +
    `${due.getDate().toString().padStart(2, "0")}`;

  // Lopullinen 54-merkkinen koodi
  const virtualCode = `4${bban}${amount}${refPadded}${dueDateForCode}`;

  // ============ KESKITYS ============
  const pageWidth = doc.page.width;


  // ============ TEKSTIT YLÄPUOLELLE ============
  const textY = startY + rowHeight * 2 + 35;

  // Sivun keskikohta
const centerX = pageWidth / 2;

// Tekstiblokin leveys – riittävän iso, että keskitys on tarkka
const blockWidth = 400;

// ======= VIRTUAALIVIIVAKOODIN OTSIKKO (täydellinen keskitys) =======
doc.font("Times-Bold").fontSize(10).fillColor("black");
doc.text("Virtuaaliviivakoodi:", centerX - blockWidth / 2, textY, {
  align: "center",
  width: blockWidth,
});

// ======= VARSINAINEN KOODI (täydellinen keskitys) =======
doc.font("Courier").fontSize(10);
doc.text(virtualCode, centerX - blockWidth / 2, textY + 15, {
  align: "center",
  width: blockWidth,
});



  // ============ GENEROI VIIVAKOODI SVG:NÄ ============

 
  // Luo tyhjä DOM jossa on SVG-elementti
  const dom = new JSDOM(`<svg xmlns='http://www.w3.org/2000/svg'></svg>`);
  const svgElement = dom.window.document.querySelector("svg");

  if (!svgElement) {
    throw new Error("SVG element could not be created.");
  }

  // 👉 Korjataan document-viite JsBarcodea varten
  (globalThis as unknown as { document: Document }).document = dom.window.document;

  // Luo Code128-viivakoodi SVG:hen
  JsBarcode(svgElement, virtualCode, {
    format: "CODE128",
    width: 3,     // AIEMMIN 2 → nyt paksummat viivat
    height: 60,   // vähän korkeampi näkyvyys
    margin: 10,   // pieni marginaali auttaa lukijaa
    displayValue: false,
  });

  // ============ MUUTA SVG PNG:KSI ============

  const barcodePng: Buffer = await new Promise((resolve, reject) => {
    svg2img(
      svgElement.outerHTML,
      { width: 900 },
      (error: unknown, buffer: Buffer) => {
        if (error) {
          console.error("❌ Viivakoodin PNG muunnos epäonnistui:", error);
          reject(error);
        } else {
          resolve(buffer);
        }
      }
    );
  });

  // ============ PIIRRÄ PDF:ÄÄN ============

  const targetWidth = 350;
  const targetHeight = 35;

  const barcodeX = (pageWidth - targetWidth) / 2;
  const barcodeY = textY + 35;

  doc.image(barcodePng, barcodeX, barcodeY, {
    width: targetWidth,
    height: targetHeight,   // 🔥 Pakottaa matalammaksi
  });



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
