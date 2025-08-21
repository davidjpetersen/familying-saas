import { NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = createSupabaseClient();
    // Find the family for the current owner
    const { data: families, error: fErr } = await supabase
      .from('families')
      .select('id')
      .limit(1);

    if (fErr) throw fErr;
    if (!families || families.length === 0) return NextResponse.json([], { status: 200 });

    const familyId = families[0].id;

    const { data, error } = await supabase
      .from('family_members')
      .select('*')
      .eq('family_id', familyId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (err: any) {
    return new NextResponse(err?.message ?? 'Error', { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { display_name, type, birthdate } = body;
    if (!display_name) return new NextResponse('display_name required', { status: 400 });

    const supabase = createSupabaseClient();

    // Find or create a family for the current user (owner)
    const { data: families, error: fErr } = await supabase
      .from('families')
      .select('id')
      .limit(1);

    if (fErr) throw fErr;

    let familyId: string | null = null;
    if (!families || families.length === 0) {
      const { data: created, error: cErr } = await supabase.from('families').insert({ name: 'My Family' }).select('id').single();
      if (cErr) throw cErr;
      familyId = created.id;
    } else {
      familyId = families[0].id;
    }

    const { data, error } = await supabase.from('family_members').insert({
      family_id: familyId,
      display_name,
      type: type || 'adult',
      birthdate: birthdate || null,
    }).select('*').single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    return new NextResponse(err?.message ?? 'Error', { status: 500 });
  }
}
