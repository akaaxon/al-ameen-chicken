"use client";

import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Phone, LoaderCircle, Clock, CircleCheck, CircleX } from "lucide-react";
import PointsProgress from "../components/PointsProgress";
import { describePrize, type LoyaltyStatus } from "@/lib/loyalty";
import { readOrderIds, readSavedCustomer } from "@/lib/customer-storage";

interface OrderStatus {
  id: string;
  order_number: number;
  status: "pending" | "confirmed" | "cancelled";
  items: { name: string; quantity: number; price: number; reward?: boolean }[];
  total: number;
  reward: string | null;
  points_spent: number;
  points_earned: number;
  created_at: string;
}

const REFRESH_MS = 30000;

const STATUS = {
  pending: { label: "Waiting for confirmation", icon: Clock, className: "bg-[#F1B135] text-black" },
  confirmed: { label: "Confirmed", icon: CircleCheck, className: "bg-white text-black" },
  cancelled: { label: "Cancelled", icon: CircleX, className: "bg-neutral-800 text-neutral-400" },
};

// localStorage is read through useSyncExternalStore so the server render
// (no storage) and the first client render agree
const noopSubscribe = () => () => {};
function useStored<T>(read: () => T, empty: T) {
  const json = useSyncExternalStore(
    noopSubscribe,
    () => JSON.stringify(read()),
    () => JSON.stringify(empty),
  );
  return useMemo(() => JSON.parse(json) as T, [json]);
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Something went wrong");
  return data;
}

export default function AccountPage() {
  const saved = useStored(readSavedCustomer, null);
  const orderIds = useStored(readOrderIds, [] as string[]);

  // Typed number wins; otherwise the one used for the last order
  const [typedPhone, setTypedPhone] = useState<string | null>(null);
  const phone = typedPhone ?? saved?.phone ?? "";
  const lookupPhone = isValidPhoneNumber(phone || "") ? phone : "";

  const [lookup, setLookup] = useState<{ phone: string; status: LoyaltyStatus } | null>(null);
  const loyalty = lookup?.phone === lookupPhone ? lookup.status : null;

  const [orders, setOrders] = useState<OrderStatus[] | null>(null);

  // Points for the number
  useEffect(() => {
    if (!lookupPhone) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      postJson<LoyaltyStatus>("/api/loyalty/status", { phone: lookupPhone })
        .then((status) => !cancelled && setLookup({ phone: lookupPhone, status }))
        .catch(() => {});
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [lookupPhone]);

  // Orders placed from this device, refreshed while any is waiting
  const idsKey = orderIds.join(",");
  const hasPending = orders?.some((o) => o.status === "pending") ?? false;
  useEffect(() => {
    if (!idsKey) return;
    let cancelled = false;
    const load = () =>
      postJson<OrderStatus[]>("/api/orders/status", { ids: idsKey.split(",") })
        .then((data) => !cancelled && setOrders(data))
        .catch(() => {});

    const first = setTimeout(load, 0);
    const interval = hasPending ? setInterval(load, REFRESH_MS) : undefined;
    return () => {
      cancelled = true;
      clearTimeout(first);
      clearInterval(interval);
    };
  }, [idsKey, hasPending]);

  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-20 selection:bg-[#F3494A] selection:text-black">
      <div className="max-w-3xl mx-auto px-6 space-y-12">
        <header>
          <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-none mb-4">
            My <span className="text-[#F3494A]">Points</span>
          </h1>
          <p className="text-neutral-500 font-medium uppercase tracking-[0.2em] text-xs md:text-sm">
            Earn points on every website order and trade them for rewards.
          </p>
        </header>

        {/* POINTS */}
        <section className="space-y-4">
          <div className="relative">
            <PhoneInput
              placeholder="Your phone number"
              defaultCountry="LB"
              value={phone}
              onChange={(value) => setTypedPhone(value || "")}
              autoComplete="tel"
              international
              countryCallingCodeEditable={false}
              className="w-full bg-white border border-white/10 rounded-xl py-3 pl-12 pr-4 text-black"
            />
            <Phone className="absolute left-4 top-3 text-neutral-500" size={16} />
          </div>

          {lookupPhone && !loyalty && (
            <div className="flex items-center gap-2 text-neutral-500 text-sm">
              <LoaderCircle size={16} className="animate-spin" />
              Checking your points…
            </div>
          )}

          {loyalty && (
            <>
              <PointsProgress loyalty={loyalty} known pointsEarned={0} />

              {loyalty.prizes.length > 0 && (
                <div className="rounded-xl border border-white/10 divide-y divide-white/5">
                  {loyalty.prizes.map((prize) => {
                    const unlocked = loyalty.points >= prize.points_required;
                    return (
                      <div
                        key={prize.id}
                        className={`flex items-center justify-between gap-3 px-4 py-3 ${unlocked ? "" : "opacity-50"}`}
                      >
                        <span>
                          <span className="block font-bold">{prize.title}</span>
                          <span className="block text-sm text-neutral-400">{describePrize(prize)}</span>
                        </span>
                        <span className="text-right shrink-0">
                          <span className="block font-black">{prize.points_required} pts</span>
                          <span className={`block text-xs ${unlocked ? "text-[#F3494A] font-bold uppercase" : "text-neutral-500"}`}>
                            {unlocked ? "Ready to redeem" : `${prize.points_required - loyalty.points} more`}
                          </span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              <p className="text-xs text-neutral-500">
                Points from an order are added once we confirm it. Redeem rewards at checkout.
              </p>
            </>
          )}
        </section>

        {/* ORDERS */}
        <section className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">Your orders</h2>

          {!idsKey || (orders && orders.length === 0) ? (
            <p className="text-neutral-500 text-sm">
              Orders you place on this device show up here.{" "}
              <Link href="/menu" className="text-[#F3494A] font-bold">
                Order now ›
              </Link>
            </p>
          ) : !orders ? (
            <div className="flex items-center gap-2 text-neutral-500 text-sm">
              <LoaderCircle size={16} className="animate-spin" />
              Loading your orders…
            </div>
          ) : (
            <ul className="space-y-3">
              {orders.map((order) => {
                const status = STATUS[order.status];
                const Icon = status.icon;
                return (
                  <li
                    key={order.id}
                    className={`rounded-xl border border-white/10 p-4 space-y-3 ${order.status === "cancelled" ? "opacity-60" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xl font-black uppercase">#{order.order_number}</p>
                        <p className="text-xs text-neutral-500">
                          {new Date(order.created_at).toLocaleString([], {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </p>
                      </div>
                      <span
                        className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shrink-0 ${status.className}`}
                      >
                        <Icon size={14} />
                        {status.label}
                      </span>
                    </div>

                    <p className="text-sm text-neutral-300">
                      {order.items
                        .map((i) => `${i.quantity}× ${i.name}${i.reward ? " (reward)" : ""}`)
                        .join(", ")}
                    </p>

                    <div className="flex items-end justify-between gap-3 border-t border-white/5 pt-3">
                      <p className="text-xs text-neutral-400">
                        {order.status === "pending" && `+${order.points_earned} points once confirmed`}
                        {order.status === "confirmed" && `+${order.points_earned} points earned`}
                        {order.status === "cancelled" &&
                          (order.points_spent > 0
                            ? `Your ${order.points_spent} reward points were returned`
                            : "No points for cancelled orders")}
                        {order.reward && order.status !== "cancelled" && (
                          <span className="block">Reward used: {order.reward}</span>
                        )}
                      </p>
                      <p className="text-lg font-black shrink-0">${Number(order.total).toFixed(2)}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
