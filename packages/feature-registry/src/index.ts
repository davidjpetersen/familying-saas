import type { ComponentType } from 'react';

export type ApiRouteHandlers = {
  GET?: (req: Request) => Promise<Response>;
  POST?: (req: Request) => Promise<Response>;
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
