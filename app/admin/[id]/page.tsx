import { notFound } from 'next/navigation';
import { getServicePlugin } from '@/service-plugins.server';

// Server component: resolves feature plugin admin page dynamically
export default async function AdminFeaturePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const plugin = getServicePlugin(id);
  if (!plugin || !plugin.adminPage) {
    notFound();
  }
  const Page = plugin.adminPage as any;
  return <Page />;
}
