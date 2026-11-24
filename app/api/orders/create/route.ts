import { NextResponse } from "next/server";
import { supabaseChicken } from "@/lib/supabase";
import { getPoints, normalizePhone } from "@/lib/loyalty-server";
import { DELIVERY_FEE } from "@/lib/loyalty";

export const dynamic = "force-dynamic";

// Errors raised by private.place_order, mapped to messages for the customer.
const ORDER_ERRORS: Record<string, string> = {
  empty_cart: "Your bag is empty.",
  invalid_quantity: "One of the quantities is invalid.",
  item_unavailable: "An item in your bag is no longer available. Please refresh the menu.",
  prize_unavailable: "That reward is no longer available.",
  not_enough_points: "You don't have enough points for that reward.",
};

export async function POST(req: Request) {
  try {
    const { name, phone: rawPhone, address, items, prize_id } = await req.json();
    const phone = normalizePhone(rawPhone);

    if (typeof name !== "string" || name.trim().length < 2 || !phone || typeof address !== "string" || address.trim().length < 4) {
      return NextResponse.json({ error: "Name, phone and address are required" }, { status: 400 });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: ORDER_ERRORS.empty_cart }, { status: 400 });
    }

    const { data: order, error } = await supabaseChicken.rpc("place_order", {
      p_phone: phone,
      p_name: name.trim(),
      p_address: address.trim(),
      p_items: (items as { id: unknown; quantity: unknown }[]).map((i) => ({ product_id: String(i.id), quantity: Number(i.quantity) })),
      p_prize_id: prize_id || null,
      p_delivery_fee: DELIVERY_FEE,
    });

    if (error) {
      const known = Object.keys(ORDER_ERRORS).find((code) => error.message.includes(code));
      if (known) return NextResponse.json({ error: ORDER_ERRORS[known] }, { status: 409 });
      throw error;
    }

    return NextResponse.json({
      id: order.id, // kept by the browser to check this order's status later
      order_number: order.order_number,
      total: order.total,
      points_earned: order.points_earned,
      points_spent: order.points_spent,
      points_balance: await getPoints(phone), // earned points are added once the shop confirms
    });
  } catch (error) {
    console.error("Order Create Error:", (error as Error).message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
