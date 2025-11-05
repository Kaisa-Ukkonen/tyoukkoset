import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 🔹 HAE kaikki tuotteet
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: "Virhe tuotteiden haussa" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// 🔹 LISÄÄ uusi tuote
export async function POST(req: Request) {
  try {
    const data = await req.json();
    const newProduct = await prisma.product.create({ data });
    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Virhe tuotteen tallennuksessa" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// 🔹 PÄIVITÄ olemassa oleva
export async function PUT(req: Request) {
  try {
    const data = await req.json();
    const { id, ...updateData } = data;
    const updated = await prisma.product.update({
      where: { id },
      data: updateData,
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Virhe tuotteen päivityksessä" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// 🔹 POISTA tuote
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ message: "Tuote poistettu" });
  } catch (error) {
    return NextResponse.json({ error: "Virhe poistossa" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
