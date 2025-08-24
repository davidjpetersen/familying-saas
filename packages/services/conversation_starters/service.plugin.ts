import ConversationStartersPage from './page';
import { GET as getCards } from './api/cards';
import { GET as getDecks } from './api/decks';
import { POST as logInteraction } from './api/interaction';
import { POST as recommendCards } from './api/recommend';
import type { FeatureManifest } from '@familying/feature-registry';

const plugin: FeatureManifest = {
  id: 'conversation_starters',
  title: 'Conversation Starters',
  description: 'Prompts and questions to spark meaningful family conversations.',
  version: '0.1.0',
  page: ConversationStartersPage,
  routes: {
    cards: { GET: getCards },
    decks: { GET: getDecks },
    interaction: { POST: logInteraction },
    recommend: { POST: recommendCards }
  },
  nav: [{ id: 'conversation_starters', label: 'Conversation Starters', href: '/services/conversation_starters' }],
};

export default plugin;
export const feature = plugin;
