import { notFound } from 'next/navigation';
import { getServicePlugin } from '@/service-plugins.server';

// Dynamic nested admin routes: /admin/[id]/[...path]
export default async function AdminNestedPage({ 
  params 
}: { 
  params: Promise<{ id: string; path: string[] }> 
}) {
  const { id, path } = await params;
  const plugin = getServicePlugin(id);
  
  if (!plugin) {
    notFound();
  }

  // For book_summaries, handle nested routes like /new and /[id]
  if (id === 'book_summaries' && path) {
    const route = path.join('/');
    
    // Handle /admin/book_summaries/new
    if (route === 'new') {
      const NewPage = await import('@/packages/services/book_summaries/admin/new/page');
      const Page = NewPage.default;
      return <Page />;
    }
    
    // Handle /admin/book_summaries/[id] (edit page)
    if (path.length === 1) {
      const EditPage = await import('@/packages/services/book_summaries/admin/[id]/page');
      const Page = EditPage.default;
      return <Page params={Promise.resolve({ id: path[0] })} />;
    }
  }

  notFound();
}
