import BookSummariesPage from './page';
import BookSummariesAdminPage from './admin/page';
import { GET as getSummaries, POST as upsertSummary } from './api/book-summaries';
import { GET as getAdminSummaries, POST as createAdminSummary } from './api/admin/book-summaries';
import { GET as getAdminSummary, PUT as updateAdminSummary, DELETE as deleteAdminSummary } from './api/admin/[id]';
import { POST as bulkDeleteAdminSummaries } from './api/admin/bulk-delete';
import { GET as getAdminActivity } from './api/admin/[id]/activity';
import type { FeatureManifest, ApiContext } from '@familying/feature-registry';

// Adapter functions to bridge signature differences
const adaptAdminHandler = (handler: (req: Request, { params }: { params: any }) => Promise<Response>) => {
  return (req: Request, ctx?: ApiContext) => handler(req, { params: ctx?.params });
};

const plugin: FeatureManifest = {
  id: 'book_summaries',
  title: 'Book Summaries',
  description: 'Browse and manage family-friendly book summaries.',
  version: '0.1.0',
  page: BookSummariesPage,
  adminPage: BookSummariesAdminPage,
  routes: {
    'book-summaries': { GET: getSummaries, POST: upsertSummary },
  },
  adminRoutes: {
    'book-summaries': { GET: adaptAdminHandler(getAdminSummaries), POST: adaptAdminHandler(createAdminSummary) },
    'book-summaries/[id]': { GET: adaptAdminHandler(getAdminSummary), PUT: adaptAdminHandler(updateAdminSummary), DELETE: adaptAdminHandler(deleteAdminSummary) },
    'book-summaries/bulk-delete': { POST: adaptAdminHandler(bulkDeleteAdminSummaries) },
    'book-summaries/[id]/activity': { GET: adaptAdminHandler(getAdminActivity) },
  },
  nav: [{ id: 'book_summaries', label: 'Book Summaries', href: '/services/book_summaries' }],
  env: { keys: ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'] },
  migrations: [{ dir: 'packages/services/book_summaries/migrations' }],
};

export default plugin;
export const feature = plugin;
