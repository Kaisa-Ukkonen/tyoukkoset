import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


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
