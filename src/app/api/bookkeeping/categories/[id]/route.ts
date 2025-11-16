import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;   // ⭐⭐⭐ TÄRKEÄ FIX ⭐⭐⭐

  const numericId = Number(id);

  try {
    const category = await prisma.category.findUnique({
      where: { id: numericId },
    });

    if (!category) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error("GET category error:", error);
    return NextResponse.json({ error: "Failed to load category" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const numericId = Number(id);

  const body = await request.json();

  try {
    const updated = await prisma.category.update({
      where: { id: numericId },
      data: {
        name: body.name,
        type: body.type,
        defaultVat: body.defaultVat,
        description: body.description || null,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT category error:", error);
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const numericId = Number(id);

  try {
    await prisma.category.delete({ where: { id: numericId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE category error:", error);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}

