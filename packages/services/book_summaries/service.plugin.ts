import BookSummariesPage from './page';
import { GET as getSummaries, POST as upsertSummary } from './api/book-summaries';
import type { FeatureManifest } from '@familying/feature-registry';

const plugin: FeatureManifest = {
  id: 'book_summaries',
  title: 'Book Summaries',
  description: 'Browse and manage family-friendly book summaries.',
  version: '0.1.0',
  page: BookSummariesPage,
  routes: {
    'book-summaries': { GET: getSummaries, POST: upsertSummary },
  },
  nav: [{ id: 'book_summaries', label: 'Book Summaries', href: '/services/book_summaries' }],
  env: { keys: ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'] },
};

export default plugin;
export const feature = plugin;
