import { prisma } from "@/lib/prisma";
import StandUpClient from "./StandUpClient";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0; // 🔥 estää prerenderöinnin kokonaan

export default async function StandUpPage() {
  const gigs = await prisma.standupGig.findMany({
    where: { isPublic: true },
    orderBy: { date: "asc" },
  });

  return <StandUpClient gigs={gigs} />;
}
