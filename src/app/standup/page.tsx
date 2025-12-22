import { prisma } from "@/lib/prisma";
import StandUpClient from "./StandUpClient";

// ISR
export const revalidate = 60;
export const dynamic = "force-dynamic";

export default async function StandUpPage() {
  const gigs = await prisma.standupGig.findMany({
    where: { isPublic: true },
    orderBy: { date: "asc" },
  });

  // 🔑 TÄMÄ ON RATKAISEVA
  const safeGigs = gigs.map((gig) => ({
    ...gig,
    date: gig.date.toISOString(), // Date → string
  }));

  return <StandUpClient gigs={safeGigs} />;
}
