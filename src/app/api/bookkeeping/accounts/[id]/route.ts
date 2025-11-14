import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 🔹 PÄIVITÄ TILI
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const data = await req.json();

    const updated = await prisma.account.update({
      where: { id },
      data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /bookkeeping/accounts/[id] error:", error);
    return NextResponse.json(
      { error: "Virhe tilin päivityksessä" },
      { status: 500 }
    );
  }
}

// 🔹 POISTA TILI
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    await prisma.account.delete({ where: { id } });

    return NextResponse.json({ message: "Tili poistettu" });
  } catch (error) {
    console.error("DELETE /bookkeeping/accounts/[id] error:", error);
    return NextResponse.json(
      { error: "Virhe tilin poistossa" },
      { status: 500 }
    );
  }
}
