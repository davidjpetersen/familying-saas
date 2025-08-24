import SoundscapesPage from './page';
import SoundscapesAdminPage from './admin/page';
import type { FeatureManifest } from '@familying/feature-registry';

const plugin: FeatureManifest = {
  id: 'soundscapes',
  title: 'Soundscapes',
  description: 'Gentle sounds to help your family rest, recharge, and refocus.',
  version: '0.1.0',
  page: SoundscapesPage,
  adminPage: SoundscapesAdminPage,
};

export default plugin;
export const feature = plugin;
