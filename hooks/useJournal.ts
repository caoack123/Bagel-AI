import { useState, useEffect, useCallback } from 'react';
import { JournalEntry } from '../types';
import { appendEntryToSheet } from '../services/googleSheetsService';

const JOURNAL_STORAGE_KEY = 'dotly-journal-entries';

const demoEntries: JournalEntry[] = [
    {
        id: 'demo-1',
        timestamp: new Date('2024-10-28T10:00:00Z').getTime(),
        title: "A Moment of Clarity",
        originalContent: "Today I realized how much I've grown over the past few months. The challenges at work that used to overwhelm me now feel manageable. I think it's because I've started focusing on small, consistent steps rather than the giant leap.",
        author: 'MY_VOICE',
    },
    {
        id: 'demo-2',
        timestamp: new Date('2024-10-27T08:15:00Z').getTime(),
        title: "Morning Coffee",
        originalContent: "The morning was crisp. I walked to the coffee shop. The barista smiled. Small moments matter most.",
        author: 'Hemingway',
        rewrittenContent: "The crisp air of morning. A walk. The coffee shop. A smile from the barista. In these small things, there is value.",
        summary: "A brief reflection on finding value in the small moments of a morning routine.",
        mood: "Peaceful",
        tags: ["morning", "coffee", "mindfulness"],
        highlights: ["Walked to a coffee shop on a crisp morning.", "Received a smile from the barista.", "Reflected on the importance of small moments."]
    },
    {
        id: 'demo-3',
        timestamp: new Date('2024-10-26T19:30:00Z').getTime(),
        title: "Creative Spark",
        originalContent: "Creativity flows like water through the cracks of routine... finding its way into unexpected moments. Today while washing dishes, I had an idea for a story.",
        author: 'Woolf',
        rewrittenContent: "And so, in the midst of the mundane, the water cascading over porcelain, a thought took root—a story, nascent and shimmering, born from the simple, rhythmic act of washing away the day's remnants.",
        summary: "An unexpected story idea emerged during the routine task of washing dishes.",
        mood: "Inspired",
        tags: ["creativity", "writing", "inspiration", "routine"],
        highlights: ["Had a story idea while washing dishes.", "Muse strikes in unexpected, mundane moments."]
    }
];

export const useJournal = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(JOURNAL_STORAGE_KEY);
      if (stored) {
        setEntries(JSON.parse(stored));
      } else {
        setEntries(demoEntries);
      }
    } catch (error) {
      console.error("Failed to load entries from local storage", error);
      setEntries(demoEntries);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveEntries = useCallback((newEntries: JournalEntry[]) => {
    try {
      // Sort entries by timestamp descending before saving
      const sortedEntries = newEntries.sort((a, b) => b.timestamp - a.timestamp);
      localStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(sortedEntries));
      setEntries(sortedEntries);
    } catch (error) {
      console.error("Failed to save entries to local storage", error);
    }
  }, []);

  const addEntry = useCallback((entry: Omit<JournalEntry, 'id' | 'timestamp'>) => {
    const newEntry: JournalEntry = {
      ...entry,
      id: `entry-${Date.now()}`,
      timestamp: Date.now(),
    };
    saveEntries([newEntry, ...entries]);

    // Fire-and-forget call to append to sheet in the background
    appendEntryToSheet(newEntry).catch(error => {
        console.error("Failed to sync entry to Google Sheets:", error);
    });

  }, [entries, saveEntries]);
  
  const updateEntry = useCallback((updatedEntry: JournalEntry) => {
    const entryIndex = entries.findIndex(e => e.id === updatedEntry.id);
    if (entryIndex === -1) {
        console.error("Attempted to update an entry that does not exist.");
        return;
    };
    
    const newEntries = [...entries];
    newEntries[entryIndex] = updatedEntry;
    saveEntries(newEntries);
  }, [entries, saveEntries]);

  const clearJournal = useCallback(() => {
    saveEntries([]);
  }, [saveEntries]);


  return { entries, addEntry, isLoading, clearJournal, updateEntry };
};