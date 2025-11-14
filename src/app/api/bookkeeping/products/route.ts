import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ✔ Sallitut ALV-käsittelyt
const validVatHandling = [
  "Kotimaan verollinen myynti",
  "Veroton",
  "Nollaverokannan myynti",
];

// 🔹 HAE kaikki tuotteet
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error("❌ Virhe tuotteiden haussa:", error);
    return NextResponse.json(
      { error: "Virhe tuotteiden haussa" },
      { status: 500 }
    );
  }
}

// 🔹 LISÄÄ uusi tuote
export async function POST(req: Request) {
  try {
    const data = await req.json();

    // 🛡 VARMISTUS: ALV-käsittely on oikeassa muodossa
    if (!validVatHandling.includes(data.vatHandling)) {
      data.vatHandling = "Kotimaan verollinen myynti";
    }

    // 🛡 Jos ei verollinen → ALV 0 %
    if (data.vatHandling !== "Kotimaan verollinen myynti") {
      data.vatRate = 0;
    }

    const newProduct = await prisma.product.create({ data });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error("❌ Virhe tuotteen tallennuksessa:", error);
    return NextResponse.json(
      { error: "Virhe tuotteen tallennuksessa" },
      { status: 500 }
    );
  }
}

// 🔹 PÄIVITÄ olemassa oleva tuote
export async function PUT(req: Request) {
  try {
    const data = await req.json();
    const { id, ...updateData } = data;

    // 🛡 Sama varmistus päivityksessä
    if (!validVatHandling.includes(updateData.vatHandling)) {
      updateData.vatHandling = "Kotimaan verollinen myynti";
    }

    // 🛡 Päivitä ALV arvo
    if (updateData.vatHandling !== "Kotimaan verollinen myynti") {
      updateData.vatRate = 0;
    }

    const updated = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("❌ Virhe tuotteen päivityksessä:", error);
    return NextResponse.json(
      { error: "Virhe tuotteen päivityksessä" },
      { status: 500 }
    );
  }
}

// 🔹 POISTA tuote
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ message: "Tuote poistettu" });
  } catch (error) {
    console.error("❌ Virhe tuotteen poistossa:", error);
    return NextResponse.json(
      { error: "Virhe tuotteen poistossa" },
      { status: 500 }
    );
  }
}
