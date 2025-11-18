import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as fs from "fs";

// =======================================================
// POST — Luo uusi kirjanpitotapahtuma + käytetyt tuotteet
// =======================================================
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
    const contactIdRaw = formData.get("contactId");
    const contactId = contactIdRaw ? Number(contactIdRaw) : null;
    const receiptFile = formData.get("receipt") as File | null;

    if (!date || !categoryId) {
      return NextResponse.json(
        { error: "Päivämäärä ja kategoria ovat pakollisia." },
        { status: 400 }
      );
    }

    const vatAmount = amount - amount / (1 + vatRate / 100);

    // -----------------------------------------------
    // 🔹 1. Tallenna liitetiedosto levyyn (jos annettu)
    // -----------------------------------------------
    let receiptUrl: string | null = null;

    if (receiptFile && receiptFile.size > 0) {
      const arrayBuffer = await receiptFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const safeName = receiptFile.name.replace(/\s+/g, "_");
      const fileName = `${Date.now()}_${safeName}`;
      const filePath = `./public/receipts/${fileName}`;

      fs.writeFileSync(filePath, buffer);
      receiptUrl = `/receipts/${fileName}`;
    }

    // -----------------------------------------------
    // 🔹 2. Luo itse kirjanpitotapahtuma
    // -----------------------------------------------
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
        contactId: contactId || null,

        receipt: receiptUrl
          ? {
              create: { fileUrl: receiptUrl },
            }
          : undefined,
      },
     include: {
  category: true,
  receipt: true,
  contact: {
    select: { id: true, name: true },
  },

  // ⭐ Lisää tämä
  productUsage: {
    include: {
      product: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
},
    });

    // -----------------------------------------------
    // 🔹 3. Tallennetaan käytetyt tuotteet (ProductUsage)
    // -----------------------------------------------
    const usagesRaw = formData.get("usages")?.toString();

    if (usagesRaw && usagesRaw !== "null" && usagesRaw !== "undefined") {
      const usages = JSON.parse(usagesRaw) as {
        productId: number;
        quantity: number;
      }[];

      for (const u of usages) {
        // Luo käyttömerkintä
        await prisma.productUsage.create({
          data: {
            productId: u.productId,
            quantity: u.quantity,
            entryId: newEntry.id,
          },
        });

        // Vähennä varastoa
        await prisma.product.update({
          where: { id: u.productId },
          data: {
            quantity: { decrement: u.quantity },
          },
        });
      }
    }

    return NextResponse.json(newEntry);
  } catch (error) {
    console.error("POST /events error:", error);
    return NextResponse.json(
      { error: "Failed to create bookkeeping entry" },
      { status: 500 }
    );
  }
}

// =======================================================
// GET — Hae tapahtumat (+ mahdollisuus suodattaa kontaktilla)
// =======================================================
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const contactIdParam = searchParams.get("contactId");
    const contactId = contactIdParam ? Number(contactIdParam) : null;

    const entries = await prisma.bookkeepingEntry.findMany({
      where: contactId ? { contactId } : {},
      orderBy: { date: "desc" },
      include: {
        category: true,
        receipt: true,
        contact: { select: { id: true, name: true } },
        productUsage: true, // 🔥 lisätty mukaan GET:iin
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

// =============================================
// DELETE — Poista tapahtuma (+ liite + varastosaldon palautus)
// =============================================
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const id = Number(body.id);

    if (!id) {
      return NextResponse.json(
        { error: "Invalid entry ID" },
        { status: 400 }
      );
    }

    // 🔹 1. Hae tapahtuma + liite + käytetyt tuotteet
    const existingEntry = await prisma.bookkeepingEntry.findUnique({
      where: { id },
      include: {
        receipt: true,
        productUsage: true, // käytetyt tuotteet
      },
    });

    if (!existingEntry) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    // 🔹 2. Palauta varasto AINA
    for (const usage of existingEntry.productUsage) {
      await prisma.product.update({
        where: { id: usage.productId },
        data: {
          quantity: { increment: usage.quantity },
        },
      });
    }

    // 🔹 3. Poista ProductUsage-rivit
    await prisma.productUsage.deleteMany({
      where: { entryId: id },
    });

    // 🔹 4. Poista liitetiedosto levyltä
    if (existingEntry.receipt?.fileUrl) {
      const filePath = `./public${existingEntry.receipt.fileUrl}`;
      try {
        fs.unlinkSync(filePath);
      } catch (error) {
        console.warn("Tiedoston poistaminen epäonnistui:", error);
      }

      // Poista liite tietokannasta
      await prisma.receipt.delete({
        where: { entryId: id },
      });
    }

    // 🔹 5. Poista itse tapahtuma
    await prisma.bookkeepingEntry.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      stockRestored: true,
    });

  } catch (error) {
    console.error("DELETE event error:", error);
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 }
    );
  }
}
