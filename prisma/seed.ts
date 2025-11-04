import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔹 Luodaan oletustilit kirjanpitoon...");

  const defaultAccounts = [
    {
      name: "SumUp-myynti",
      type: "tulo",
      description: "Kortti- ja mobiilimaksut SumUp-päätteen kautta (rahat menevät suoraan yritystilille)",
    },
    {
      name: "Käteismyynti",
      type: "tulo",
      description: "Asiakkaan paikan päällä maksama käteinen",
    },
    {
      name: "Laskutusmyynti",
      type: "tulo",
      description: "Asiakkaille laskulla myydyt palvelut",
    },
    {
      name: "Tatuointitarvikkeet",
      type: "meno",
      description: "Musteet, neulat, kelmut, rasvat ja muut kulutustarvikkeet",
    },
    {
      name: "Stand Up -kulut",
      type: "meno",
      description: "Matkat, mikrofonit, valot, äänentoisto ja esiintymisvälineet",
    },
    {
      name: "Laitteet ja huolto",
      type: "meno",
      description: "Tatuointikoneet, virtalähteet, huollot ja korjaukset",
    },
    {
      name: "Markkinointi ja mainonta",
      type: "meno",
      description: "Some-mainokset, verkkomainonta ja printtimainokset",
    },
    {
      name: "Muut tulot",
      type: "tulo",
      description: "Satunnaiset tulot kuten yhteistyöt tai tapahtumamyynti",
    },
    {
      name: "Muut kulut",
      type: "meno",
      description: "Sekalaiset menot joita ei luokitella muualle",
    },
  ];

  for (const account of defaultAccounts) {
    await prisma.account.upsert({
      where: { name: account.name },
      update: {},
      create: account,
    });
  }

  console.log("✅ Oletustilit lisätty onnistuneesti!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
