import ActivitiesPage from './page';
import type { ServicePlugin } from '@/service-plugins';

const plugin: ServicePlugin = {
  id: 'activities',
  title: 'Activities',
  description: 'Activity ideas and step-by-step guides for family time.',
  version: '0.1.0',
  Page: ActivitiesPage,
};

export default plugin;
