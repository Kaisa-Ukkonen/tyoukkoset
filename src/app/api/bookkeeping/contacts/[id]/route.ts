import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 🔹 Päivitä kontakti
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> } // 👈 HUOM! params on Promise
) {
  try {
    const { id } = await context.params; // 👈 puretaan se awaitilla
    const body = await req.json();

    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      return NextResponse.json({ error: "Virheellinen ID" }, { status: 400 });
    }

    const updated = await prisma.contact.update({
      where: { id: parsedId },
      data: {
        name: body.name,
        email: body.email || null,
        address: body.address || null,
        zip: body.zip || null,
        city: body.city || null,
        notes: body.notes || null,
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("Virhe päivitettäessä kontaktia:", err);
    return NextResponse.json(
      { error: "Virhe päivityksessä" },
      { status: 500 }
    );
  }
}
