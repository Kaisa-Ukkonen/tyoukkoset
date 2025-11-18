import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const start = searchParams.get("start");
    const end = searchParams.get("end");

    if (!start || !end) {
      return NextResponse.json({ error: "start ja end puuttuvat" });
    }

    const startDate = new Date(start);
    const endDate = new Date(end);
    endDate.setHours(23, 59, 59, 999);

    // 🔹 Päivärahojen arvot
    const ALLOWANCE_VALUES: Record<string, number> = {
      full: 53,
      half: 24,
      none: 0,
    };

    // 🔹 Haetaan matkat
    const trips = await prisma.trip.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: "asc" },
    });

    // 🔹 Yhteenveto muuttujat
    let totalKm = 0;
    let totalAllowance = 0;

    // 🔹 Muotoillaan rivit
    const resultTrips = trips.map((t) => {
  const allowanceValue = ALLOWANCE_VALUES[t.allowance] ?? 0;

  totalKm += t.kilometers;
  totalAllowance += allowanceValue;

  return {
    id: t.id,
    date: t.date.toISOString().split("T")[0],
    startAddress: t.startAddress,
    endAddress: t.endAddress,
    kilometers: t.kilometers,
    allowance: allowanceValue,
    notes: t.notes ?? "",   // 🔥 lisätty
  };
});

    return NextResponse.json({
      totalKm,
      totalAllowance,
      totalCost: totalAllowance, // Matkakulut = päivärahat
      trips: resultTrips,
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Serverivirhe" });
  }
}
