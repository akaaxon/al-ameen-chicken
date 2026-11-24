import { NextResponse } from "next/server";
import { getActivePrizes, getDollarsPerPoint, getPoints, normalizePhone } from "@/lib/loyalty-server";
import type { LoyaltyStatus } from "@/lib/loyalty";

export const dynamic = "force-dynamic";

// Points + rewards for the phone typed at checkout. No password: a reward used
// by someone else's number is caught by the shop's confirmation call.
// Without a phone (bag before checkout) it returns 0 points so the bag can
// still show what this order earns and the first reward.
export async function POST(req: Request) {
  try {
    const { phone: rawPhone } = await req.json();
    const phone = rawPhone ? normalizePhone(rawPhone) : null;
    if (rawPhone && !phone) {
      return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
    }

    const [points, prizes, dollars_per_point] = await Promise.all([
      phone ? getPoints(phone) : 0,
      getActivePrizes(),
      getDollarsPerPoint(),
    ]);

    const status: LoyaltyStatus = { points, prizes, dollars_per_point };
    return NextResponse.json(status);
  } catch (error) {
    console.error("Loyalty Status Error:", (error as Error).message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
