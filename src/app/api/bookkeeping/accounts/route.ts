import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 🔹 HAE KAIKKI TILIT
export async function GET() {
  try {
    const accounts = await prisma.account.findMany({
      orderBy: { number: "asc" },
    });

    return NextResponse.json(accounts);
  } catch (error) {
    console.error("GET /bookkeeping/accounts error:", error);
    return NextResponse.json(
      { error: "Virhe tilien haussa" },
      { status: 500 }
    );
  }
}

// 🔹 LISÄÄ UUSI TILI
export async function POST(req: Request) {
  try {
    const data = await req.json();

    const account = await prisma.account.create({
      data: {
        number: data.number,
        name: data.name,
        type: data.type,
        instruction: data.instruction,
        vatHandling: data.vatHandling,
        vatRate: data.vatRate,
        openingBalance: data.openingBalance,
      },
    });

    return NextResponse.json(account, { status: 201 });
  } catch (error: unknown) {
    console.error("POST /bookkeeping/accounts error:", error);

    // Prisma "uniikki" virhe (P2002)
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Tilin nimi on jo käytössä." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Virhe tilin luonnissa" },
      { status: 500 }
    );
  }
}
