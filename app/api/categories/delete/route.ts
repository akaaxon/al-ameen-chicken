import { NextResponse } from "next/server";
import { supabaseChicken } from "@/lib/supabase";
// --- DELETE LOGIC (DELETE) ---
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "No product id provided" }, { status: 400 });
    }
    const { error } = await supabaseChicken
      .from("categories")
      .delete()
      .eq("id", id);
    if (error) throw error;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
    return NextResponse.json({ success: true });
}