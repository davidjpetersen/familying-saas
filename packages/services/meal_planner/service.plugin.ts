import MealPlannerPage from './page';
import { GET as getPlan } from './api/plan';
import { POST as generatePlan } from './api/plan/generate';
import { GET as getShoppingList } from './api/shopping-list';
import type { FeatureManifest } from '@familying/feature-registry';

const plugin: FeatureManifest = {
  id: 'meal_planner',
  title: 'Meal Planner',
  description: 'Create weekly meal plans and shopping lists tailored to your family.',
  version: '0.1.0',
  page: MealPlannerPage,
  routes: {
    'plan': { GET: getPlan },
    'plan/generate': { POST: generatePlan },
    'shopping-list': { GET: getShoppingList }
  },
  nav: [{ id: 'meal_planner', label: 'Meal Planner', href: '/services/meal_planner' }],
  env: { keys: ['NEXT_PUBLIC_SUPABASE_URL'] },
};

export default plugin;
export const feature = plugin;
