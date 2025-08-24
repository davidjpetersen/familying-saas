import BedtimeStoryGeneratorPage from './page';
import BedtimeStoryGeneratorAdminPage from './admin/page';
import { POST as generateStory } from './api/generate-story';
import type { FeatureManifest } from '@familying/feature-registry';

const plugin: FeatureManifest = {
  id: 'bedtime_story_generator',
  title: 'Bedtime Story Generator',
  description: 'Generate cozy, personalized bedtime stories for your family.',
  version: '0.1.0',
  page: BedtimeStoryGeneratorPage,
  adminPage: BedtimeStoryGeneratorAdminPage,
  routes: {
    'generate-story': { POST: generateStory }
  },
  nav: [{ id: 'bedtime_story_generator', label: 'Bedtime Story Generator', href: '/services/bedtime_story_generator' }],
};

export default plugin;
export const feature = plugin;
