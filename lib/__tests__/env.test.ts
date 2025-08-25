/**
 * Environment Validation Tests
 * 
 * Tests for the environment validation system that ensures
 * all required environment variables are present at startup.
 */

import { validateEnv } from '@/lib/env';

describe('Environment Validation', () => {
  describe('validateEnv', () => {
    it('should pass with all required environment variables', () => {
      const validEnv = {
        NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
      };

      expect(() => validateEnv(validEnv)).not.toThrow();
      
      const result = validateEnv(validEnv);
      expect(result.NEXT_PUBLIC_SUPABASE_URL).toBe('https://test.supabase.co');
      expect(result.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBe('test-anon-key');
    });

    it('should throw error for missing SUPABASE_URL', () => {
      const invalidEnv = {
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
      };

      expect(() => validateEnv(invalidEnv)).toThrow(
        'Invalid environment variables. Fix and retry.'
      );
    });

    it('should throw error for missing SUPABASE_ANON_KEY', () => {
      const invalidEnv = {
        NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
      };

      expect(() => validateEnv(invalidEnv)).toThrow(
        'Invalid environment variables. Fix and retry.'
      );
    });

    it('should throw error for invalid URL format', () => {
      const invalidEnv = {
        NEXT_PUBLIC_SUPABASE_URL: 'not-a-valid-url',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
      };

      expect(() => validateEnv(invalidEnv)).toThrow(
        'Invalid environment variables. Fix and retry.'
      );
    });

    it('should handle optional DATABASE_URL correctly', () => {
      const envWithOptional = {
        NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
        DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
      };

      expect(() => validateEnv(envWithOptional)).not.toThrow();
      
      const result = validateEnv(envWithOptional);
      expect(result.DATABASE_URL).toBe('postgresql://user:pass@localhost:5432/db');
    });

    it('should work without optional DATABASE_URL', () => {
      const envWithoutOptional = {
        NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
      };

      expect(() => validateEnv(envWithoutOptional)).not.toThrow();
      
      const result = validateEnv(envWithoutOptional);
      expect(result.DATABASE_URL).toBeUndefined();
    });

    it('should provide detailed error information', () => {
      const emptyEnv = {};

      try {
        validateEnv(emptyEnv);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain('Invalid environment variables. Fix and retry.');
        // The error should mention the missing required fields
        expect((error as Error).message).toContain('NEXT_PUBLIC_SUPABASE_URL');
        expect((error as Error).message).toContain('NEXT_PUBLIC_SUPABASE_ANON_KEY');
      }
    });
  });

  describe('Type Safety', () => {
    it('should return properly typed environment object', () => {
      const validEnv = {
        NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
      };

      const result = validateEnv(validEnv);
      
      // TypeScript should ensure these properties exist
      expect(typeof result.NEXT_PUBLIC_SUPABASE_URL).toBe('string');
      expect(typeof result.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBe('string');
      
      // DATABASE_URL should be optional
      if (result.DATABASE_URL) {
        expect(typeof result.DATABASE_URL).toBe('string');
      }
    });
  });
});
