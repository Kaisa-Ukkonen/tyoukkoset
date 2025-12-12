import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

// 🔹 Lue SMTP asetukset .env:stä
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST!,
  port: Number(process.env.SMTP_PORT),
  secure: true,  // koska käytät porttia 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false, // 🔥 korjaa self-signed virheen kehitysympäristössä
  },
});

export async function POST(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const invoiceId = Number(id);

        if (Number.isNaN(invoiceId)) {
            return NextResponse.json(
                { error: "Virheellinen laskun ID." },
                { status: 400 }
            );
        }

        // 🔹 Hae lasku ja asiakas
        const invoice = await prisma.invoice.findUnique({
            where: { id: invoiceId },
            include: {
                customer: true,
            },
        });

        if (!invoice) {
            return NextResponse.json(
                { error: "Laskua ei löytynyt." },
                { status: 404 }
            );
        }

       const allowed = ["DRAFT", "APPROVED", "SENT"];

if (!allowed.includes(invoice.status)) {
    return NextResponse.json(
        { error: "Laskua ei voi lähettää tässä tilassa." },
        { status: 400 }
    );
}

        // 🔹 Sähköpostiosoite (bodyssä voi myös override)
        const body = await req.json().catch(() => ({}));

        const email =
            body.email ||            // popupin kautta syötetty sähköpostiosoite
            invoice.customer?.email ||  // kontaktin sähköpostiosoite
            null;

        if (!email) {
            return NextResponse.json(
                { error: "Asiakkaalla ei ole sähköpostiosoitetta." },
                { status: 400 }
            );
        }

        // 🔹 PDF-polku
        const pdfPath = path.join(
            process.cwd(),
            "public",
            "receipts",
            `lasku_${invoice.invoiceNumber}.pdf`
        );

        if (!fs.existsSync(pdfPath)) {
            return NextResponse.json(
                { error: "PDF-tiedostoa ei löytynyt." },
                { status: 500 }
            );
        }

        // 🔹 Lue PDF buffer
        const pdfBuffer = fs.readFileSync(pdfPath);

        // 🔹 Lähetä sähköposti
        await transporter.sendMail({
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to: email,
            subject: `Lasku #${invoice.invoiceNumber} – Tmi TyöUkkoset`,
            text: `Hei,

Ohessa lasku #${invoice.invoiceNumber}.

Terveisin,
Tmi TyöUkkoset`,
            attachments: [
                {
                    filename: `lasku_${invoice.invoiceNumber}.pdf`,
                    content: pdfBuffer,
                },
            ],
        });

        await prisma.invoice.update({
            where: { id: invoiceId },
            data: {
                sentAt: new Date(),
                status: "SENT",
            },
        });

        return NextResponse.json({
            success: true,
            message: "Lasku lähetetty onnistuneesti!",
        });
    } catch (err) {
        console.error("Error sending invoice email:", err);
        return NextResponse.json(
            { error: "Sähköpostin lähetys epäonnistui." },
            { status: 500 }
        );
    }
}
