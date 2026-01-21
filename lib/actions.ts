"use server";

import { supabaseChicken } from "./supabase";
import { revalidatePath } from "next/cache";

// --- CATEGORY ACTIONS ---

export async function fetchCategories() {
  // Production version: Fetches categories AND counts how many products are in each
  const { data, error } = await supabaseChicken
    .from("categories")
    .select(`
      id, 
      title, 
      products (id)
    `)
    .order("title");
  
  if (error) {
    console.error("Fetch Error:", error);
    return [];
  }
  return data;
}

export async function addCategory(title: string, description: string, image_url: string) {
  const { data, error } = await supabaseChicken
    .from("categories")
    .insert([{ title: title.trim(), description: description.trim(), image_url }]);
  
  revalidatePath("/dashboard/categories");
  return { data, error };
}

export async function deleteCategory(id: string) {
  const { error } = await supabaseChicken
    .from("categories")
    .delete()
    .eq("id", id);
  
  if (error) throw error;
  
  revalidatePath("/dashboard/categories");
  revalidatePath("/dashboard/products");
  return { success: true };
}

// --- PRODUCT ACTIONS ---

export async function uploadProductImage(file: File) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`; // Use UUID for better unique naming
  const filePath = `products/${fileName}`;

  const { error } = await supabaseChicken.storage
    .from('images') 
    .upload(filePath, file);

  if (error) throw error;

  const { data: { publicUrl } } = supabaseChicken.storage
    .from('images')
    .getPublicUrl(filePath);

  return publicUrl;
}

export async function addProduct(productData: { 
  name: string, 
  price: number, 
  category_id: string, 
  description: string, 
  image_url: string 
}) {
  const { data, error } = await supabaseChicken
    .from("products")
    .insert([productData]);
  
  revalidatePath("/dashboard/products");
  revalidatePath("/"); // Update the main shop page
  return { data, error };
}