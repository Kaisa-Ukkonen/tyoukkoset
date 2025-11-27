import { NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import { prisma } from "@/lib/prisma";

type TripDB = {
  id: number;
  date: Date;
  startAddress: string;
  endAddress: string;
  kilometers: number | string;
  allowance: string; // "full" | "half" | "none"
  notes: string | null;
  createdAt: Date;
};

// 🔥 Muuntaa päivärahat koodista euroiksi
function calculateAllowance(code: string): number {
  switch (code) {
    case "full":
      return 53.0;
    case "half":
      return 24.0;
    case "none":
    default:
      return 0.0;
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    if (!start || !end) {
      return NextResponse.json({ error: "Missing dates" }, { status: 400 });
    }

    const trips: TripDB[] = await prisma.trip.findMany({
      where: {
        date: {
          gte: new Date(start),
          lte: new Date(end),
        },
      },
      orderBy: { date: "asc" },
    });

    // 🔥 Muodostetaan euro-pohjaiset arvot PDF:lle
    const parsedTrips = trips.map((t) => ({
      ...t,
      kilometers: Number(t.kilometers ?? 0),
      allowance: calculateAllowance(t.allowance), // muutetaan koodi -> eurot
    }));

    // 🔥 Lasketaan yhteenveto
    const totalKm = parsedTrips.reduce((a, t) => a + t.kilometers, 0);
    const totalAllowance = parsedTrips.reduce((a, t) => a + t.allowance, 0);

    // 🔥 Luodaan PDF
    const doc = new PDFDocument({ size: "A4", margin: 40 });
    const chunks: Buffer[] = [];

    doc.on("data", (c: Buffer) => chunks.push(c));
    doc.on("end", () => {});

    // ----- PDF SISÄLTÖ -----

    doc.fontSize(20).text("Matkaraportti", { align: "center" });
    doc.moveDown();

    doc.font("Times-Roman").fontSize(12).text("Yritys: Jesse Kalevo Ukkonen / Tmi TyöUkkoset");
    doc.text("Y-tunnus: 3518481-5");
    doc.moveDown();

    doc
      .fontSize(12)
      .text(
        `Ajanjakso: ${new Date(start).toLocaleDateString("fi-FI")} – ${new Date(
          end
        ).toLocaleDateString("fi-FI")}`
      );
    doc.moveDown();

    

   doc.font("Times-Bold").fontSize(14).text("Yhteenveto");
doc.font("Times-Roman");
    doc.fontSize(12).text(`Kilometrit yhteensä: ${totalKm} km`);
    doc.text(`Päivärahat yhteensä: ${totalAllowance.toFixed(2)} €`);
    doc.moveDown();

   doc.font("Times-Bold").fontSize(14).text("Matkat");
doc.font("Times-Roman");
    doc.moveDown(0.5);

    parsedTrips.forEach((t) => {
  const dateStr = new Date(t.date).toLocaleDateString("fi-FI");
  const routeStr = `${t.startAddress} - ${t.endAddress}`;

  // Päivämäärä
  doc.fontSize(12).text(dateStr);

  // Reitti omalle riville
  doc.text(routeStr);

  // Selite
  doc.text(`Selite: ${t.notes || "-"}`);

  // Km
  doc.text(`Km: ${t.kilometers} km`);

  // Päiväraha
  doc.text(`Päiväraha: ${t.allowance.toFixed(2)} €`);

  doc.moveDown();
});

    doc.end();

    const pdfBuffer = await new Promise<Buffer>((resolve) => {
      doc.on("end", () => resolve(Buffer.concat(chunks)));
    });

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline; filename=matkaraportti.pdf",
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "PDF generation failed" },
      { status: 500 }
    );
  }
}
