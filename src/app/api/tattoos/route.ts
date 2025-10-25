import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const tattoos = await prisma.tattoo.findMany({
      where: { isPublic: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(tattoos);
  } catch (error) {
    console.error("Virhe tatuointien haussa:", error);
    return NextResponse.json(
      { error: "Virhe tatuointien haussa" },
      { status: 500 }
    );
  }
}
