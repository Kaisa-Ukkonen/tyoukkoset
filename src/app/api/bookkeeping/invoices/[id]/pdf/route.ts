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

    // 🔹 Luo PDF
    const doc = new PDFDocument({ margin: 50 });

    const buffers: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => buffers.push(chunk));
    doc.on("end", () => { });

    // 🔹 Logo
    const logoPath = path.join(process.cwd(), "public/keltainenlogo.png");
    if (fs.existsSync(logoPath)) doc.image(logoPath, 50, 40, { width: 90 });

    // 🔹 Otsikko “LASKU”
    doc.font("Times-Bold").fontSize(20).fillColor("#FFD700").text("LASKU", 400, 50, { align: "right" });

    // =====================================================
    // 🔹 Laskuttajan tiedot (TyöUkkoset)
    // =====================================================
    const leftTop = 130;

    doc.font("Times-Bold").fontSize(12).fillColor("black").text("Laskuttaja:", 50, leftTop);
    doc.font("Times-Roman").fontSize(10).fillColor("black");

    doc.text("Tmi TyöUkkoset", 50, leftTop + 15);
    doc.text("Kassarapolku 4");
    doc.text("71800 Siilinjärvi");
    doc.text("tyoukkoset@gmail.com");
    doc.text("Y-tunnus: 3518481-5");
    doc.moveDown(1.5);

    // =====================================================
    // 🔹 Asiakkaan tiedot (vasen puoli)
    // =====================================================
    const customer = invoice.customer;

    const customerName = invoice.customCustomer || customer?.name || "Asiakas";
    const customerAddress = customer?.address || "";
    const customerZipCity = [customer?.zip, customer?.city].filter(Boolean).join(" ");
    const customerEmail = customer?.email || "";

    // lisää selkeä väli laskuttajan ja asiakkaan väliin
    const leftY = 220;

    doc
        .font("Times-Bold")
        .fontSize(12)
        .fillColor("black")
        .text("Laskutusosoite:", 50, leftY);

    doc.font("Times-Roman").fontSize(10).fillColor("black");

    const y = leftY + 15;
    doc.text(customerName, 50, y);
    if (customerAddress) doc.text(customerAddress, 50);
    if (customerZipCity) doc.text(customerZipCity, 50);
    if (customerEmail) doc.text(`Sähköposti: ${customerEmail}`, 50);
    if (customer?.customerCode) doc.text(`Y-tunnus: ${customer.customerCode}`, 50);

    // =====================================================
    // 🔹 Laskun tiedot (oikea puoli)
    // =====================================================
    const rightX = 350;
    const infoY = 130; // 🟢 sama korkeus kuin Laskuttaja alkaa

    doc.font("Times-Bold").fontSize(12).fillColor("black").text("Laskun tiedot:", rightX, infoY);
    doc.font("Times-Roman").fontSize(10).fillColor("black");

    // Siirrä rivit heti otsikon alle (noin +15px)
    doc.text(`Laskun numero: ${invoice.invoiceNumber}`, rightX, infoY + 15);
    doc.text(`Laskun päiväys: ${new Date(invoice.date).toLocaleDateString("fi-FI")}`);
    doc.text(`Eräpäivä: ${new Date(invoice.dueDate).toLocaleDateString("fi-FI")}`);
    doc.text(`Maksuehto: ${invoice.paymentTerm} päivää`);
    doc.text("Viivästyskorko: 7,0 %");
    doc.text("Maksuviite: XXXXXXXX");

    // =====================================================
    // 🔹 Tuoterivit
    // =====================================================
    doc.moveDown(7); // 🔸 lisää tyhjää väliä ennen taulukkoa
    const productsStartY = 350; // säädä tarvittaessa
doc.fontSize(10).fillColor("black");

// Otsikkorivi
doc.text("Kuvaus", 50, productsStartY);
doc.text("Määrä", 250, productsStartY);
doc.text("A-hinta (€)", 320, productsStartY);
doc.text("ALV %", 400, productsStartY);
doc.text("Yhteensä (€)", 470, productsStartY);

// Alaviiva otsikoiden alle
doc.moveTo(50, productsStartY + 12).lineTo(550, productsStartY + 12).stroke();

// Siirretään kursori rivien piirtämistä varten
let currentY = productsStartY + 20;

// 🔹 Tuoterivit
invoice.lines.forEach((line) => {
  const total = line.quantity * line.unitPrice;
  doc.text(line.description || "-", 50, currentY);
  doc.text(`${line.quantity}`, 260, currentY);
  doc.text(line.unitPrice.toFixed(2), 330, currentY);
doc.text(`${line.vatRate.toFixed(1)} %`, 410, currentY);
  doc.text(total.toFixed(2), 480, currentY);
  currentY += 15; // väli rivien välillä
});

doc.moveDown(1.5);

    // =====================================================
    // 🔹 Summat (oikea reuna)
    // =====================================================
    doc.moveDown(1);
    doc.fontSize(10).fillColor("black");
    doc.text(`Veroton summa: ${invoice.netAmount.toFixed(2)} €`, 400);
    doc.text(`ALV: ${invoice.vatAmount.toFixed(2)} €`, 400);
    doc.text(`Yhteensä: ${invoice.totalAmount.toFixed(2)} €`, 400);
    doc.moveDown(1);

    // =====================================================
    // 🔹 LUONNOS-vesileima
    // =====================================================
    doc.fontSize(60).fillColor("red").opacity(0.3);
    doc.text("LUONNOS", 150, 400, { angle: 45 });

    doc.end();

    // 🔹 Palauta PDF vastauksena
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
