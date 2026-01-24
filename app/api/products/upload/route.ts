import { NextResponse } from "next/server";
import { supabaseChicken } from "@/lib/supabase";

// prevents Vercel from trying to "pre-build" this API route
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    
    // Extract everything from the form (matching your DB schema)
    const file = formData.get("file") as File; // The image
    const name = formData.get("name") as string;
    const category_id = formData.get("category_id") as string;
    const price = formData.get("price") as string;
    const description = formData.get("description") as string;

    // Validation: Ensure mandatory fields are present
    if (!file || !name || !category_id || !price) {
      return NextResponse.json(
        { error: "Image, Name, Category, and Price are required" }, 
        { status: 400 }
      );
    }

    // 1. UPLOAD IMAGE TO STORAGE
    const fileExt = file.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `products/${fileName}`; // Organized in 'products' folder

    const { error: storageError } = await supabaseChicken.storage
      .from("images")
      .upload(filePath, file);

    if (storageError) throw storageError;

    // 2. GET THE PUBLIC URL
    const { data: { publicUrl } } = supabaseChicken.storage
      .from("images")
      .getPublicUrl(filePath);

    // 3. SAVE TO DATABASE
    const { data: product, error: dbError } = await supabaseChicken
      .from("products")
      .insert([
        { 
          name: name.trim(),
          category_id: category_id, // UUID from categories table
          price: parseFloat(price),
          description: description?.trim() || "", 
          image_url: publicUrl,
          is_available: true
        }
      ])
      .select()
      .single();

    if (dbError) {
      // Cleanup: If DB fails, delete the image we just uploaded to keep storage clean
      await supabaseChicken.storage.from("images").remove([filePath]);
      throw dbError;
    }

    return NextResponse.json(product);
  } catch (error: any) {
    console.error("Product Upload Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Optional: Add GET handler to fetch products
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("category_id");

    let query = supabaseChicken
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (categoryId && categoryId !== 'all') {
      query = query.eq("category_id", categoryId);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}