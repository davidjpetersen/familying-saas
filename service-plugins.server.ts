import 'server-only';
import type { FeatureManifest } from '@familying/feature-registry';

const registry: FeatureManifest[] = [];

export function register(plugin: FeatureManifest) {
  registry.push(plugin);
}

export function getServicePlugin(id: string) {
  return registry.find((p) => p.id === id);
}

// Import plugins here (safe on server)
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
