import type { FeatureManifest } from '@familying/feature-registry';
import bookSummaries from '@/packages/services/book_summaries/service.plugin';
import mealPlanner from '@/packages/services/meal_planner/service.plugin';
import activities from '@/packages/services/activities/service.plugin';
import conversationStarters from '@/packages/services/conversation_starters/service.plugin';
import bedtimeStoryGenerator from '@/packages/services/bedtime_story_generator/service.plugin';
import soundscapes from '@/packages/services/soundscapes/service.plugin';

export const features: FeatureManifest[] = [
  bookSummaries as any,
  mealPlanner as any,
  activities as any,
  conversationStarters as any,
  bedtimeStoryGenerator as any,
  soundscapes as any,
];
