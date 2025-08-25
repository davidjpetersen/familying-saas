// lib/auth/withAdmin.ts
import { auth, currentUser } from '@clerk/nextjs/server';
import { AdminRepository } from '@/lib/repositories/AdminRepository';
import { ApiError, jsonError } from '@/lib/errors/ApiError';
import { unstable_cache, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';

const getAdminCached = unstable_cache(
  async (userId: string) => AdminRepository.isAdmin(userId),
  ['admin-status'],
  { revalidate: 300 /* 5m */ }
);

/**
 * Wrap an API route (app router route handler) with admin auth.
 * Usage:
 *   export const POST = withAdminApi(async ({ userId, req, params }) => { ... })
 */
export function withAdminApi<T extends (args: { userId: string; req: Request; params: any }) => Promise<Response>>(
  handler: T
) {
  return async (req: Request, { params }: { params: any }) => {
    try {
      const { userId } = await auth();
      if (!userId) throw new ApiError(401, 'Authentication required', 'AUTH_REQUIRED');

      const isAdmin = await getAdminCached(userId);
      if (!isAdmin) throw new ApiError(403, 'Admin access required', 'ADMIN_REQUIRED');

      return await handler({ userId, req, params });
    } catch (e) {
      return jsonError(e);
    }
  };
}

/**
 * Guard a server component/page. Redirects if not admin.
 * Usage inside an app page:
 *   export default async function Page() {
 *     const { user } = await requireAdminPage();
 *     return <AdminUI />
 *   }
 */
export async function requireAdminPage() {
  const u = await currentUser();
  if (!u) redirect('/sign-in');

  const isAdmin = await getAdminCached(u.id);
  if (!isAdmin) redirect('/dashboard');

  return { user: u };
}

// Optional helper if you ever need to drop cache after promoting/demoting admins
export async function revalidateAdminFor(userId: string) {
  // Tag-scoped invalidation pattern (requires tagging per-user; shown here as global)
  revalidateTag('admin-status');
}
