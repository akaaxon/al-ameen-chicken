import { NextResponse } from "next/server";
import { supabaseChicken } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Status of the orders this browser placed. Only order IDs work here (random
// UUIDs saved at checkout), never a phone number, and no address/phone is
// returned, so nobody can look up someone else's orders.
export async function POST(req: Request) {
  try {
    const { ids } = await req.json();
    const valid = Array.isArray(ids) ? ids.filter((id) => typeof id === "string" && UUID.test(id)).slice(0, 20) : [];
    if (valid.length === 0) return NextResponse.json([]);

    const { data, error } = await supabaseChicken
      .from("orders")
      .select("id, order_number, status, items, subtotal, delivery_fee, discount, total, prize_snapshot, points_spent, points_earned, created_at, confirmed_at, cancelled_at")
      .in("id", valid)
      .order("created_at", { ascending: false });
    if (error) throw error;

    return NextResponse.json(
      data.map(({ prize_snapshot, ...order }) => ({
        ...order,
        reward: (prize_snapshot as { title?: string } | null)?.title ?? null,
      })),
    );
  } catch (error) {
    console.error("Order Status Error:", (error as Error).message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
