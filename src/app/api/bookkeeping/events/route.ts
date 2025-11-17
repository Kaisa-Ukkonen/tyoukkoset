import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as fs from "fs";


export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const date = formData.get("date")?.toString();
    const description = formData.get("description")?.toString() || "";
    const type = formData.get("type")?.toString() || "";
    const amount = parseFloat(formData.get("amount")?.toString() || "0");
    const vatRate = parseFloat(formData.get("vatRate")?.toString() || "0");
    const paymentMethod = formData.get("paymentMethod")?.toString() || "";
    const categoryId = Number(formData.get("categoryId"));
    const receiptFile = formData.get("receipt") as File | null;

    if (!date || !categoryId) {
      return NextResponse.json(
        { error: "Päivämäärä ja kategoria ovat pakollisia" },
        { status: 400 }
      );
    }

    // ALV euroina
    const vatAmount = amount - amount / (1 + vatRate / 100);

    // 🔥 1. Tallenna tiedosto
    let receiptUrl: string | null = null;

    if (receiptFile && receiptFile.size > 0) {
      const arrayBuffer = await receiptFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const fileName = `${Date.now()}_${receiptFile.name.replace(/\s+/g, "_")}`;
      const filePath = `./public/receipts/${fileName}`;

      await import("fs").then(fs => {
        fs.writeFileSync(filePath, buffer);
      });

      receiptUrl = `/receipts/${fileName}`;
    }

    // 🔥 2. Tallenna kirjanpitotapahtuma + liite
    const newEntry = await prisma.bookkeepingEntry.create({
      data: {
        date: new Date(date),
        description,
        type,
        amount,
        vatRate,
        vatAmount,
        paymentMethod,
        categoryId,
        receipt: receiptUrl
          ? {
              create: {
                fileUrl: receiptUrl,
              },
            }
          : undefined,
      },
      include: {
        category: true,
        receipt: true,
      },
    });

    return NextResponse.json(newEntry);
  } catch (error) {
    console.error("POST /events error:", error);
    return NextResponse.json(
      { error: "Failed to create bookkeeping entry" },
      { status: 500 }
    );
  }
}

// GET — listaa kaikki kirjaukset
export async function GET() {
  try {
const entries = await prisma.bookkeepingEntry.findMany({
  orderBy: { date: "desc" },
  include: {
    category: true,
    receipt: true,   // ⭐ OLTAVA TÄSSÄ
  },
});

    return NextResponse.json(entries);
  } catch (error) {
    console.error("GET /events error:", error);
    return NextResponse.json(
      { error: "Failed to load bookkeeping events" },
      { status: 500 }
    );
  }
}

// DELETE — poista kirjaus


export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const id = Number(body.id);

    if (!id) {
      return NextResponse.json(
        { error: "No event ID provided" },
        { status: 400 }
      );
    }

    // 1️⃣ Hae entry + mahdollinen tosite
    const existingEntry = await prisma.bookkeepingEntry.findUnique({
      where: { id },
      include: { receipt: true },
    });

    if (!existingEntry) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    // 2️⃣ Poista tiedosto levyltä (jos löytyy)
    if (existingEntry.receipt?.fileUrl) {
      const filePath = `./public${existingEntry.receipt.fileUrl}`;
      try {
        fs.unlinkSync(filePath);
      } catch (error) {
        console.warn("Tiedoston poistaminen epäonnistui:", error);
      }
    }

    // 3️⃣ Poista receipt-tietokantarivi
    if (existingEntry.receipt) {
      await prisma.receipt.delete({
        where: { entryId: id },  // ⭐ OIKEA kenttä
      });
    }

    // 4️⃣ Poista itse entry
    await prisma.bookkeepingEntry.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE event error:", error);
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 }
    );
  }
}



