// page.tsx (Server Component)
import TattoosClient from "./TattoosClient";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic"; // 🔥 TÄRKEIN RIVI
export const revalidate = 0;             // 🔒 varmistaa ettei prerenderöidä


export default async function Page() {
  const tattoos = await prisma.tattoo.findMany({
    where: { isPublic: true },
    orderBy: { createdAt: "desc" },
  });

  // 🔑 TÄMÄ ON KORJAUS
  const serializedTattoos = tattoos.map((t) => ({
    ...t,
    createdAt: t.createdAt?.toISOString(),
    updatedAt: t.updatedAt?.toISOString(),
  }));

  return <TattoosClient tattoos={serializedTattoos} />;
}
