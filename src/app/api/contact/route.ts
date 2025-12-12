import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  const { name, email, phone, service, message } = await req.json();

  // 🔧 Luo Tietoketun SMTP-asetuksilla sähköpostiyhteys
  const transporter = nodemailer.createTransport({
    host: "mail.tyoukkoset.fi",
    port: 465,
    secure: true, // SSL
    auth: {
      user: "jesse@tyoukkoset.fi",
      pass: process.env.SMTP_PASS, // laitetaan .env -tiedostoon
    },
  });

  const mailOptions = {
    from: `"Yhteydenottolomake" <jesse@tyoukkoset.fi>`,
    to: "jesse@tyoukkoset.fi",
    subject: `Uusi yhteydenottopyyntö: ${service}`,
    text: `
Nimi: ${name}
Sähköposti: ${email}
Puhelin: ${phone}
Palvelu: ${service}

ViestI:
${message}
    `,
    replyTo: email, // Vastaukset menevät asiakkaalle
  };

  try {
    await transporter.sendMail(mailOptions);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Sähköpostin lähetys epäonnistui:", error);
    return NextResponse.json({ error: "Email failed" }, { status: 500 });
  }
}
