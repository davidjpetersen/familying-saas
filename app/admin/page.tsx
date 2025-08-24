import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createSupabaseClient } from '@/lib/supabase';
import Link from 'next/link';
import { plugins } from '@/service-plugins.server';

export default async function AdminPage() {
  const { userId } = await auth();
  if (!userId) {
    // Not signed in — send to home (or sign-in)
    redirect("/");
  }

  // Verify the requesting user is present in the `admins` table.
  const supabase = createSupabaseClient();
  const { data: rows, error } = await supabase.from('admins').select('*').eq('clerk_user_id', userId).limit(1).maybeSingle();
  if (error) {
    console.error('admin: supabase lookup failed', error.message);
    redirect('/dashboard');
  }
  if (!rows) {
    // Not an admin
    redirect('/dashboard');
  }

  try {
    const items = plugins.filter((p) => !!p.adminPage).map((p) => ({ id: p.id, title: p.title }));

    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Admin dashboard</h1>
            <p className="text-muted-foreground mt-1">Welcome, you have access to admin-only tools.</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((it) => (
            <Link key={it.id} href={`/admin/${it.id}`} className="p-4 border rounded hover:bg-accent/40">
              <div className="font-medium">{it.title}</div>
              <div className="text-sm text-muted-foreground mt-1">Manage {it.title}</div>
            </Link>
          ))}
        </div>
      </div>
    );
  } catch (err) {
    console.error("admin error", err);
    redirect("/dashboard");
  }
}
