import React, { useState, useEffect, useMemo } from 'react';
import { AppView, Author, Authors, JournalEntry } from '../types';
import { generateStructuredEntry } from '../services/geminiService';
import { LoadingSpinner } from './LoadingSpinner';

interface WriteEntryViewProps {
  addEntry: (entry: Omit<JournalEntry, 'id' | 'timestamp'>) => void;
  setView: (view: AppView) => void;
}

export const WriteEntryView: React.FC<WriteEntryViewProps> = ({ addEntry, setView }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState<Author>('MY_VOICE');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [thinkingMessage, setThinkingMessage] = useState('');

  const thinkingSteps = useMemo(() => [
    'Analyzing your thoughts...',
    `Adopting the voice of ${Authors[author]}...`,
    'Crafting a new perspective...',
    'Distilling the key highlights...',
    'Putting on the finishing touches...',
  ], [author]);

  useEffect(() => {
    let intervalId: number | undefined;

    if (isLoading) {
        let step = 0;
        const updateMessage = () => {
            setThinkingMessage(thinkingSteps[step]);
            step = (step + 1) % thinkingSteps.length;
        };
        updateMessage(); // Set initial message immediately
        intervalId = window.setInterval(updateMessage, 2000);
    } else {
      setThinkingMessage('');
    }

    return () => {
        if (intervalId) {
            window.clearInterval(intervalId);
        }
    };
}, [isLoading, thinkingSteps]);

  const handleSave = () => {
    if (!content.trim()) {
      setError("Your thoughts cannot be empty.");
      return;
    }
    const finalTitle = title.trim() || `Entry - ${new Date().toLocaleDateString()}`;
    addEntry({
        title: finalTitle,
        originalContent: content.trim(),
        author: 'MY_VOICE'
    });
    setView('JOURNAL');
  };

  const handleEnhance = async () => {
    if (!content.trim()) {
       setError("Your thoughts cannot be empty.");
       return;
    }
    if (author === 'MY_VOICE') {
       setError("Please select an author style to enhance with AI.");
       return;
    }

    setIsLoading(true);
    setError(null);
    try {
        const aiData = await generateStructuredEntry(title.trim(), content, author);
        addEntry({
            originalContent: content.trim(),
            author,
            ...aiData,
        });
        setView('JOURNAL');
    } catch (e: any) {
        setError(e.message || "An unexpected error occurred.");
    } finally {
        setIsLoading(false);
    }
  };

  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="p-4 h-full flex flex-col animate-fade-in">
      <header className="flex items-center mb-6">
        <button onClick={() => setView('JOURNAL')} className="p-2 mr-2 rounded-full hover:bg-amber-100">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h1 className="text-xl font-bold text-primary">New Entry</h1>
      </header>

      <div className="text-center mb-6">
        <h2 className="text-2xl font-serif font-medium text-primary">Today's Canvas</h2>
        <p className="text-sm text-secondary">{dateString}</p>
      </div>

      <div className="flex-grow overflow-y-auto pr-2">
        <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-secondary mb-2">Title (Optional)</label>
            <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Let AI create a title for you..."
                className="w-full bg-surface border-amber-300 border rounded-md p-2 text-primary focus:ring-2 focus:ring-accent focus:border-transparent"
            />
        </div>

        <div className="mb-4">
            <label htmlFor="writing-style" className="block text-sm font-medium text-secondary mb-2">Writing Style</label>
            <select
                id="writing-style"
                value={author}
                onChange={(e) => setAuthor(e.target.value as Author)}
                className="w-full bg-surface border-amber-300 border rounded-md p-2 text-primary focus:ring-2 focus:ring-accent focus:border-transparent"
            >
                {Object.entries(Authors).map(([key, value]) => (
                    <option key={key} value={key}>{value}</option>
                ))}
            </select>
        </div>

        <div className="mb-4">
            <label htmlFor="thoughts" className="block text-sm font-medium text-secondary mb-2">Your Thoughts</label>
            <textarea
                id="thoughts"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's on your mind today? Write freely..."
                className="w-full h-40 bg-surface border-amber-300 border rounded-md p-2 text-primary focus:ring-2 focus:ring-accent focus:border-transparent"
            />
        </div>
      </div>
      
      {error && <div className="my-2 p-3 text-sm bg-red-900 text-red-100 rounded-md">{error}</div>}

      <footer className="mt-auto pt-4 border-t border-amber-200">
        {isLoading ? (
            <div className="text-center p-4 h-[96px] flex flex-col justify-center">
                <LoadingSpinner className="w-6 h-6 mx-auto mb-3 text-accent" />
                <p className="text-secondary animate-fade-in transition-all duration-300">{thinkingMessage || '...'}</p>
            </div>
        ) : (
            <>
                <button
                    onClick={handleEnhance}
                    disabled={isLoading || author === 'MY_VOICE'}
                    className="w-full mb-2 bg-accent text-white font-bold py-3 px-4 rounded-lg hover:bg-accent-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                    Enhance with AI
                </button>
                <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="w-full bg-primary text-background font-bold py-3 px-4 rounded-lg hover:opacity-90 disabled:opacity-50 transition-colors"
                >
                    Save Entry
                </button>
            </>
        )}
      </footer>
    </div>
  );
};