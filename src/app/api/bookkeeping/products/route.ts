import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ✔ Sallitut ALV-käsittelyt
const validVatHandling = [
  "Kotimaan verollinen myynti",
  "Veroton",
  "Nollaverokannan myynti",
];

// 🔹 HAE tuotteet (arkistoidut tai ei-arkistoidut URL-parametrin mukaan)
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const archivedParam = url.searchParams.get("archived");

    const showArchived = archivedParam === "1";

    const products = await prisma.product.findMany({
      where: { archived: showArchived },
      
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

    if (!validVatHandling.includes(data.vatHandling)) {
      data.vatHandling = "Kotimaan verollinen myynti";
    }

    if (data.vatHandling !== "Kotimaan verollinen myynti") {
      data.vatRate = 0;
    }

    const newProduct = await prisma.product.create({
      data: {
        ...data,
        archived: false, // ⭐ Varmistetaan että uusi tuote ei ole arkistoitu
      },
    });

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

    if (!validVatHandling.includes(updateData.vatHandling)) {
      updateData.vatHandling = "Kotimaan verollinen myynti";
    }

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

// 🔹 ARKISTOI tuote (EI poista!)
export async function PATCH(req: Request) {
  try {
    const { id } = await req.json();

    await prisma.product.update({
      where: { id },
      data: { archived: true }, // ⭐ Tuote arkistoidaan
    });

    return NextResponse.json({ message: "Tuote arkistoitu" });
  } catch (error) {
    console.error("❌ Virhe arkistoinnissa:", error);
    return NextResponse.json(
      { error: "Virhe arkistoinnissa" },
      { status: 500 }
    );
  }
}

// ❌ POISTO ON ESTETTY – ilmoita käyttäjälle miksi
export async function DELETE() {
  return NextResponse.json(
    {
      error:
        "Tuotetta ei voi poistaa, koska se voi liittyä laskuihin tai kirjanpidon tapahtumiin. Käytä 'Arkistoi' toimintoa.",
    },
    { status: 400 }
  );
}
