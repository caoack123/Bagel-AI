import React, { useState, useRef, useEffect, useMemo } from 'react';
import { JournalEntry, ChatMessage } from '../types';

interface InsightsViewProps {
  entries: JournalEntry[];
  messages: ChatMessage[];
  isLoading: boolean;
  sendMessage: (input: string) => Promise<void>;
}

const ThinkingIndicator: React.FC = () => (
    <div className="flex items-center space-x-1 p-1">
      <div className="w-2 h-2 bg-secondary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
      <div className="w-2 h-2 bg-secondary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
      <div className="w-2 h-2 bg-secondary rounded-full animate-bounce"></div>
    </div>
);

const ChatBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
  const isModel = message.role === 'model';
  const isEmpty = message.content.trim().length === 0;
  return (
    <div className={`flex ${isModel ? 'justify-start' : 'justify-end'} mb-4 animate-fade-in`}>
      <div 
        className={`max-w-prose p-3 rounded-lg ${isModel ? 'bg-surface text-primary border border-amber-200' : 'bg-accent text-white'}`}
        style={{ whiteSpace: 'pre-wrap' }}
      >
        {isModel && isEmpty ? <ThinkingIndicator /> : message.content}
      </div>
    </div>
  );
};

const JournalStats: React.FC<{ entries: JournalEntry[] }> = ({ entries }) => {
    const stats = useMemo(() => {
        const totalEntries = entries.length;
        const totalWords = entries.reduce((acc, entry) => acc + entry.originalContent.split(/\s+/).length, 0);
        const moodCounts: Record<string, number> = {};
        let maxMoodCount = 0;

        entries.forEach(entry => {
            if (entry.mood) {
                moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
                if (moodCounts[entry.mood] > maxMoodCount) {
                    maxMoodCount = moodCounts[entry.mood];
                }
            }
        });
        const sortedMoods = Object.entries(moodCounts).sort((a, b) => b[1] - a[1]);

        return { totalEntries, totalWords, sortedMoods, maxMoodCount };
    }, [entries]);

    return (
        <div className="mb-6 space-y-4 flex-shrink-0">
             <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface p-4 rounded-lg border border-amber-100 shadow-sm">
                    <h3 className="text-sm font-medium text-secondary">Total Entries</h3>
                    <p className="text-2xl font-bold text-primary">{stats.totalEntries}</p>
                </div>
                <div className="bg-surface p-4 rounded-lg border border-amber-100 shadow-sm">
                    <h3 className="text-sm font-medium text-secondary">Total Words</h3>
                    <p className="text-2xl font-bold text-primary">{stats.totalWords.toLocaleString()}</p>
                </div>
            </div>
            {stats.sortedMoods.length > 0 && (
                 <div className="bg-surface p-4 rounded-lg border border-amber-100 shadow-sm">
                     <h3 className="text-sm font-medium text-secondary mb-3">Mood Distribution</h3>
                     <div className="space-y-2">
                         {stats.sortedMoods.map(([mood, count]) => (
                             <div key={mood} className="flex items-center text-sm">
                                 <div className="w-20 text-primary font-medium truncate">{mood}</div>
                                 <div className="flex-grow bg-amber-100 rounded-full h-4 mx-2">
                                     <div 
                                        className="bg-accent h-4 rounded-full"
                                        style={{ width: `${(count / stats.maxMoodCount) * 100}%`}}
                                     />
                                 </div>
                                 <div className="w-8 text-right font-semibold text-secondary">{count}</div>
                             </div>
                         ))}
                     </div>
                 </div>
            )}
        </div>
    );
};

export const InsightsView: React.FC<InsightsViewProps> = ({ entries, messages, isLoading, sendMessage }) => {
  const [userInput, setUserInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;
    
    await sendMessage(userInput);
    setUserInput('');
  };

  return (
    <div className="p-4 h-full flex flex-col animate-fade-in">
      <header className="mb-4 text-center flex-shrink-0">
        <h1 className="text-2xl font-bold text-primary">Connect the Dots</h1>
        <p className="text-sm text-secondary">Uncover hidden patterns with analytics and AI chat.</p>
      </header>

      {entries.length > 1 && <JournalStats entries={entries} />}
      
      <div className="flex-grow overflow-y-auto mb-4 pr-2 pb-20 md:pb-4">
        {messages.map((msg, index) => (
          <ChatBubble key={index} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="flex-shrink-0 mt-auto pt-4 bg-background/80 backdrop-blur-sm">
        <form onSubmit={handleSendMessage} className="flex items-center">
            <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder={entries.length < 2 ? "Please add more entries first" : "Ask a question..."}
            disabled={isLoading || entries.length < 2}
            className="w-full bg-surface border-amber-300 border rounded-lg p-3 text-primary focus:ring-2 focus:ring-accent focus:border-transparent disabled:opacity-50"
            aria-label="Your message"
            />
            <button
            type="submit"
            disabled={isLoading || !userInput.trim() || entries.length < 2}
            className="ml-2 bg-accent text-white p-3 rounded-lg hover:bg-accent-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
            aria-label="Send message"
            >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
            </svg>
            </button>
        </form>
      </div>
    </div>
  );
};