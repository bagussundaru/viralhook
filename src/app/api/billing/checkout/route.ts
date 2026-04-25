import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { snap } from "@/lib/midtrans";
import { PLANS, isPlanHigher, type PlanKey } from "@/lib/plans";

const checkoutSchema = z.object({
  plan: z.enum(["CREATOR", "PRO"]),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Plan tidak valid" }, { status: 400 });
    }

    const targetPlan = parsed.data.plan;
    const currentPlan = ((session.user as Record<string, unknown>).plan as PlanKey) ?? "FREE";

    if (!isPlanHigher(currentPlan, targetPlan)) {
      return NextResponse.json(
        { error: "Kamu sudah di plan ini atau yang lebih tinggi." },
        { status: 400 }
      );
    }

    const planConfig = PLANS[targetPlan];
    const orderId = `VH-${session.user.id.slice(-8)}-${Date.now()}`;

    const transaction = await snap.createTransaction({
      transaction_details: {
        order_id: orderId,
        gross_amount: planConfig.priceMonthly,
      },
      item_details: [
        {
          id: targetPlan,
          name: `ViralHook ${planConfig.name} — 1 Bulan`,
          price: planConfig.priceMonthly,
          quantity: 1,
        },
      ],
      customer_details: {
        email: session.user.email ?? undefined,
        first_name: session.user.name ?? "Kreator",
      },
      expiry: { duration: 1, unit: "hours" },
    });

    // Simpan order sementara di Subscription (status: pending)
    await prisma.subscription.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        plan: targetPlan,
        status: "pending",
        midtransOrderId: orderId,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      update: {
        plan: targetPlan,
        status: "pending",
        midtransOrderId: orderId,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    return NextResponse.json({
      snapToken: transaction.token,
      orderId,
      redirectUrl: transaction.redirect_url,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Gagal membuat pembayaran. Coba lagi." }, { status: 500 });
  }
}
