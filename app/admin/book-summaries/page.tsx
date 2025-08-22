import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createSupabaseClient } from '@/lib/supabase';
import BookSummariesManager from '../../../components/BookSummariesManager'

export default async function Page() {
  const { userId } = await auth();
  if (!userId) redirect('/');

  const supabase = createSupabaseClient();
  const { data: rows, error } = await supabase.from('admins').select('*').eq('clerk_user_id', userId).limit(1).maybeSingle();
  if (error || !rows) redirect('/dashboard');

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Book Summaries</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage book summaries stored in Supabase.</p>
        </div>
      </div>

      <div className="mt-6">
        <BookSummariesManager />
      </div>
    </div>
  );
}
