import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { supabaseChicken } from "@/lib/supabase";

// FIX 1: This prevents Vercel from trying to "pre-build" this API route
export const dynamic = 'force-dynamic';

export async function DELETE(req: NextRequest) {
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

    // FIX 2: Move the success response INSIDE the try block 
    // to ensure it only returns if the delete succeeded.
    return NextResponse.json({ success: true });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
