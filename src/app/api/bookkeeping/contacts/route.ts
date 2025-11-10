import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ======================================================
// 🔹 HAE kaikki kontaktit
// ======================================================
export async function GET() {
  try {
    const contacts = await prisma.contact.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        type: true,
        customerCode: true,
        enableBilling: true,
        email: true,
        address: true,
        zip: true,
        city: true,
        notes: true,
        altNames: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(contacts);
  } catch (err) {
    console.error("Virhe kontaktien haussa:", err);
    return NextResponse.json(
      { error: "Virhe kontaktien haussa" },
      { status: 500 }
    );
  }
}

// ======================================================
// 🔹 LISÄÄ uusi kontakti
// ======================================================
export async function POST(req: Request) {
  try {
    const data = await req.json();

    const newContact = await prisma.contact.create({
      data: {
        name: data.name,
        type: data.type,
        customerCode: data.customerCode || null,
        enableBilling: data.enableBilling || false,
        notes: data.notes || null,
        altNames: data.altNames || null,
        email: data.email || null,
        address: data.address || null,
        zip: data.zip || null,
        city: data.city || null,
      },
    });

    return NextResponse.json(newContact);
  } catch (err) {
    console.error("Virhe kontaktin tallennuksessa:", err);
    return NextResponse.json(
      { error: "Virhe kontaktin tallennuksessa" },
      { status: 500 }
    );
  }
}

// ======================================================
// 🔹 POISTA kontakti
// ======================================================
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Puuttuva ID" }, { status: 400 });
    }

    await prisma.contact.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Virhe poistettaessa kontaktia:", error);
    return NextResponse.json(
      { error: "Virhe poistettaessa kontaktia" },
      { status: 500 }
    );
  }
}
