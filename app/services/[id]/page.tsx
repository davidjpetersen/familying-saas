import { notFound } from 'next/navigation';
import { getServicePlugin } from '@/service-plugins';

export default async function ServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const plugin = getServicePlugin(id);
  if (!plugin) {
    notFound();
  }
  const Page = plugin.Page as any;
  return <Page />;
}
