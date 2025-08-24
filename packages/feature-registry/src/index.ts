import type { ComponentType } from 'react';

export type ApiContext = { params: Record<string, string> };
export type ApiRouteHandlers = {
  GET?: (req: Request, ctx?: ApiContext) => Promise<Response>;
  POST?: (req: Request, ctx?: ApiContext) => Promise<Response>;
};

export type NavItem = { id: string; label: string; href: string; icon?: string };
export type Permission = { key: string; description?: string };

export type FeatureManifest = {
  id: string;
  title: string;
  description?: string;
  version?: string;
  page?: ComponentType<any>;
  routes?: Record<string, ApiRouteHandlers>;
  nav?: NavItem[];
  permissions?: Permission[];
  migrations?: { dir: string; schema?: string }[];
  env?: { keys: string[] };
  registerServer?: () => Promise<void> | void;
  registerClient?: () => void;
};

export type FeatureModule = {
  feature: FeatureManifest;
};

export function ensureFeatureEnv(features: FeatureManifest[], env: NodeJS.ProcessEnv = process.env) {
  const missing: { feature: string; keys: string[] }[] = [];
  for (const f of features) {
    const keys = f.env?.keys ?? [];
    const absent = keys.filter((k) => !env[k]);
    if (absent.length) missing.push({ feature: f.id, keys: absent });
  }
  if (missing.length) {
    const lines = missing.map((m) => `- ${m.feature}: ${m.keys.join(', ')}`).join('\n');
    throw new Error(`Missing required env vars for features:\n${lines}`);
  }
}
