import { NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ isAdmin: false });

  const supabase = createSupabaseClient();
  const { data, error } = await supabase.from('admins').select('clerk_user_id').eq('clerk_user_id', userId).limit(1).maybeSingle();
  if (error) return NextResponse.json({ isAdmin: false });
  return NextResponse.json({ isAdmin: !!data });
}
