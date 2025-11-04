import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const accounts = await prisma.account.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(accounts);
  } catch (error) {
    console.error("Virhe tilien haussa:", error);
    return NextResponse.json({ error: "Virhe tilien haussa" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
