import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const patchSchema = z.object({
  favorited: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Input tidak valid" }, { status: 400 });

  const generation = await prisma.generation.findFirst({
    where: { id, userId: session.user.id, deletedAt: null },
  });
  if (!generation) return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });

  const updated = await prisma.generation.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json({ favorited: updated.favorited });
}
