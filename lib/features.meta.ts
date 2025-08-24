export type FeatureMeta = { id: string; title: string; href: string };

export const featuresMeta: FeatureMeta[] = [
  { id: 'book_summaries', title: 'Book Summaries', href: '/services/book_summaries' },
  { id: 'activities', title: 'Activities', href: '/services/activities' },
  { id: 'conversation_starters', title: 'Conversation Starters', href: '/services/conversation_starters' },
  { id: 'bedtime_story_generator', title: 'Bedtime Story Generator', href: '/services/bedtime_story_generator' },
  { id: 'meal_planner', title: 'Meal Planner', href: '/services/meal_planner' },
  { id: 'soundscapes', title: 'Soundscapes', href: '/services/soundscapes' },
];
