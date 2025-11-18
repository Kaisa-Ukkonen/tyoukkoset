import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // Päivitä entry
    const updated = await prisma.bookkeepingEntry.update({
      where: { id: data.id },
      data: {
        date: new Date(data.date),
        description: data.description,
        amount: parseFloat(data.amount),
        vatRate: parseFloat(data.vatRate),
        paymentMethod: data.paymentMethod,
        categoryId: data.categoryId,
        contactId: data.contactId || null,
      },
    });

    // Poista vanhat usages
    await prisma.productUsage.deleteMany({
      where: { entryId: data.id },
    });

    // Lisää uudet
    if (Array.isArray(data.usages)) {
      for (const u of data.usages) {
        await prisma.productUsage.create({
          data: {
            entryId: data.id,
            productId: u.productId,
            quantity: u.quantity,
          },
        });
      }
    }

    return NextResponse.json(updated);

  } catch (err) {
    console.error("EVENT UPDATE ERROR:", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
