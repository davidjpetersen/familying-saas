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
import activities from './packages/services/activities/service.plugin';
import bedtimeStoryGenerator from './packages/services/bedtime_story_generator/service.plugin';
import bookSummaries from './packages/services/book_summaries/service.plugin';
import conversationStarters from './packages/services/conversation_starters/service.plugin';
import soundscapes from './packages/services/soundscapes/service.plugin';

register(mealPlanner);
register(activities);
register(bedtimeStoryGenerator);
register(bookSummaries);
register(conversationStarters);
register(soundscapes);

export const plugins = registry;
