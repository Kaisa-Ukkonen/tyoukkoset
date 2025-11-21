//Tämä API-reitti toteuttaa Stand Up -keikkojen CRUD-toiminnot hyödyntämällä Next.js Server Routeja ja Prisma ORM:ää: GET palauttaa julkiset keikat MySQL-tietokannasta, 
// POST luo uuden keikan, PUT päivittää olemassa olevan ja DELETE poistaa sen annetun ID:n perusteella.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


// 🔹 Hae kaikki keikat
export async function GET() {
  const gigs = await prisma.standupGig.findMany({
    where: { isPublic: true },
    orderBy: { date: "asc" },
  });
  return NextResponse.json(gigs);
}

// 🔹 Lisää uusi keikka
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, placeDetails, address, date, time } = body; // ✅ lisätty time

    if (!title || !address || !date) {
      return NextResponse.json({ error: "Puuttuvia kenttiä" }, { status: 400 });
    }

    const newGig = await prisma.standupGig.create({
      data: {
        title,
        placeDetails,
        address,
        date: new Date(date),
        time: time || null, // ✅ lisätty time kenttä (vapaaehtoinen)
        isPublic: true,
      },
    });

    return NextResponse.json(newGig);
  } catch (error) {
    console.error("Virhe lisäyksessä:", error);
    return NextResponse.json({ error: "Jokin meni pieleen" }, { status: 500 });
  }
}

// 🔹 Poista keikka
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "ID puuttuu" }, { status: 400 });

  await prisma.standupGig.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

// 🔹 Päivitä keikka
export async function PUT(req: Request) {
  const { id, title, placeDetails, address, date, time } = await req.json(); // ✅ lisätty time
  if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

  const updatedGig = await prisma.standupGig.update({
    where: { id },
    data: {
      title,
      placeDetails,
      address,
      date: new Date(date),
      time: time || null, // ✅ lisätty time kenttä
    },
  });

  return NextResponse.json(updatedGig);
}
