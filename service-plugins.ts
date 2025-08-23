import type { ComponentType } from 'react';

export interface ApiRouteHandlers {
  GET?: (req: Request) => Promise<Response>;
  POST?: (req: Request) => Promise<Response>;
}

export interface ServicePlugin {
  id: string;
  title: string;
  description: string;
  version: string;
  Page: ComponentType<any>;
  routes?: Record<string, ApiRouteHandlers>;
}

const registry: ServicePlugin[] = [];

export function register(plugin: ServicePlugin) {
  registry.push(plugin);
}

export function getServicePlugin(id: string) {
  return registry.find((p) => p.id === id);
}

// Import plugins here
import mealPlanner from './packages/services/meal_planner/service.plugin';
register(mealPlanner);

export const plugins = registry;
