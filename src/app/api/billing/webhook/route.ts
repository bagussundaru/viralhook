import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyMidtransSignature } from "@/lib/midtrans";
import type { PlanKey } from "@/lib/plans";

interface MidtransNotification {
  order_id: string;
  status_code: string;
  gross_amount: string;
  transaction_status: string;
  fraud_status?: string;
  signature_key: string;
  payment_type?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as MidtransNotification;

    const { order_id, status_code, gross_amount, transaction_status, fraud_status, signature_key } =
      body;

    // Verifikasi signature Midtrans
    const isValid = verifyMidtransSignature(order_id, status_code, gross_amount, signature_key);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    // Cari subscription berdasarkan order ID
    const subscription = await prisma.subscription.findFirst({
      where: { midtransOrderId: order_id },
    });

    if (!subscription) {
      // Order tidak dikenal — log dan return 200 agar Midtrans tidak retry
      console.warn("Midtrans webhook: unknown order_id", order_id);
      return NextResponse.json({ received: true });
    }

    const isSuccess =
      transaction_status === "settlement" ||
      (transaction_status === "capture" && fraud_status === "accept");

    const isFailed =
      transaction_status === "cancel" ||
      transaction_status === "deny" ||
      transaction_status === "expire";

    if (isSuccess) {
      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);

      await prisma.$transaction([
        prisma.subscription.update({
          where: { id: subscription.id },
          data: { status: "active", startDate, endDate },
        }),
        prisma.user.update({
          where: { id: subscription.userId },
          data: { plan: subscription.plan as PlanKey },
        }),
      ]);
    } else if (isFailed) {
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: transaction_status },
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    // Return 200 agar Midtrans tidak terus retry
    return NextResponse.json({ received: true });
  }
}
