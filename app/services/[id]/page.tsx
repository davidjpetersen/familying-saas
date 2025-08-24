import { notFound } from 'next/navigation';
import { getServicePlugin } from '@/service-plugins.server';

// Server component: resolves feature plugin and renders its page
export default async function ServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const plugin = getServicePlugin(id);
  if (!plugin || !plugin.page) {
    notFound();
  }
  const Page = plugin.page as any;
  return <Page />;
}
