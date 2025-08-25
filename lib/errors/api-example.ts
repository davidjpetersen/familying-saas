// Example: How to refactor an API route to use the new error handling
// This shows the pattern for updating existing routes

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';
import { 
  withErrorHandling, 
  throwError,
  ValidationError,
  AuthenticationError 
} from '@/lib/errors/api';

// Refactored family-members GET endpoint with proper error handling
export const GET = withErrorHandling(async (request: NextRequest) => {
  // Authenticate user
  const { userId } = await auth();
  if (!userId) {
    throwError.authentication();
  }

  const supabase = createSupabaseClient();
  
  // Find the family for the current owner
  const { data: families, error: fErr } = await supabase
    .from('families')
    .select('id')
    .limit(1);

  if (fErr) {
    console.error('Database error fetching families:', fErr);
    throwError.internal('Failed to fetch family information');
  }

  if (!families || families.length === 0) {
    return NextResponse.json([], { status: 200 });
  }

  const familyId = families[0].id;

  const { data, error } = await supabase
    .from('family_members')
    .select('*')
    .eq('family_id', familyId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Database error fetching family members:', error);
    throwError.internal('Failed to fetch family members');
  }

  return NextResponse.json(data || []);
});

// Refactored family-members POST endpoint with proper error handling
export const POST = withErrorHandling(async (request: NextRequest) => {
  // Authenticate user
  const { userId } = await auth();
  if (!userId) {
    throwError.authentication();
  }

  let body;
  try {
    body = await request.json();
  } catch (error) {
    throwError.validation('Invalid JSON payload');
  }

  const { display_name, type, birthdate } = body;
  
  // Validate required fields
  if (!display_name) {
    throwError.validation('display_name is required');
  }

  if (type && !['adult', 'child'].includes(type)) {
    throwError.validation('type must be either "adult" or "child"');
  }

  const supabase = createSupabaseClient();

  // Find the family for the current owner
  const { data: families, error: fErr } = await supabase
    .from('families')
    .select('id')
    .limit(1);

  if (fErr) {
    console.error('Database error fetching families:', fErr);
    throwError.internal('Failed to fetch family information');
  }

  if (!families || families.length === 0) {
    throwError.notFound('No family found for user');
  }

  const familyId = families[0].id;

  // Insert new family member
  const { data, error } = await supabase
    .from('family_members')
    .insert({
      family_id: familyId,
      display_name,
      type: type || 'child',
      birthdate
    })
    .select()
    .single();

  if (error) {
    console.error('Database error creating family member:', error);
    
    // Handle specific database errors
    if (error.code === '23505') { // Unique constraint violation
      throwError.conflict('A family member with this name already exists');
    }
    
    throwError.internal('Failed to create family member');
  }

  return NextResponse.json(data, { status: 201 });
});

/*
MIGRATION GUIDE for existing API routes:

1. Import the error handling utilities:
   import { withErrorHandling, throwError } from '@/lib/errors/api';

2. Wrap your route handlers:
   export const GET = withErrorHandling(async (request: NextRequest) => {
     // your existing logic
   });

3. Replace error handling:
   - Replace: if (!userId) return new NextResponse('Unauthorized', { status: 401 });
   - With: if (!userId) throwError.authentication();
   
   - Replace: if (!data) return new NextResponse('Not found', { status: 404 });
   - With: if (!data) throwError.notFound();
   
   - Replace: return new NextResponse('Validation error', { status: 400 });
   - With: throwError.validation('Specific validation message');

4. Remove try/catch blocks (withErrorHandling handles this)

5. Log errors before throwing:
   if (error) {
     console.error('Database error:', error);
     throwError.internal('User-friendly message');
   }
*/
