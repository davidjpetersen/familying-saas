import BedtimeStoryGeneratorPage from './page';
import { POST as generateStory } from './api/generate-story';
import type { ServicePlugin } from '@/service-plugins';

const plugin: ServicePlugin = {
  id: 'bedtime_story_generator',
  title: 'Bedtime Story Generator',
  description: 'Generate cozy, personalized bedtime stories for your family.',
  version: '0.1.0',
  Page: BedtimeStoryGeneratorPage,
  routes: {
    'generate-story': { POST: generateStory }
  }
};

export default plugin;
