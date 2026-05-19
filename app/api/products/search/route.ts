import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseChicken } from "@/lib/supabase";

c

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get('q');

    if (!searchQuery) {
      return NextResponse.json([]);
    }

    // Search both name and description, case-insensitive
    const { data, error } = await supabaseChicken
      .from('products')
      .select('*')
      .or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
      .limit(20); // Limit to 20 results to keep search fast and UI clean

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Search API Error:', error.message);
    return NextResponse.json({ error: 'Failed to search products' }, { status: 500 });
  }
}
