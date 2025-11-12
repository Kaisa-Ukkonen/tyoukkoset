import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


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

        email: true,
        address: true,
        zip: true,
        city: true,
        notes: true,
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
// 🔹 LISÄÄ uusi kontakti (automaattinen asiakastunnus yksityishenkilölle)
// ======================================================
export async function POST(req: Request) {
  try {
    const data = await req.json();

    console.log("Uuden kontaktin tiedot:", data); // 🔍 debug-tulostus

    let finalCustomerCode = data.customerCode || null;

    // ✅ Luo automaattinen asiakastunnus yksityishenkilölle
    if (data.type?.toLowerCase().includes("yksity")) {
      const last = await prisma.contact.findFirst({
        where: { type: { contains: "Yksityishenkilö" } },
        orderBy: { id: "desc" },
        select: { customerCode: true },
      });

      const lastNumber = last?.customerCode
        ? parseInt(last.customerCode.split("-")[1] || "0", 10)
        : 0;

      const nextNumber = lastNumber + 1;
      finalCustomerCode = `CUST-${String(nextNumber).padStart(5, "0")}`;
    }

    const newContact = await prisma.contact.create({
      data: {
        name: data.name,
        type: data.type,
        customerCode: finalCustomerCode,
        notes: data.notes || null,
        email: data.email || null,
        address: data.address || null,
        zip: data.zip || null,
        city: data.city || null,
      },
    });

    console.log("Tallennettu kontakti:", newContact);

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
