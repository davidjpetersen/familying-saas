import SoundscapesPage from './page';
import type { ServicePlugin } from '@/service-plugins';

const plugin: ServicePlugin = {
  id: 'soundscapes',
  title: 'Soundscapes',
  description: 'Gentle sounds to help your family rest, recharge, and refocus.',
  version: '0.1.0',
  Page: SoundscapesPage,
};

export default plugin;
