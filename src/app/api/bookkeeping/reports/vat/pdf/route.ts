import { prisma } from "@/lib/prisma";
import PDFDocument from "pdfkit";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    if (!from || !to) {
      return new Response("Missing date range", { status: 400 });
    }

    const start = new Date(from);
    const end = new Date(to);

    const entries = await prisma.bookkeepingEntry.findMany({
      where: {
        date: {
          gte: start,
          lte: end,
        },
      },
      orderBy: { date: "asc" },
    });

    // -------------------------------------------------
    // 🔹 ALV-laskenta
    // -------------------------------------------------
    let salesVat = 0;
    let purchasesVat = 0;

    const salesLines = entries
      .filter((e) => e.type.toLowerCase() === "tulo")
      .map((e) => {
        if (e.vatRate > 0) salesVat += e.vatAmount;
        return e;
      });

    const purchaseLines = entries
      .filter((e) => e.type.toLowerCase() === "meno")
      .map((e) => {
        purchasesVat += e.vatAmount;
        return e;
      });

    const payableVat = salesVat - purchasesVat;

    // -------------------------------------------------
    // 🔹 Luo PDF (Times-fontit käytössä)
    // -------------------------------------------------
    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
    });

    //
    // ============= PDF SISÄLTÖ =============
    //

    // 🔹 Otsikko
    doc.font("Times-Bold").fontSize(18).text("ALV-laskelma", { align: "left" });
    doc.moveDown(0.3);

    doc.font("Times-Roman").fontSize(12).text(
      `Aikaväli: ${start.toLocaleDateString("fi-FI")} — ${end.toLocaleDateString("fi-FI")}`
    );
    doc.moveDown();

    doc.font("Times-Roman").fontSize(12).text("Yritys: Jesse Kalevo Ukkonen / Tmi TyöUkkoset");
    doc.moveDown(2);

    // 🔹 Yhteenveto
    doc.font("Times-Bold").fontSize(14).text("ALV-yhteenveto", { underline: true });
    doc.moveDown(0.5);

    doc.font("Times-Roman").fontSize(12).text(
      `Myyntien ALV (25,5 %): ${salesVat.toFixed(2)} €`
    );
    doc.text(`Ostojen ALV (25,5 %): ${purchasesVat.toFixed(2)} €`);
    doc.moveDown(0.5);

    doc.font("Times-Bold").text(`Maksettava ALV: ${payableVat.toFixed(2)} €`);
    doc.font("Times-Roman");
    doc.moveDown(1.5);

   // --------------------------
// 🔹 Taulukon otsikot (tasasarakkeet)
// --------------------------
const renderTableHeader = (title: string) => {
doc.font("Times-Bold").fontSize(13).text(title, 50, doc.y);
  doc.moveDown(0.4);

  const headerY = doc.y;

  doc.font("Times-Bold").fontSize(11);
  doc.text("Pvm", 50, headerY);
  doc.text("Kuvaus", 120, headerY);
  doc.text("Summa €", 300, headerY, { width: 80, align: "right" });
  doc.text("ALV %", 390, headerY, { width: 40, align: "right" });
  doc.text("ALV €", 450, headerY, { width: 80, align: "right" });

  doc.moveDown(0.6);
  doc.font("Times-Roman");
};

// --------------------------
// 🔹 Taulukon rivit
// --------------------------
const renderTableLines = (rows: typeof entries) => {
  if (rows.length === 0) {
    doc.text("Ei tapahtumia", 50, doc.y);
    doc.moveDown();
    return;
  }

  rows.forEach((e) => {
    const rowY = doc.y;

    doc.text(
      new Date(e.date).toLocaleDateString("fi-FI"),
      50,
      rowY
    );

    doc.text(
      e.description ?? "-",
      120,
      rowY,
      { width: 160 }
    );

    doc.text(
      e.amount.toFixed(2),
      300,
      rowY,
      { width: 80, align: "right" }
    );

    doc.text(
      e.vatRate.toString(),
      390,
      rowY,
      { width: 40, align: "right" }
    );

    doc.text(
      e.vatAmount.toFixed(2),
      450,
      rowY,
      { width: 80, align: "right" }
    );

    doc.moveDown(0.5);
  });

  doc.moveDown();
};

    // -------------------------------------------------
    // 🔹 Taulukot
    // -------------------------------------------------
    renderTableHeader("Myynnit (25,5 %)");
    renderTableLines(salesLines.filter((e) => e.vatRate > 0));

    renderTableHeader("Myynnit (0 %)");
    renderTableLines(salesLines.filter((e) => e.vatRate === 0));

    renderTableHeader("Ostot (vähennettävä ALV)");
    renderTableLines(purchaseLines);

    //
    // 🔹 Sulje PDF
    //
    doc.end();

    // -------------------------------------------------
    // 🔹 Buffer → Response (täysin sama kuin lasku-PDF)
    // -------------------------------------------------
    const pdfBuffer = await new Promise<Buffer>((resolve) => {
      const bufs: Buffer[] = [];
      doc.on("data", (chunk: Buffer) => bufs.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(bufs)));
    });

    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="alv-laskelma.pdf"`,
      },
    });
  } catch (err) {
    console.error("PDF VAT error:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
