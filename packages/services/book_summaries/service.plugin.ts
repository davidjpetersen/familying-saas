import BookSummariesPage from './page';
import { GET as getSummaries, POST as upsertSummary } from './api/book-summaries';
import type { ServicePlugin } from '@/service-plugins';

const plugin: ServicePlugin = {
  id: 'book_summaries',
  title: 'Book Summaries',
  description: 'Browse and manage family-friendly book summaries.',
  version: '0.1.0',
  Page: BookSummariesPage,
  routes: {
    'book-summaries': { GET: getSummaries, POST: upsertSummary }
  }
};

export default plugin;
