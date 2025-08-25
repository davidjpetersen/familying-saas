import { requireAdminPage } from '@/lib/auth/withAdmin';
import AdminBookSummariesView from '@/components/AdminBookSummariesView';

export default async function BookSummariesAdminPage() {
  await requireAdminPage();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Book Summaries</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage book summaries stored in Supabase.</p>
        </div>
      </div>

      <div className="mt-6">
        <AdminBookSummariesView />
      </div>
    </div>
  );
}
