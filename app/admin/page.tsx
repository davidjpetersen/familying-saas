import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import AdminManager from '@/components/AdminManager';
import Link from 'next/link';
import { createSupabaseClient } from '@/lib/supabase';

const CLERK_API_BASE = "https://api.clerk.com/v1";
const ALLOWED_EMAIL = process.env.ADMIN_EMAIL ?? "david.petersen@familying.org";

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




    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Admin dashboard</h1>
            <p className="text-muted-foreground mt-1">Welcome, you have access to admin-only tools.</p>
          </div>
  
        </div>
      </div>
    );
  } catch (err) {
    console.error("admin error", err);
    redirect("/dashboard");
  }
}
