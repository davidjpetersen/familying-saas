import { NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';

const CLERK_API_BASE = 'https://api.clerk.com/v1';

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

    // identify owner via Clerk session
    let ownerClerkId: string | null = null;
  try {
      const session = await auth();
      ownerClerkId = (session as any)?.userId ?? null;
  } catch {
      ownerClerkId = null;
    }

    // Find or create a family for the current user (owner)
    const { data: families, error: fErr } = await supabase
      .from('families')
      .select('id')
      .limit(1);

    if (fErr) throw fErr;

    let familyId: string | null = null;
    if (!families || families.length === 0) {
      const { data: created, error: cErr } = await supabase.from('families').insert({ name: 'My Family' }).select('id, clerk_org_id').single();
      if (cErr) throw cErr;
      familyId = created.id;
      // clerk_org_id may be null initially
    } else {
      familyId = families[0].id;
    }

    // If we have a Clerk owner and no clerk_org_id, try to create a Clerk Organization and persist it
    let clerkOrgId: string | null = null;
  try {
      const { data: famRow } = await supabase.from('families').select('clerk_org_id').eq('id', familyId).single();
      clerkOrgId = famRow?.clerk_org_id ?? null;
  } catch {
      clerkOrgId = null;
    }

    if (!clerkOrgId && ownerClerkId && process.env.CLERK_API_KEY) {
      try {
        const createOrgRes = await fetch(`${CLERK_API_BASE}/organizations`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.CLERK_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ name: 'My Family' })
        });
        if (createOrgRes.ok) {
          const org = await createOrgRes.json();
          clerkOrgId = org.id;
          await supabase.from('families').update({ clerk_org_id: clerkOrgId }).eq('id', familyId);
        } else {
          console.log('[family-members] createOrg failed', await createOrgRes.text());
        }
      } catch (err) {
        console.log('[family-members] createOrg error', String(err));
      }
    }

    // If an email is provided, use Clerk organization invitations to invite the user
    const { email } = body as any;
    let inserted: any = null;
    if (email && clerkOrgId && process.env.CLERK_API_KEY) {
      try {
        const inviteRes = await fetch(`${CLERK_API_BASE}/organizations/${clerkOrgId}/invitations`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.CLERK_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email })
        });
        const inviteJson = await inviteRes.json();
        // Save invite metadata in tags for the family member row
        const tags = { clerk_invitation_id: inviteJson?.id ?? null, invited_email: email };
        const { data, error } = await supabase.from('family_members').insert({
          family_id: familyId,
          display_name,
          type: type || 'adult',
          birthdate: birthdate || null,
          tags: tags,
        }).select('*').single();
        if (error) throw error;
        inserted = data;
      } catch (err: any) {
        console.log('[family-members] clerk invite error', String(err));
        // fallback to local insert
      }
    }

    if (!inserted) {
      const { data, error } = await supabase.from('family_members').insert({
        family_id: familyId,
        display_name,
        type: type || 'adult',
        birthdate: birthdate || null,
      }).select('*').single();
      if (error) throw error;
      inserted = data;
    }
    return NextResponse.json(inserted, { status: 201 });
  } catch (err: any) {
    return new NextResponse(err?.message ?? 'Error', { status: 500 });
  }
}
