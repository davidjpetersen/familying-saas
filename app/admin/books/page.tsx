import { requireAdminPage } from '@/lib/auth/withAdmin';
import { createSupabaseClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';

export default async function AdminBooksPage() {
  await requireAdminPage();
  
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from('books')
    .select('id, slug, title, authors, cover_uri, source_uri, updated_at, summaries: summaries ( id, is_published, render_version )')
    .order('updated_at', { ascending: false })
    .limit(100);
  if (error) throw new Error(error.message);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Books</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage source books, ingestion and embeddings.</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {(data || []).map((b: any) => {
          const s = Array.isArray(b.summaries) ? b.summaries[0] : b.summaries;
          return (
            <div key={b.id} className="border rounded overflow-hidden">
              <div className="h-40 bg-gray-50 flex items-center justify-center overflow-hidden">
                {b.cover_uri ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={b.cover_uri} alt={b.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-xs text-muted-foreground">No image</div>
                )}
              </div>
              <div className="p-3 space-y-2">
                <div className="font-medium text-sm truncate" title={b.title}>{b.title}</div>
                <div className="text-xs text-muted-foreground truncate">{(b.authors || []).join(', ')}</div>
                <div className="flex gap-2">
                  <form action={`/api/admin/books/${b.id}/ingest`} method="post">
                    <Button variant="outline" size="sm" type="submit">Ingest</Button>
                  </form>
                  <form action={`/api/admin/books/${b.id}/embed`} method="post">
                    <Button variant="outline" size="sm" type="submit">Embed</Button>
                  </form>
                </div>
                <div className="text-xs text-muted-foreground">
                  Summary: {s ? (s.is_published ? `published v${s.render_version}` : 'draft') : '—'}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
