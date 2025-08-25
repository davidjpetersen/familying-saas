// lib/repositories/AdminRepository.ts
import { createSupabaseClient } from '@/lib/supabase';

export class AdminRepository {
  static async isAdmin(clerkUserId: string): Promise<boolean> {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from('admins')
      .select('clerk_user_id')
      .eq('clerk_user_id', clerkUserId)
      .limit(1)
      .maybeSingle();

    if (error) {
      // Don't leak details; let upstream handler decide
      throw new Error('Admin lookup failed');
    }
    return !!data;
  }
}