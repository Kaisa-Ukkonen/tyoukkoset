import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";   // ⭐ OIKEA

// GET /api/bookkeeping/categories
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("GET categories error:", error);
    return NextResponse.json(
      { error: "Failed to load categories" },
      { status: 500 }
    );
  }
}

// POST /api/bookkeeping/categories
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const newCategory = await prisma.category.create({
      data: {
        name: body.name,
        type: body.type,
        defaultVat: body.defaultVat,
        description: body.description || null,
      },
    });

    return NextResponse.json(newCategory);
  } catch (error) {
    console.error("POST category error:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
