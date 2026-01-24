import { NextResponse } from "next/server";
import { supabaseChicken } from "@/lib/supabase";

export async function PUT(req: Request) {
  try {
    const body = await req.json();

    const { id, name, price, description } = body;

    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    // 1. Update the record in your database
    const { data, error } = await supabaseChicken
      .from("products")
      .update({
        name,
        price: parseFloat(price),
        description,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Database Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 2. Return the updated product so the frontend can update the state
    return NextResponse.json(data);
  } catch (error) {
    console.error("Update Route Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}