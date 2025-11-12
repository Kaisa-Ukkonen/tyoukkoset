import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


// 🔹 GET – kaikki matkat
export async function GET() {
  try {
    const trips = await prisma.trip.findMany({
      orderBy: { date: "desc" },
    });
    return NextResponse.json(trips);
  } catch (err) {
    console.error("GET virhe:", err);
    return NextResponse.json(
      { error: "Virhe haettaessa matkoja" },
      { status: 500 }
    );
  }
}

// 🔹 POST – uusi matka
export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { date, startAddress, endAddress, kilometers, allowance, notes } = data;

    const trip = await prisma.trip.create({
      data: {
        date: new Date(date),
        startAddress,
        endAddress,
        kilometers: Number(kilometers),
        allowance,
        notes,
      },
    });

    return NextResponse.json(trip);
  } catch (err) {
    console.error("POST virhe:", err);
    return NextResponse.json(
      { error: "Virhe lisättäessä matkaa" },
      { status: 500 }
    );
  }
}

// 🔹 PUT – olemassa olevan matkan päivitys
export async function PUT(req: Request) {
  try {
    const data = await req.json();
    const { id, date, startAddress, endAddress, kilometers, allowance, notes } = data;

    if (!id) {
      return NextResponse.json({ error: "Matkan ID puuttuu" }, { status: 400 });
    }

    const updated = await prisma.trip.update({
      where: { id: Number(id) },
      data: {
        date: new Date(date),
        startAddress,
        endAddress,
        kilometers: Number(kilometers),
        allowance,
        notes,
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("PUT virhe:", err);
    return NextResponse.json(
      { error: "Virhe päivitettäessä matkaa" },
      { status: 500 }
    );
  }
}

// 🔹 DELETE – matkan poisto
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Matkan ID puuttuu" }, { status: 400 });
    }

    await prisma.trip.delete({ where: { id: Number(id) } });
    return NextResponse.json({ message: "Matka poistettu onnistuneesti" });
  } catch (err) {
    console.error("DELETE virhe:", err);
    return NextResponse.json(
      { error: "Virhe poistettaessa matkaa" },
      { status: 500 }
    );
  }
}
