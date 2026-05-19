// app/api/products/get/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse parameters
    const start = parseInt(searchParams.get('start') || '0', 10);
    const categoryId = searchParams.get('category_id');
    const searchQuery = searchParams.get('search');
    
    // We fetch 8 items at a time based on your frontend logic
    const limit = 8;
    const end = start + limit - 1;

    // Start building the Supabase query
    let query = supabase
      .from('products')
      .select('*')
      .range(start, end);

    // Filter by Category if provided
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    // Apply Search Filter if provided
    // .ilike is case-insensitive. We check both name and description.
    if (searchQuery) {
      query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
    }

    // Execute query
    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('API Error:', error.message);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
