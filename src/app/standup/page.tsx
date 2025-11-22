import { prisma } from "@/lib/prisma";
import StandUpClient from "./StandUpClient";

export const revalidate = 60; // ISR – päivittyy 1 min välein

export default async function StandUpPage() {
  const gigs = await prisma.standupGig.findMany({
    where: { isPublic: true },
    orderBy: { date: "asc" },
  });

  return <StandUpClient gigs={gigs} />;
}
