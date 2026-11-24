// Shared by the checkout UI and the API. The server is the source of truth:
// the client only uses these to preview totals before placing the order.

// How many dollars earn one point is set in the CMS (loyalty_settings) and
// returned with every LoyaltyStatus. Delivery fee is excluded from earning.
export const DELIVERY_FEE = Number(process.env.NEXT_PUBLIC_DELIVERY_FEE || 0);

export type PrizeType =
  | "free_item"
  | "free_delivery"
  | "discount_percent"
  | "discount_fixed";

export interface Prize {
  id: string;
  title: string;
  type: PrizeType;
  points_required: number;
  discount_value: number | null;
  product: { id: string; name: string; image_url: string } | null;
}

// Looked up from the phone number at checkout (0 points for a new number).
export interface LoyaltyStatus {
  points: number;
  prizes: Prize[];
  dollars_per_point: number;
}

export function pointsFor(amountPaid: number, dollarsPerPoint: number) {
  // In cents so e.g. $10 / $0.10 doesn't floor to 99 from float error
  return Math.floor(Math.round(amountPaid * 100) / Math.round(dollarsPerPoint * 100));
}

export function previewTotals(subtotal: number, prize: Prize | null, dollarsPerPoint: number) {
  let delivery = DELIVERY_FEE;
  let discount = 0;

  if (prize?.type === "free_delivery") delivery = 0;
  if (prize?.type === "discount_percent")
    discount = Math.round(subtotal * (prize.discount_value ?? 0)) / 100;
  if (prize?.type === "discount_fixed")
    discount = Math.min(prize.discount_value ?? 0, subtotal);

  return {
    subtotal,
    delivery,
    discount,
    total: subtotal - discount + delivery,
    pointsEarned: pointsFor(subtotal - discount, dollarsPerPoint),
  };
}

export function describePrize(prize: Prize) {
  switch (prize.type) {
    case "free_item":
      return `Free ${prize.product?.name ?? "item"}`;
    case "free_delivery":
      return "Free delivery";
    case "discount_percent":
      return `${prize.discount_value}% off`;
    case "discount_fixed":
      return `$${(prize.discount_value ?? 0).toFixed(2)} off`;
  }
}
