import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            // Prevent feature components from reaching into app/
            { target: './packages/*/src/components', from: './app' },
            // Prevent components from importing service internals directly
            { target: './packages/*/src/components', from: './packages/*/src/service' },
            // Prevent hooks from importing service internals other than public client
            { target: './packages/*/src/hooks', from: './packages/*/src/service' },

          ]
        }
      ]
    }
  },
  // Disallow server-only imports from UI folders
  {
    files: [
      './components/**/*.{ts,tsx}',
      './packages/**/components/**/*.{ts,tsx}',
      './app/**/components/**/*.{ts,tsx}',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            { name: '@clerk/nextjs/server', message: 'UI components must not import server-only APIs.' },
            { name: '@clerk/nextjs/dist/esm/app-router/server', message: 'Do not import Clerk internals; use @clerk/nextjs/server in server code only.' },
            { name: '@/lib/supabase', message: 'Use API routes or lib/supabase.client in the browser.' },
          ]
        }
      ]
    }
  }
];

export default eslintConfig;
