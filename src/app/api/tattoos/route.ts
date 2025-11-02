import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile, unlink } from "fs/promises";
import path from "path";

export async function GET() {
  try {
    const tattoos = await prisma.tattoo.findMany({
      where: { isPublic: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(tattoos);
  } catch (error) {
    console.error("Virhe tatuointien haussa:", error);
    return NextResponse.json(
      { error: "Virhe tatuointien haussa" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Tiedosto puuttuu" }, { status: 400 });
    }

    // --- Tallennetaan kuva public/uploads-kansioon
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileName = `${Date.now()}-${file.name}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    const filePath = path.join(uploadDir, fileName);

    await writeFile(filePath, buffer);

    // --- Luodaan tietue tietokantaan (vain imageUrl)
    const newTattoo = await prisma.tattoo.create({
      data: {
        imageUrl: `/uploads/${fileName}`,
        
        isPublic: true,
      },
    });

    return NextResponse.json(newTattoo, { status: 201 });
  } catch (error) {
    console.error("Virhe kuvan tallennuksessa:", error);
    return NextResponse.json(
      { error: "Virhe kuvan tallennuksessa" },
      { status: 500 }
    );
  }
}

// 🔹 DELETE /api/tattoos?id=xxxxx
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID puuttuu" }, { status: 400 });
    }

    const tattoo = await prisma.tattoo.findUnique({ where: { id } });
    if (!tattoo) {
      return NextResponse.json({ error: "Tatuointia ei löytynyt" }, { status: 404 });
    }

    await prisma.tattoo.delete({ where: { id } });

    // Kuva poistetaan tiedostosta
    const filePath = path.join(process.cwd(), "public", tattoo.imageUrl);
    try {
      await unlink(filePath);
    } catch (err) {
      console.warn("Kuvan poisto epäonnistui:", err);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Virhe poistossa:", error);
    return NextResponse.json({ error: "Virhe tatuoinnin poistossa" }, { status: 500 });
  }
}
