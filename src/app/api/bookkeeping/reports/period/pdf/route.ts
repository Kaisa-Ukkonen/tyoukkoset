import { NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const start = searchParams.get("start");
        const end = searchParams.get("end");

        if (!start || !end) {
            return NextResponse.json({ error: "Missing dates" }, { status: 400 });
        }

        const startDate = new Date(start);
        const endDate = new Date(end);
        endDate.setHours(23, 59, 59, 999);

        function drawVatRow(
            doc: InstanceType<typeof PDFDocument>,
            row: {
                rate: string;
                net: number;
                vat: number;
                total: number;
            }
        ) {
            const startX = 40;
            const y = doc.y;

            const widths = {
                col1: 60,
                col2: 150,
                col3: 120,
                col4: 150,
            };

            doc.fontSize(12);

            doc.text(`${row.rate} %`, startX, y, { width: widths.col1 });
            doc.text(`Veroton: ${row.net.toFixed(2)} €`, startX + widths.col1, y, {
                width: widths.col2,
            });
            doc.text(`ALV: ${row.vat.toFixed(2)} €`,
                startX + widths.col1 + widths.col2,
                y,
                { width: widths.col3 }
            );
            doc.text(`Yhteensä: ${row.total.toFixed(2)} €`,
                startX + widths.col1 + widths.col2 + widths.col3,
                y,
                { width: widths.col4 }
            );

            doc.moveDown();
        }
        // 🔹 Haetaan tapahtumat
        const entries = await prisma.bookkeepingEntry.findMany({
            where: {
                date: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            include: { contact: true, category: true },
            orderBy: { date: "asc" },
        });

        // 🔹 Tulot / menot
        let income = 0;
        let expenses = 0;

        for (const e of entries) {
            if (e.type.toLowerCase() === "tulo") income += e.amount;
            else expenses += e.amount;
        }

        const profit = income - expenses;

        // 🔹 ALV-kategoriat
        const VAT_KEYS = ["0", "10", "14", "25.5"] as const;
        const emptyVatRow = { net: 0, vat: 0, total: 0 };

        const salesVat = Object.fromEntries(
            VAT_KEYS.map((k) => [k, { ...emptyVatRow }])
        ) as Record<(typeof VAT_KEYS)[number], typeof emptyVatRow>;

        const purchaseVat = Object.fromEntries(
            VAT_KEYS.map((k) => [k, { ...emptyVatRow }])
        ) as Record<(typeof VAT_KEYS)[number], typeof emptyVatRow>;

        // 🔹 Lasketaan ALV
        for (const e of entries) {
            const rate = String(e.vatRate) as (typeof VAT_KEYS)[number];
            const vat = (e.amount * e.vatRate) / (100 + e.vatRate);
            const net = e.amount - vat;

            if (e.type.toLowerCase() === "tulo") {
                salesVat[rate].net += net;
                salesVat[rate].vat += vat;
                salesVat[rate].total += e.amount;
            } else {
                purchaseVat[rate].net += net;
                purchaseVat[rate].vat += vat;
                purchaseVat[rate].total += e.amount;
            }
        }

        let payableVat = 0;
        for (const rate of VAT_KEYS) {
            payableVat += salesVat[rate].vat - purchaseVat[rate].vat;
        }

        // 🔥 Aloitetaan PDF
        const doc = new PDFDocument({ size: "A4", margin: 40 });
        const chunks: Buffer[] = [];

        doc.on("data", (c: Buffer) => chunks.push(c));
        doc.on("end", () => { });

        // ----- PDF SISÄLTÖ -----

        doc.fontSize(20).text("Tapahtumaraportti", { align: "center" });
        doc.moveDown();

        doc.font("Times-Roman").fontSize(12).text("Yritys: Jesse Kalevo Ukkonen / Tmi TyöUkkoset");
doc.text("Y-tunnus: 1234567-8");
doc.moveDown(1);

        doc.fontSize(12).text(
            `Ajanjakso: ${startDate.toLocaleDateString(
                "fi-FI"
            )} – ${endDate.toLocaleDateString("fi-FI")}`
        );
        doc.moveDown();

        // --- Yhteenveto ---
        doc.fontSize(14).text("Yhteenveto");
        doc.fontSize(12).text(`Tulot yhteensä: ${income.toFixed(2)} €`);
        doc.text(`Menot yhteensä: ${expenses.toFixed(2)} €`);
        doc.text(`Voitto / tappio: ${profit.toFixed(2)} €`);
        doc.moveDown();

        // --- Myynnin ALV ---
        doc.moveDown();
        doc.text("Myynnin ALV (tulot)", { align: "left" });
        doc.moveDown(0.5);
        doc.x = 40; // PALAUTA VASEN MARGINAALI

        VAT_KEYS.forEach((rate) => {
            const row = salesVat[rate];
            drawVatRow(doc, {
                rate,
                net: row.net,
                vat: row.vat,
                total: row.total
            });
        });


        // --- Ostojen ALV ---
        doc.moveDown(0.3);

        // 🔥 PALAUTA AINA VASEMMALLE ennen uutta taulukkoa
        doc.x = doc.page.margins.left;

        doc.text("Ostojen ALV (menot)", { align: "left" });
        doc.moveDown(0.5);

        VAT_KEYS.forEach((rate) => {
            const row = purchaseVat[rate];
            drawVatRow(doc, {
                rate,
                net: row.net,
                vat: row.vat,
                total: row.total,
            });
        });
        doc.moveDown();
        doc.x = doc.page.margins.left;
        // --- Maksettava ALV ---
        doc.fontSize(14).text("Maksettava ALV");
        doc.fontSize(12).text(`${payableVat.toFixed(2)} €`);
        doc.moveDown();

        // --- Tapahtumat ---
        doc.fontSize(14).text("Tapahtumat");
        doc.moveDown(0.5);

        entries.forEach((e) => {
            doc.fontSize(12).text(
                `${new Date(e.date).toLocaleDateString("fi-FI")} — ${e.contact?.name ?? ""
                }`
            );

            doc.text(`Kategoria: ${e.category?.name ?? "-"}`);
            doc.text(`Tyyppi: ${e.type}`);
            doc.text(`Summa: ${e.amount.toFixed(2)} €`);
            doc.text(`ALV: ${e.vatRate} %`);
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
                "Content-Disposition": "inline; filename=tapahtumaraportti.pdf",
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
