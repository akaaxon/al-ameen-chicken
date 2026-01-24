"use client";

import Image from "next/image";
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
  MessageCircle,
  MapPin,
  User,
} from "lucide-react";
import { useState } from "react";
import type { CartItem } from "@/hooks/useCart";

const WHATSAPP_NUMBER = "96170772324";

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

type CustomerDetails = {
  name: string;
  phone: string;
  address: string;
};

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
  const [step, setStep] = useState<"cart" | "form">("cart");
  const [details, setDetails] = useState<CustomerDetails>({
    name: "",
    phone: "",
    address: "",
  });

  // ✅ Form is valid only if all fields are filled AND phone is valid
  const isValid =
    details.name.trim().length > 1 &&
    isValidPhoneNumber(details.phone || "") &&
    details.address.trim().length > 3;

  // ✅ Handle WhatsApp checkout
  const handleCheckout = () => {
    const items = cart
      .map(
        (i) =>
          `• *${i.quantity}x* ${i.name.toUpperCase()} ($${(
            i.price * i.quantity
          ).toFixed(2)})`,
      )
      .join("\n");

    const message =
      `*NEW ORDER REQUEST - AL AMIN*\n\n` +
      `*CUSTOMER DETAILS*\n` +
      `Name: ${details.name}\n` +
      `Phone: ${details.phone}\n` +
      `Address: ${details.address}\n\n` +
      `*ORDER SUMMARY*\n${items}\n\n` +
      `*TOTAL: $${cartTotal.toFixed(2)}*`;

    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,
      "_blank",
    );

    clearCart();
    setStep("cart");
    setDetails({ name: "", phone: "", address: "" });
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
        onClick={onClose}
      />

      {/* PANEL */}
      <aside
        className={`absolute right-0 top-0 h-full w-full md:w-[500px] bg-[#080808]
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
              {step === "cart" ? "Your Bag" : "Checkout"}
            </h2>
          </div>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {step === "cart" ? (
            cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-50">
                <ShoppingBag size={60} />
                <p className="mt-4 font-black uppercase">Bag is empty</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex gap-4 items-center">
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden">
                    <Image
                      src={item.image_url}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1">
                    <h4 className="font-black uppercase">{item.name}</h4>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQty(item.id, -1)}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 transition-colors text-white"
                      >
                        <Minus size={14} />
                      </button>

                      <span className="w-8 text-center font-bold text-white">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() => updateQty(item.id, 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 transition-colors text-white"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  <button onClick={() => removeFromCart(item.id)}>
                    <Trash2 />
                  </button>
                </div>
              ))
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
                  onChange={(value) =>
                    setDetails({ ...details, phone: value || "" })
                  }
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
            </div>
          )}
        </div>

        {/* FOOTER */}
        {cart.length > 0 && (
          <div className="p-6 border-t border-white/5">
            {step === "cart" ? (
              <>
                <p className="text-3xl font-black mb-4">
                  ${cartTotal.toFixed(2)}
                </p>
                <button
                  onClick={() => setStep("form")}
                  className="w-full bg-white text-black py-4 rounded-xl font-black"
                >
                  Checkout
                </button>
              </>
            ) : (
              <button
                disabled={!isValid}
                onClick={handleCheckout}
                className={`w-full py-4 rounded-xl font-black flex items-center justify-center gap-2 ${
                  isValid
                    ? "bg-[#25D366] text-black"
                    : "bg-neutral-800 text-neutral-500"
                }`}
              >
                <MessageCircle />
                Send Order
              </button>
            )}
          </div>
        )}
      </aside>
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
