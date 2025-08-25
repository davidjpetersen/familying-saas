import { ensureFeatureEnv, type FeatureManifest } from '../src/index';

describe('Feature Registry', () => {
  describe('ensureFeatureEnv', () => {
    it('should pass when all required environment variables are present', () => {
      const features: FeatureManifest[] = [
        {
          id: 'test-feature',
          title: 'Test Feature',
          env: { keys: ['TEST_VAR_1', 'TEST_VAR_2'] }
        }
      ];

      const env = {
        TEST_VAR_1: 'value1',
        TEST_VAR_2: 'value2'
      };

      expect(() => ensureFeatureEnv(features, env)).not.toThrow();
    });

    it('should throw error when required environment variables are missing', () => {
      const features: FeatureManifest[] = [
        {
          id: 'test-feature',
          title: 'Test Feature',
          env: { keys: ['MISSING_VAR_1', 'MISSING_VAR_2'] }
        }
      ];

      const env = {};

      expect(() => ensureFeatureEnv(features, env)).toThrow(
        'Missing required env vars for features:\n- test-feature: MISSING_VAR_1, MISSING_VAR_2'
      );
    });

    it('should handle multiple features with mixed missing variables', () => {
      const features: FeatureManifest[] = [
        {
          id: 'feature-1',
          title: 'Feature 1',
          env: { keys: ['VAR_1', 'VAR_2'] }
        },
        {
          id: 'feature-2',
          title: 'Feature 2',
          env: { keys: ['VAR_3', 'VAR_4'] }
        }
      ];

      const env = {
        VAR_1: 'value1',
        VAR_3: 'value3'
      };

      expect(() => ensureFeatureEnv(features, env)).toThrow(
        'Missing required env vars for features:\n- feature-1: VAR_2\n- feature-2: VAR_4'
      );
    });

    it('should handle features without env requirements', () => {
      const features: FeatureManifest[] = [
        {
          id: 'no-env-feature',
          title: 'No Env Feature'
        }
      ];

      expect(() => ensureFeatureEnv(features, {})).not.toThrow();
    });

    it('should handle empty features array', () => {
      expect(() => ensureFeatureEnv([], {})).not.toThrow();
    });
  });

  describe('FeatureManifest type validation', () => {
    it('should accept valid feature manifest', () => {
      const validManifest: FeatureManifest = {
        id: 'test-feature',
        title: 'Test Feature',
        description: 'A test feature',
        version: '1.0.0',
        nav: [
          { id: 'nav-1', label: 'Navigation Item', href: '/test' }
        ],
        permissions: [
          { key: 'test.read', description: 'Read test data' }
        ],
        env: { keys: ['TEST_VAR'] },
        migrations: [{ dir: 'migrations/test' }]
      };

      // Type validation - this should compile without errors
      expect(validManifest.id).toBe('test-feature');
      expect(validManifest.title).toBe('Test Feature');
    });

    it('should handle minimal feature manifest', () => {
      const minimalManifest: FeatureManifest = {
        id: 'minimal',
        title: 'Minimal Feature'
      };

      expect(minimalManifest.id).toBe('minimal');
      expect(minimalManifest.title).toBe('Minimal Feature');
    });
  });
});
