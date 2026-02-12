import { supabaseChicken } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // category_id filter
    const category_id = searchParams.get("category_id");
    
    // Internal pagination - these don't show up in the browser URL
    const start = parseInt(searchParams.get("start") || "0");
    const limit = 8;
    const end = start + limit - 1;

    let query = supabaseChicken
      .from("products")
      .select("*")
      .eq("is_available", true)
      .order("created_at", { ascending: false })
      .range(start, end); // Fetching 10 at a time

    if (category_id && category_id !== "all") {
      query = query.eq("category_id", category_id);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, {
  headers: {
    'Cache-Control': 'no-store, max-age=0, must-revalidate',
  },
});
  } catch (err) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}