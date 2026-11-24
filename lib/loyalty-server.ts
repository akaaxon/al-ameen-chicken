import { parsePhoneNumberFromString } from "libphonenumber-js";
import { supabaseChicken } from "./supabase";
import type { Prize } from "./loyalty";

// Returns E.164 (+96170123456) or null if invalid.
export function normalizePhone(raw: unknown) {
  if (typeof raw !== "string") return null;
  const parsed = parsePhoneNumberFromString(raw, "LB");
  return parsed?.isValid() ? parsed.number : null;
}

export async function getActivePrizes(): Promise<Prize[]> {
  const { data, error } = await supabaseChicken
    .from("prizes")
    .select("id, title, type, points_required, discount_value, product:products (id, name, image_url)")
    .eq("is_active", true)
    .order("points_required");
  if (error) throw error;
  return data as unknown as Prize[];
}

export async function getDollarsPerPoint(): Promise<number> {
  const { data, error } = await supabaseChicken
    .from("loyalty_settings")
    .select("dollars_per_point")
    .single();
  if (error) throw error;
  return Number(data.dollars_per_point);
}

export async function getPoints(phone: string): Promise<number> {
  const { data, error } = await supabaseChicken
    .from("customers")
    .select("points")
    .eq("phone", phone)
    .maybeSingle();
  if (error) throw error;
  return data?.points ?? 0;
}
