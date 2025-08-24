import ActivitiesPage from './page';
import type { FeatureManifest } from '@familying/feature-registry';

const plugin: FeatureManifest = {
  id: 'activities',
  title: 'Activities',
  description: 'Activity ideas and step-by-step guides for family time.',
  version: '0.1.0',
  page: ActivitiesPage,
  nav: [{ id: 'activities', label: 'Activities', href: '/services/activities' }],
};

export default plugin;
export const feature = plugin;
