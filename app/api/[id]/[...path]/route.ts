import { getServicePlugin } from '@/service-plugins.server';

function resolveHandler(method: 'GET' | 'POST', id: string, path: string[]) {
  const plugin = getServicePlugin(id);
  if (!plugin) return undefined;
  const key = path.join('/');
  let handler = plugin.routes?.[key];
  // Fallback: support simple one-level dynamic segment declared as "segment/[id]" or "segment/:id"
  if (!handler && path.length >= 2) {
    const wildcardKeyA = `${path[0]}/[id]`;
    const wildcardKeyB = `${path[0]}/:id`;
    handler = plugin.routes?.[wildcardKeyA] || plugin.routes?.[wildcardKeyB];
  }
  return handler ? handler[method] : undefined;
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string; path: string[] }> }) {
  const { id, path = [] } = await params;
  const fn = resolveHandler('GET', id, path);
  if (!fn) return new Response('Not found', { status: 404 });
  const ctxParams: Record<string, string> = {};
  if (path.length >= 2) {
    // If matching wildcard like segment/[id], set { id: path[1] }
    ctxParams.id = path[1];
  }
  return fn(req, { params: ctxParams });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string; path: string[] }> }) {
  const { id, path = [] } = await params;
  const fn = resolveHandler('POST', id, path);
  if (!fn) return new Response('Not found', { status: 404 });
  const ctxParams: Record<string, string> = {};
  if (path.length >= 2) {
    ctxParams.id = path[1];
  }
  return fn(req, { params: ctxParams });
}
