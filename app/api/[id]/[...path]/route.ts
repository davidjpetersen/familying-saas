import { getServicePlugin } from '@/service-plugins';

function resolveHandler(method: 'GET' | 'POST', id: string, path: string[]) {
  const plugin = getServicePlugin(id);
  if (!plugin) return undefined;
  const key = path.join('/');
  const handler = plugin.routes?.[key];
  return handler ? handler[method] : undefined;
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string; path: string[] }> }) {
  const { id, path = [] } = await params;
  const fn = resolveHandler('GET', id, path);
  if (!fn) return new Response('Not found', { status: 404 });
  return fn(req);
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string; path: string[] }> }) {
  const { id, path = [] } = await params;
  const fn = resolveHandler('POST', id, path);
  if (!fn) return new Response('Not found', { status: 404 });
  return fn(req);
}
