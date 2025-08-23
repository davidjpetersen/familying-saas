import MealPlannerPage from './page';
import { GET as getPlan } from './api/plan';
import { POST as generatePlan } from './api/plan/generate';
import { GET as getShoppingList } from './api/shopping-list';
import type { ServicePlugin } from '@/service-plugins';

const plugin: ServicePlugin = {
  id: 'meal_planner',
  title: 'Meal Planner',
  description: 'Create weekly meal plans and shopping lists tailored to your family.',
  version: '0.1.0',
  Page: MealPlannerPage,
  routes: {
    'plan': { GET: getPlan },
    'plan/generate': { POST: generatePlan },
    'shopping-list': { GET: getShoppingList }
  }
};

export default plugin;
