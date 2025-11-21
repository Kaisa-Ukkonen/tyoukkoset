import { prisma } from "@/lib/prisma";
import TattoosClient from "./TattoosClient";

export const revalidate = 60; // ISR – päivittyy kerran minuutissa

export default async function TattoosPage() {
  const tattoos = await prisma.tattoo.findMany({
    where: { isPublic: true },
    orderBy: { createdAt: "desc" },
  });

  return <TattoosClient tattoos={tattoos} />;
}