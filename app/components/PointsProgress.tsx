"use client";

import { Gift } from "lucide-react";
import type { LoyaltyStatus } from "@/lib/loyalty";

// Points balance and how far the customer is from the closest next reward
export default function PointsProgress({
  loyalty,
  known,
  pointsEarned,
  bare = false,
}: {
  loyalty: LoyaltyStatus;
  known: boolean; // phone entered, so points are this customer's
  pointsEarned: number;
  bare?: boolean;
}) {
  const { points, prizes } = loyalty;
  const next = prizes.find((p) => p.points_required > points) ?? null;
  const redeemable = prizes.filter((p) => p.points_required <= points).length;
  const needed = next ? next.points_required - points : 0;
  const pct = (n: number) => `${Math.min(100, (n / (next?.points_required || 1)) * 100)}%`;

  return (
    <div className={bare ? "space-y-3" : "rounded-xl border border-white/10 p-4 space-y-3"}>
      <div className="flex items-baseline justify-between">
        <p className="font-black uppercase flex items-center gap-2">
          <Gift size={16} className="text-[#F3494A]" />
          {known ? "Your points" : "Earn points"}
        </p>
        <p className="text-2xl font-black">
          {known ? points : `+${pointsEarned}`}
        </p>
      </div>

      {next && (
        <div className="space-y-2">
          {/* current points, plus a lighter segment for what this order adds */}
          <div className="relative h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-[#F3494A]/35"
              style={{ width: pct(points + pointsEarned) }}
            />
            <div
              className="absolute inset-y-0 left-0 bg-[#F3494A]"
              style={{ width: pct(points) }}
            />
          </div>
          <p className="text-sm">
            {pointsEarned >= needed ? (
              <>
                This order unlocks <span className="font-bold">{next.title}</span>
              </>
            ) : (
              <>
                <span className="font-black text-[#F3494A]">{needed} more points</span> for{" "}
                <span className="font-bold">{next.title}</span>
              </>
            )}
          </p>
        </div>
      )}

      <p className="text-xs text-neutral-400">
        {known && pointsEarned > 0 && `+${pointsEarned} points with this order. `}
        {known && redeemable > 0 && !bare &&
          `You can redeem ${redeemable === 1 ? "a reward" : `${redeemable} rewards`} at checkout.`}
        {!known && "Enter your number at checkout to see your points."}
      </p>
    </div>
  );
}
