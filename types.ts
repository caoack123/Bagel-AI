export const Authors = {
  MY_VOICE: 'My Voice',
  Hemingway: 'Hemingway',
  Woolf: 'V. Woolf',
  'Márquez': 'G.G. Márquez',
  'Li Dan': '李诞',
} as const;

export type Author = keyof typeof Authors;

export type AppView = 'JOURNAL' | 'WRITE' | 'INSIGHTS' | 'SETTINGS';

export interface JournalEntry {
  id: string;
  timestamp: number;
  title: string;
  originalContent: string;
  author: Author;
  // AI-generated fields are optional
  rewrittenContent?: string;
  summary?: string;
  mood?: string;
  tags?: string[];
  highlights?: string[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}
