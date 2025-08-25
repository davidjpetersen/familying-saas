import { requireAdminPage } from '@/lib/auth/withAdmin';
import { createSupabaseClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';

async function togglePublish(id: string, is_published: boolean) {
  'use server'
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/admin/summaries/${id}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ is_published }),
  });
  if (!res.ok) throw new Error('Failed to update publish');
}

async function triggerRender(id: string) {
  'use server'
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/admin/summaries/${id}/render`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to enqueue render');
}

export default async function AdminSummariesPage() {
  await requireAdminPage();
  
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from('summaries')
    .select('id, is_published, render_version, title, tags, updated_at, books:book_id ( slug, title, authors, cover_uri )')
    .order('updated_at', { ascending: false })
    .limit(100);
  if (error) throw new Error(error.message);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Summaries</h1>
          <p className="text-sm text-muted-foreground mt-1">Publish, update and render payloads/PDFs.</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {(data || []).map((s: any) => (
          <div key={s.id} className="border rounded overflow-hidden">
            <div className="h-40 bg-gray-50 flex items-center justify-center overflow-hidden">
              {s.books?.cover_uri ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={s.books.cover_uri} alt={s.books?.title || s.id} className="w-full h-full object-cover" />
              ) : (
                <div className="text-xs text-muted-foreground">No image</div>
              )}
            </div>
            <div className="p-3 space-y-2">
              <div className="font-medium text-sm truncate" title={s.books?.title || s.title}>{s.books?.title || s.title || s.id}</div>
              <div className="text-xs text-muted-foreground truncate">{(s.books?.authors || []).join(', ')}</div>
              <div className="flex gap-2">
                <form action={togglePublish.bind(null, s.id, !s.is_published)}>
                  <Button variant="outline" size="sm" type="submit">{s.is_published ? 'Unpublish' : 'Publish'}</Button>
                </form>
                <form action={triggerRender.bind(null, s.id)}>
                  <Button variant="outline" size="sm" type="submit">Render</Button>
                </form>
              </div>
              <div className="text-xs text-muted-foreground">{s.is_published ? `published v${s.render_version}` : 'draft'}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
