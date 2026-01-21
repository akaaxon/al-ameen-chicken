import { NextResponse } from "next/server";
import { supabaseChicken } from "@/lib/supabase";

// FIX 1: This prevents Vercel from trying to "pre-build" this API route
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    
    // Extract everything from the form
    const file = formData.get("file") as File;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;

    if (!file || !title) {
      return NextResponse.json({ error: "Title and Image are required" }, { status: 400 });
    }

    // 1. UPLOAD IMAGE TO STORAGE
    const fileExt = file.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `categories/${fileName}`;

    const { error: storageError } = await supabaseChicken.storage
      .from("images")
      .upload(filePath, file);

    if (storageError) throw storageError;

    // 2. GET THE PUBLIC URL
    const { data: { publicUrl } } = supabaseChicken.storage
      .from("images")
      .getPublicUrl(filePath);

    // 3. SAVE TO DATABASE (Everything in one go)
    const { data: category, error: dbError } = await supabaseChicken
      .from("categories")
      .insert([
        { 
          title: title.trim(), 
          description: description?.trim() || "", 
          image_url: publicUrl 
        }
      ])
      .select()
      .single();

    if (dbError) {
      // Cleanup: If DB fails, delete the image we just uploaded
      await supabaseChicken.storage.from("images").remove([filePath]);
      throw dbError;
    }

    return NextResponse.json(category);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}