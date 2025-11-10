import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 🔹 HAE kaikki kontaktit
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
        email: true,     // ✅ lisätty
        address: true,   // ✅ lisätty
        zip: true,       // ✅ lisätty
        city: true,      // ✅ lisätty
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

// 🔹 LISÄÄ uusi kontakti
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
        email: data.email || null,     // ✅ lisätty
        address: data.address || null, // ✅ lisätty
        zip: data.zip || null,         // ✅ lisätty
        city: data.city || null,       // ✅ lisätty
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
