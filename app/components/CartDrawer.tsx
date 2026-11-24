"use client";

import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import {
  ShoppingBag,
  X,
  Plus,
  Phone,
  Minus,
  Trash2,
  ArrowLeft,
  MapPin,
  User,
  Check,
  CircleCheck,
  LoaderCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { CartItem } from "@/hooks/useCart";
import PointsProgress from "./PointsProgress";
import {
  readSavedCustomer,
  saveCustomer,
  saveOrderId,
  type CustomerDetails,
} from "@/lib/customer-storage";
import {
  describePrize,
  previewTotals,
  type LoyaltyStatus,
} from "@/lib/loyalty";

/* ------------------------------------------------------------------ */
/* TYPES */
/* ------------------------------------------------------------------ */

interface Props {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  cartTotal: number;
  cartCount: number;
  updateQty: (id: string, delta: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
}

type OrderResult = {
  id: string;
  order_number: number;
  total: number;
  points_earned: number;
  points_spent: number;
  points_balance: number;
};

const money = (n: number) => `$${n.toFixed(2)}`;

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

/* ------------------------------------------------------------------ */
/* COMPONENT */
/* ------------------------------------------------------------------ */

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  cartTotal,
  updateQty,
  removeFromCart,
  clearCart,
}: Props) {
  const [step, setStep] = useState<"cart" | "form" | "done">("cart");
  const [details, setDetails] = useState<CustomerDetails>({
    name: "",
    phone: "",
    address: "",
  });

  // Loyalty: looked up from the phone number (no password; the shop's
  // confirmation call catches anyone using someone else's number)
  const [lookup, setLookup] = useState<{ phone: string; status: LoyaltyStatus } | null>(null);
  const [lookupFailed, setLookupFailed] = useState(false);
  const [prizeId, setPrizeId] = useState<string | null>(null);

  const [placing, setPlacing] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [result, setResult] = useState<OrderResult | null>(null);

  // Every time the drawer opens: start on the bag, prefill the last customer
  const [wasOpen, setWasOpen] = useState(isOpen);
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) {
      setStep("cart");
      setOrderError("");
      const saved = details.phone ? null : readSavedCustomer();
      if (saved) setDetails(saved);
    }
  }

  const phoneValid = isValidPhoneNumber(details.phone || "");
  const lookupPhone = phoneValid ? details.phone : "";
  // Only trust a lookup made for the number currently typed ("" = no number)
  const loyalty = lookup?.phone === lookupPhone ? lookup.status : null;

  // Points + rewards for the phone (or just the rewards if no phone yet)
  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    const timer = setTimeout(() => {
      postJson<LoyaltyStatus>("/api/loyalty/status", { phone: lookupPhone || undefined })
        .then((status) => !cancelled && setLookup({ phone: lookupPhone, status }))
        .catch(() => !cancelled && setLookupFailed(true)); // ordering still works
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [lookupPhone, isOpen]);

  const selectedPrize = loyalty?.prizes.find((p) => p.id === prizeId) ?? null;
  const rate = loyalty?.dollars_per_point ?? 1;
  const totals = previewTotals(cartTotal, selectedPrize, rate);
  const bagTotals = previewTotals(cartTotal, null, rate); // rewards are picked at checkout

  // ✅ Form is valid only if all fields are filled AND phone is valid
  const isValid =
    details.name.trim().length > 1 &&
    phoneValid &&
    details.address.trim().length > 3;

  // ✅ Place the order on the website (first order also saves the customer)
  const handleCheckout = async () => {
    setPlacing(true);
    setOrderError("");
    try {
      const order = await postJson<OrderResult>("/api/orders/create", {
        ...details,
        items: cart.map((i) => ({ id: i.id, quantity: i.quantity })),
        prize_id: prizeId,
      });

      setResult(order);
      saveCustomer(details);
      saveOrderId(order.id);
      setLookup((prev) =>
        prev ? { ...prev, status: { ...prev.status, points: order.points_balance } } : prev,
      );
      setStep("done");
      clearCart();
    } catch (err) {
      setOrderError((err as Error).message);
    } finally {
      setPlacing(false);
    }
  };

  const handleClose = () => {
    if (step === "done") {
      setStep("cart");
      setResult(null);
      setPrizeId(null);
    }
    onClose();
  };

  return (
    <div
      className={`fixed inset-0 z-[999] ${isOpen ? "visible" : "invisible"}`}
    >
      {/* BACKDROP */}
      <div
        className={`absolute inset-0 bg-black/80 transition-opacity ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleClose}
      />

      {/* PANEL */}
      <aside
        className={`absolute right-0 top-0 h-full w-full md:w-[500px] bg-[#080808] flex flex-col
        transition-transform duration-700 ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* HEADER */}
        <div className="p-6 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-3">
            {step === "form" && (
              <button onClick={() => setStep("cart")}>
                <ArrowLeft />
              </button>
            )}
            <h2 className="text-2xl font-black uppercase">
              {step === "cart" ? "Your Bag" : step === "form" ? "Checkout" : "Order Placed"}
            </h2>
          </div>
          <button onClick={handleClose}>
            <X />
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {step === "done" && result ? (
            <div className="h-full flex flex-col items-center justify-center text-center gap-4">
              <CircleCheck size={60} className="text-[#F3494A]" />
              <p className="text-2xl font-black uppercase">
                Order #{result.order_number}
              </p>
              <p className="text-neutral-400">
                We received your order and will call you to confirm it.
              </p>
              <div className="w-full rounded-xl border border-white/10 p-4 space-y-1">
                <Row label="Total" value={`$${Number(result.total).toFixed(2)}`} />
                {result.points_spent > 0 && (
                  <Row label="Points used" value={`-${result.points_spent}`} />
                )}
                <Row label="Points earned" value={`+${result.points_earned} once confirmed`} />
                <Row label="Your balance" value={`${result.points_balance} pts`} strong />
              </div>
              <Link
                href="/account"
                onClick={handleClose}
                className="text-sm font-black uppercase tracking-widest text-[#F3494A]"
              >
                Track this order ›
              </Link>
            </div>
          ) : step === "cart" ? (
            cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-50">
                <ShoppingBag size={60} />
                <p className="mt-4 font-black uppercase">Bag is empty</p>
              </div>
            ) : (
              <>
                <ul className="space-y-5">
                  {cart.map((item) => (
                    <li key={item.id} className="flex gap-4">
                      <div className="relative w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-neutral-900">
                        <img
                          src={item.image_url}
                          alt={item.name}
                          loading="lazy"
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h4 className="font-black uppercase leading-tight">{item.name}</h4>
                            <p className="text-xs text-neutral-500 mt-0.5">{money(item.price)} each</p>
                          </div>
                          <p className="font-black shrink-0">{money(item.price * item.quantity)}</p>
                        </div>

                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQty(item.id, -1)}
                              aria-label="Remove one"
                              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 transition-colors text-white"
                            >
                              <Minus size={14} />
                            </button>

                            <span className="w-8 text-center font-bold text-white">
                              {item.quantity}
                            </span>

                            <button
                              onClick={() => updateQty(item.id, 1)}
                              aria-label="Add one"
                              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 transition-colors text-white"
                            >
                              <Plus size={14} />
                            </button>
                          </div>

                          <button
                            onClick={() => removeFromCart(item.id)}
                            aria-label={`Remove ${item.name}`}
                            className="text-neutral-500 hover:text-[#F3494A] transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                {/* PRICE BREAKDOWN */}
                <div className="rounded-xl border border-white/10 p-4 space-y-1">
                  {cart.map((item) => (
                    <Row
                      key={item.id}
                      label={`${item.quantity} × ${item.name}`}
                      value={money(item.price * item.quantity)}
                    />
                  ))}
                  <div className="border-t border-white/5 my-2" />
                  <Row label="Subtotal" value={money(bagTotals.subtotal)} />
                  <Row label="Delivery" value={bagTotals.delivery > 0 ? money(bagTotals.delivery) : "Free"} />
                  <Row label="Total" value={money(bagTotals.total)} strong />
                </div>

                {loyalty && (
                  <PointsProgress
                    loyalty={loyalty}
                    known={phoneValid}
                    pointsEarned={bagTotals.pointsEarned}
                  />
                )}
              </>
            )
          ) : (
            <div className="space-y-4">
              {/* Full Name */}
              <Input
                icon={<User size={16} />}
                name="name"
                placeholder="Full name"
                value={details.name}
                onChange={(v) => setDetails({ ...details, name: v })}
              />

              {/* Phone Number (production-ready) */}
              <div className="relative">
                <PhoneInput
                  placeholder="Phone number"
                  defaultCountry="LB"
                  value={details.phone}
                  onChange={(value) => {
                    // New number: forget the previous number's points state
                    setDetails({ ...details, phone: value || "" });
                    setLookupFailed(false);
                    setPrizeId(null);
                  }}
                  name="phone"
                  autoComplete="tel"
                  international={true} // allow +961 format
                  countryCallingCodeEditable={false}
                  className="w-full bg-white border border-white/10 rounded-xl py-3 pl-12 pr-4 text-black "
                />
                <Phone
                  className="absolute left-4 top-3 text-neutral-500"
                  size={16}
                />
              </div>

              {/* Address */}
              <Input
                icon={<MapPin size={16} />}
                name="address"
                placeholder="Delivery address"
                textarea
                value={details.address}
                onChange={(v) => setDetails({ ...details, address: v })}
              />

              {/* LOYALTY */}
              {phoneValid && !loyalty && !lookupFailed && (
                <div className="flex items-center gap-2 text-neutral-500 text-sm">
                  <LoaderCircle size={16} className="animate-spin" />
                  Checking your points…
                </div>
              )}

              {phoneValid && loyalty && (
                <div className="rounded-xl border border-white/10 p-4 space-y-3">
                  <PointsProgress
                    loyalty={loyalty}
                    known
                    pointsEarned={totals.pointsEarned}
                    bare
                  />

                  {loyalty.prizes.length > 0 && (
                    <div className="space-y-2">
                      {loyalty.prizes.map((prize) => {
                        const unlocked = loyalty.points >= prize.points_required;
                        const selected = prize.id === prizeId;
                        return (
                          <button
                            key={prize.id}
                            disabled={!unlocked}
                            onClick={() => setPrizeId(selected ? null : prize.id)}
                            className={`w-full flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-left border transition-colors ${
                              selected
                                ? "border-[#F3494A] bg-[#F3494A]/10"
                                : unlocked
                                  ? "border-white/10 hover:border-white/30"
                                  : "border-white/5 opacity-40"
                            }`}
                          >
                            <span>
                              <span className="block font-bold">{prize.title}</span>
                              <span className="block text-sm text-neutral-400">
                                {describePrize(prize)} · {prize.points_required} pts
                              </span>
                            </span>
                            {selected ? (
                              <Check size={18} className="text-[#F3494A] shrink-0" />
                            ) : !unlocked ? (
                              <span className="text-xs text-neutral-400 shrink-0">
                                {prize.points_required - loyalty.points} more
                              </span>
                            ) : (
                              <span className="text-xs font-bold uppercase shrink-0">Redeem</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}

                </div>
              )}
            </div>
          )}
        </div>

        {/* FOOTER */}
        {step === "done" ? (
          <div className="p-6 border-t border-white/5">
            <button
              onClick={handleClose}
              className="w-full bg-white text-black py-4 rounded-xl font-black"
            >
              Back to menu
            </button>
          </div>
        ) : (
          cart.length > 0 && (
            <div className="p-6 border-t border-white/5">
              {step === "cart" ? (
                <button
                  onClick={() => setStep("form")}
                  className="w-full bg-white text-black py-4 px-6 rounded-xl font-black flex items-center justify-between"
                >
                  <span>Checkout</span>
                  <span>{money(bagTotals.total)}</span>
                </button>
              ) : (
                <>
                  <div className="space-y-1 mb-4">
                    <Row label="Subtotal" value={`$${totals.subtotal.toFixed(2)}`} />
                    {(totals.delivery > 0 || selectedPrize?.type === "free_delivery") && (
                      <Row
                        label="Delivery"
                        value={totals.delivery > 0 ? `$${totals.delivery.toFixed(2)}` : "Free"}
                      />
                    )}
                    {totals.discount > 0 && (
                      <Row label="Reward" value={`-$${totals.discount.toFixed(2)}`} />
                    )}
                    {selectedPrize?.type === "free_item" && (
                      <Row label={describePrize(selectedPrize)} value="$0.00" />
                    )}
                    <Row label="Total" value={`$${totals.total.toFixed(2)}`} strong />
                  </div>
                  {orderError && (
                    <p className="text-sm text-[#F3494A] mb-3">{orderError}</p>
                  )}
                  <button
                    disabled={!isValid || placing}
                    onClick={handleCheckout}
                    className={`w-full py-4 rounded-xl font-black flex items-center justify-center gap-2 ${
                      isValid && !placing
                        ? "bg-[#F3494A] text-white"
                        : "bg-neutral-800 text-neutral-500"
                    }`}
                  >
                    {placing && <LoaderCircle size={18} className="animate-spin" />}
                    Place Order
                  </button>
                </>
              )}
            </div>
          )
        )}
      </aside>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* SMALL COMPONENTS */
/* ------------------------------------------------------------------ */

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex justify-between ${strong ? "text-xl font-black pt-1" : "text-sm text-neutral-400"}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* INPUT COMPONENT */
/* ------------------------------------------------------------------ */

interface InputProps {
  icon: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  name?: string;
  textarea?: boolean;
  type?: React.HTMLInputTypeAttribute;
}

function Input({
  icon,
  value,
  onChange,
  placeholder,
  name,
  textarea = false,
  type = "text",
}: InputProps) {
  const Component = textarea ? "textarea" : "input";

  return (
    <div className="relative">
      <span className="absolute left-4 top-4 text-neutral-500">{icon}</span>

      <Component
        value={value}
        onChange={(e: React.ChangeEvent<any>) => onChange(e.target.value)}
        placeholder={placeholder}
        name={name}
        rows={textarea ? 3 : undefined}
        type={!textarea ? type : undefined}
        className="w-full bg-white border border-white/10 rounded-xl py-3 pl-12 pr-4 text-black  resize-none"
        autoComplete={name} // enables browser autocomplete for production
      />
    </div>
  );
}
