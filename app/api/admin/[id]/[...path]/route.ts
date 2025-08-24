import { notFound } from 'next/navigation';
import { getServicePlugin } from '@/service-plugins.server';

// Admin API multiplexer: /api/admin/[id]/[...path]
export async function GET(req: Request, context: any) {
  return handleAdminRequest('GET', req, context);
}

export async function POST(req: Request, context: any) {
  return handleAdminRequest('POST', req, context);
}

export async function PUT(req: Request, context: any) {
  return handleAdminRequest('PUT', req, context);
}

export async function DELETE(req: Request, context: any) {
  return handleAdminRequest('DELETE', req, context);
}

export async function PATCH(req: Request, context: any) {
  return handleAdminRequest('PATCH', req, context);
}

async function handleAdminRequest(method: string, req: Request, context: any) {
  const params = context?.params || {};
  const { id, path = [] } = params;
  
  const plugin = getServicePlugin(id);
  if (!plugin?.adminRoutes) {
    return notFound();
  }

  // Build the route key from path segments
  const routeKey = path.join('/');
  
  // First try exact match
  let handler = plugin.adminRoutes[routeKey]?.[method as keyof typeof plugin.adminRoutes[typeof routeKey]];
  
  // If no exact match, try with wildcard substitution
  if (!handler) {
    for (const [pattern, handlers] of Object.entries(plugin.adminRoutes)) {
      if (pattern.includes('[') && matchesPattern(routeKey, pattern)) {
        handler = handlers[method as keyof typeof handlers];
        break;
      }
    }
  }

  if (!handler) {
    return notFound();
  }

  // Extract params from the route
  const ctxParams = extractParams(routeKey, plugin.adminRoutes);
  const ctx = { params: ctxParams };

  try {
    return await handler(req, ctx);
  } catch (error) {
    console.error('Admin API error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

function matchesPattern(route: string, pattern: string): boolean {
  const routeParts = route.split('/');
  const patternParts = pattern.split('/');
  
  if (routeParts.length !== patternParts.length) {
    return false;
  }
  
  return patternParts.every((part, i) => {
    return part.startsWith('[') && part.endsWith(']') || part === routeParts[i];
  });
}

function extractParams(route: string, adminRoutes: Record<string, any>): Record<string, string> {
  const params: Record<string, string> = {};
  const routeParts = route.split('/');
  
  // Find matching pattern
  for (const pattern of Object.keys(adminRoutes)) {
    if (matchesPattern(route, pattern)) {
      const patternParts = pattern.split('/');
      patternParts.forEach((part, i) => {
        if (part.startsWith('[') && part.endsWith(']')) {
          const paramName = part.slice(1, -1);
          params[paramName] = routeParts[i];
        }
      });
      break;
    }
  }
  
  return params;
}
