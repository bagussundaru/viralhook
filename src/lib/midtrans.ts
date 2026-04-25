import crypto from "crypto";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const midtransClient = require("midtrans-client");

interface SnapTransactionResult {
  token: string;
  redirect_url: string;
}

interface CreateTransactionParams {
  transaction_details: { order_id: string; gross_amount: number };
  item_details?: Array<{ id: string; name: string; price: number; quantity: number }>;
  customer_details?: { email?: string; first_name?: string };
  expiry?: { duration: number; unit: string };
}

interface SnapInstance {
  createTransaction: (params: CreateTransactionParams) => Promise<SnapTransactionResult>;
}

function createSnapClient(): SnapInstance {
  return new midtransClient.Snap({
    isProduction: process.env.MIDTRANS_ENV === "production",
    serverKey: process.env.MIDTRANS_SERVER_KEY ?? "",
    clientKey: process.env.MIDTRANS_CLIENT_KEY ?? "",
  }) as SnapInstance;
}

const globalForMidtrans = globalThis as unknown as { snapClient: SnapInstance | undefined };
export const snap: SnapInstance = globalForMidtrans.snapClient ?? createSnapClient();
if (process.env.NODE_ENV !== "production") globalForMidtrans.snapClient = snap;

export function verifyMidtransSignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  receivedSignature: string
): boolean {
  const serverKey = process.env.MIDTRANS_SERVER_KEY ?? "";
  const hash = crypto
    .createHash("sha512")
    .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
    .digest("hex");
  return hash === receivedSignature;
}

export type { SnapTransactionResult, CreateTransactionParams };
