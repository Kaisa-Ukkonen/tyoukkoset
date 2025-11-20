import { NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // 🔹 Hae tuotteet
    const products = await prisma.product.findMany({
      where: { category: "Tuote", archived: false },
    });

    // 🔹 Muodosta rivit
    const rows = products.map((p) => {
      const qty = p.quantity ?? 0;
      const vat = Number(p.vatRate);
      const gross = Number(p.price);
      const net = gross / (1 + vat / 100);
      const vatPart = gross - net;

      return {
        name: p.name,
        qty,
        gross,
        vat,
        net,
        vatPart,
        grossValue: qty * gross,
      };
    });

    const totalGross = rows.reduce((s, r) => s + r.grossValue, 0);
    const totalNet = rows.reduce((s, r) => s + r.net, 0);

    // 🔥 PDF kuten period-reportissa
    const doc = new PDFDocument({ size: "A4", margin: 40 });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => {});

    //
    // 🔸 OTSIKKO
    //
    doc.fontSize(20).text("Varastosaldoraportti");
    doc.moveDown();

    //
    // 🔸 YHTEENVETO
    //
    doc.fontSize(12).text(`Varaston kokonaisarvo (brutto, ALV sis.):`);
    doc.fontSize(14).text(`${totalGross.toFixed(2)} €`);
    doc.moveDown();

    doc.fontSize(12).text(`Varaston arvo (veroton):`);
    doc.fontSize(14).text(`${totalNet.toFixed(2)} €`);
    doc.moveDown(1.5);

   //
// TAULUKON OTSIKOT – täysin vakioidulla rivikorkeudella
//
doc.moveDown(1);                 // pieni väli yhteenvetoon
const startY = doc.y;            // muista alku-y

doc.fontSize(12).fillColor("#000000");

doc.text("Tuote", 50, startY);
doc.text("Saldo", 150, startY);
doc.text("Hinta (ALV)", 220, startY);
doc.text("ALV %", 320, startY);
doc.text("Netto", 380, startY);
doc.text("ALV €", 450, startY);
doc.text("Arvo", 520, startY);

doc.moveTo(50, startY + 18)
   .lineTo(560, startY + 18)
   .strokeColor("#000")
   .stroke();

    //
    // 🔸 RIVIT
    //
   rows.forEach((r) => {
  const y = doc.y + 5;

  doc.fillColor("#000000").fontSize(11);
  doc.text(r.name, 50, y);
  doc.text(String(r.qty), 150, y);
  doc.text(r.gross.toFixed(2) + " €", 220, y);
  doc.text(r.vat + " %", 320, y);
  doc.text(r.net.toFixed(3) + " €", 380, y);
  doc.text(r.vatPart.toFixed(3) + " €", 450, y);
  doc.text(r.grossValue.toFixed(2) + " €", 520, y);

  doc.moveDown(1);

  // rivien väli
  doc.moveTo(50, doc.y).lineTo(560, doc.y).strokeColor("#aaa").stroke();
});

    doc.end();

    const pdfBuffer = await new Promise<Buffer>((resolve) => {
      doc.on("end", () => resolve(Buffer.concat(chunks)));
    });

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="varastosaldo.pdf"`,
      },
    });
  } catch (err) {
    console.error("PDF ERROR:", err);
    return NextResponse.json({ error: "PDF generointi epäonnistui" });
  }
}
