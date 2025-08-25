import { NextResponse } from 'next/server';
import { AdminRepository } from '@/lib/repositories/AdminRepository';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ isAdmin: false });

  try {
    const isAdmin = await AdminRepository.isAdmin(userId);
    return NextResponse.json({ isAdmin });
  } catch (error) {
    return NextResponse.json({ isAdmin: false });
  }
}
