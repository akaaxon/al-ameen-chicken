import { NextResponse } from "next/server";
import { supabaseChicken } from "@/lib/supabase";
export const dynamic = 'force-dynamic';
export async function GET() {
    const sortedCategories =[
  "Appetizer", "Sandwich", "Burger", "Chicken", 
  "Meals", "Wings", "Offers", "Sauce", "Drinks"
];
    const { data, error } = await supabaseChicken
      .from("categories")
      .select(`id, title, description, image_url, products(id)`)
      .order("created_at", { ascending: false });
    const sortedData = data?.sort((a, b) => {
  return sortedCategories.indexOf(a.title) - sortedCategories.indexOf(b.title);
});
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(sortedData);
}