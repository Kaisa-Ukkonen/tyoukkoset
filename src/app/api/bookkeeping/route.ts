import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import * as fs from "fs";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    // 🔹 Puretaan kentät lomakkeesta
    const date = formData.get("date")?.toString();
    const description = formData.get("description")?.toString();
    const type = formData.get("type")?.toString();
    const accountName = formData.get("account")?.toString();
    const amount = parseFloat(formData.get("amount")?.toString() || "0");
    const vatRate = parseFloat(formData.get("vatRate")?.toString() || "0");
    const paymentMethod = formData.get("paymentMethod")?.toString();
    const receiptFile = formData.get("receipt") as File | null;

    if (!date || !accountName || !type) {
      return NextResponse.json(
        { error: "Puuttuvia tietoja (päivämäärä, tili tai tyyppi)" },
        { status: 400 }
      );
    }

    // 🔹 Lasketaan ALV euroina
    const vatAmount = amount - amount / (1 + vatRate / 100);

    // 🔹 Haetaan oikea Account ID nimen perusteella
    const account = await prisma.account.findUnique({
      where: { name: accountName },
    });

    if (!account) {
      return NextResponse.json(
        { error: `Tiliä '${accountName}' ei löytynyt` },
        { status: 404 }
      );
    }

    // 🔹 Jos mukana tiedosto (tosite), tallennetaan se public/receipts/
    let receiptUrl: string | null = null;

    if (receiptFile && receiptFile.size > 0) {
      const arrayBuffer = await receiptFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const fileName = `${Date.now()}_${receiptFile.name.replace(/\s+/g, "_")}`;
      const path = `./public/receipts/${fileName}`;
      fs.writeFileSync(path, buffer);
      receiptUrl = `/receipts/${fileName}`;
    }

    // 🔹 Tallennetaan kirjanpitotapahtuma ja sisällytetään heti account
    const newEntry = await prisma.bookkeepingEntry.create({
      data: {
        date: new Date(date),
        description,
        type,
        amount,
        vatRate,
        vatAmount,
        paymentMethod,
        accountId: account.id,
        receiptNumber: undefined,
        receipt: receiptUrl
          ? {
              create: { fileUrl: receiptUrl },
            }
          : undefined,
      },
      include: {
        account: true, // ✅ tuo account.name heti mukaan
        receipt: true,
      },
    });

    // ✅ Palautetaan suoraan newEntry ilman "message"-kenttää
    return NextResponse.json(newEntry, { status: 201 });
  } catch (error) {
    console.error("Virhe tallennuksessa:", error);
    return NextResponse.json(
      { error: "Tallennus epäonnistui", details: (error as Error).message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET() {
  try {
    const entries = await prisma.bookkeepingEntry.findMany({
      include: { account: true },
      orderBy: { date: "desc" },
    });
    return NextResponse.json(entries);
  } catch (error) {
    console.error("Virhe haettaessa kirjanpitotapahtumia:", error);
    return NextResponse.json({ error: "Virhe haussa" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
