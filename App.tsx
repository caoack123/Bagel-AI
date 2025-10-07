import React, { useState, useCallback, useEffect } from 'react';
import { AppView, JournalEntry, ChatMessage } from './types';
import { useJournal } from './hooks/useJournal';
import { getChatResponseStream } from './services/geminiService';
import { JournalView } from './components/ConstellationView';
import { WriteEntryView } from './components/CreateDotView';
import { InsightsView } from './components/OracleView';
import { SettingsView } from './components/SettingsView';
import { BottomNav, SideNav } from './components/Navbar';

const useChat = (entries: JournalEntry[]) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Initialize chat only once, when entries are first loaded.
    if (messages.length === 0) {
      setMessages([
        {
          role: 'model',
          content: entries.length < 2 
            ? "Hello! I'm here to help you find insights in your journal. Please write at least two entries to begin our conversation."
            : "Hello! I've reviewed your journal. What patterns or themes would you like to explore today?"
        }
      ]);
    }
  }, [entries.length, messages.length]);

  const sendMessage = useCallback(async (userInput: string) => {
    if (!userInput.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: userInput.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const conversationHistory = newMessages.slice(1); // Exclude the initial welcome message
      const stream = await getChatResponseStream(entries, conversationHistory);
      
      setMessages(prev => [...prev, { role: 'model', content: '' }]);
      
      let fullResponse = '';
      for await (const chunk of stream) {
          fullResponse += chunk.text;
          // Update the last message in the array with the streamed content
          setMessages(prev => {
              const updatedMessages = [...prev];
              updatedMessages[updatedMessages.length - 1] = { ...updatedMessages[updatedMessages.length - 1], content: fullResponse };
              return updatedMessages;
          });
      }

    } catch (error: any) {
      const errorMessage: ChatMessage = { role: 'model', content: error.message || "Sorry, an error occurred." };
      // Replace the empty streaming bubble with the error message
      setMessages(prev => {
          const updatedMessages = [...prev];
          updatedMessages[updatedMessages.length - 1] = errorMessage;
          return updatedMessages;
      });
    } finally {
      setIsLoading(false);
    }
  }, [entries, messages, isLoading]);

  return { messages, isLoading, sendMessage };
};


function App() {
  const [currentView, setCurrentView] = useState<AppView>('JOURNAL');
  const { entries, addEntry, isLoading, clearJournal, updateEntry } = useJournal();
  const { messages, isLoading: isChatLoading, sendMessage } = useChat(entries);

  const renderView = () => {
    switch (currentView) {
      case 'JOURNAL':
        return <JournalView entries={entries} isLoading={isLoading} setView={setCurrentView} updateEntry={updateEntry} />;
      case 'WRITE':
        return <WriteEntryView addEntry={addEntry} setView={setCurrentView} />;
      case 'INSIGHTS':
        return <InsightsView entries={entries} messages={messages} isLoading={isChatLoading} sendMessage={sendMessage} />;
      case 'SETTINGS':
        return <SettingsView clearJournal={clearJournal} entries={entries} />;
      default:
        return <JournalView entries={entries} isLoading={isLoading} setView={setCurrentView} updateEntry={updateEntry} />;
    }
  };

  return (
    <div className="h-full font-sans bg-background text-primary md:flex">
      <SideNav currentView={currentView} setView={setCurrentView} />
      <main className="h-full md:flex-1 md:overflow-y-auto">
        <div className="max-w-2xl mx-auto h-full">
            {renderView()}
        </div>
      </main>
      {currentView !== 'WRITE' && (
         <BottomNav currentView={currentView} setView={setCurrentView} />
      )}
    </div>
  );
}

export default App;