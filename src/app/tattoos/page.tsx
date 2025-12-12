//Sivua generoidaan staattisesti -SSG (Static Site Generation) -Sivua päivitetään automaattisesti minuutin välein -ISR (Incremental Static Regeneration) -Google saa aina tuoreen sisällön mutta lataus on yhtä nopea kuin staattisilla sivuilla

import { prisma } from "@/lib/prisma";
import TattoosClient from "./TattoosClient";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export const revalidate = 60; // ISR – päivittyy kerran minuutissa

export default async function TattoosPage() {
  const tattoos = await prisma.tattoo.findMany({
    where: { isPublic: true },
    orderBy: { createdAt: "desc" },
  });

  return <TattoosClient tattoos={tattoos} />;
}