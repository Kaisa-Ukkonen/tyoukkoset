import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  const { name, email, phone, service, message } = await req.json();

  // Luo sähköpostiviesti
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "tyoukkoset@gmail.com",
      pass: process.env.GMAIL_APP_PASSWORD, // luo tähän oma Gmail App Password
    },
    tls: {
      rejectUnauthorized: false, // 🔹 Tämä sallii yhteyden kehityksessä
    },
  });

  const mailOptions = {
    from: email,
    to: "tyoukkoset@gmail.com",
    subject: `Uusi yhteydenottopyyntö: ${service}`,
    text: `
Nimi: ${name}
Sähköposti: ${email}
Puhelin: ${phone}
Palvelu: ${service}

Viesti:
${message}
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Sähköpostin lähetys epäonnistui:", error);
    return NextResponse.json({ error: "Email failed" }, { status: 500 });
  }
}
