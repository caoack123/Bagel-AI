import React, { useState } from 'react';
import { AppView, JournalEntry } from '../types';
import { DotCard } from './DotCard';
import { LoadingSpinner } from './LoadingSpinner';
import { EditModal } from './EditModal';
import { Authors } from '../types';


interface JournalViewProps {
  entries: JournalEntry[];
  isLoading: boolean;
  setView: (view: AppView) => void;
  updateEntry: (entry: JournalEntry) => void;
}

const EmptyStateIllustration = () => (
    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-secondary opacity-50">
        <path d="M16.6214 4.88122C16.953 4.73911 17.3486 4.7933 17.6359 5.01861L19.462 6.44141C19.7493 6.66672 19.8636 7.03153 19.774 7.37134L17.8427 14.8519C17.7531 15.1917 17.464 15.4328 17.1118 15.4328H6.88816C6.53604 15.4328 6.24688 15.1917 6.15732 14.8519L4.22599 7.37134C4.13642 7.03153 4.25072 6.66672 4.53802 6.44141L6.36413 5.01861C6.65143 4.7933 7.04698 4.73911 7.37862 4.88122L12 7L16.6214 4.88122Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 7V15.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M7 4.5L12 2L17 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M4 19.5C4 18.8333 5.5 18 8 18C10.5 18 12 19 12 19.5C12 20 10.5 21 8 21C5.5 21 4 20.1667 4 19.5Z" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M20 19.5C20 18.8333 18.5 18 16 18C13.5 18 12 19 12 19.5C12 20 13.5 21 16 21C18.5 21 20 20.1667 20 19.5Z" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
);

const JournalTable: React.FC<{ entries: JournalEntry[], onEditRequest: (entry: JournalEntry) => void }> = ({ entries, onEditRequest }) => (
    <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-amber-200">
            <thead className="bg-amber-50">
                <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Title</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Author</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Mood</th>
                    <th scope="col" className="relative px-4 py-3"><span className="sr-only">Edit</span></th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-amber-100">
                {entries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-amber-50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-secondary">{new Date(entry.timestamp).toLocaleDateString()}</td>
                        <td className="px-4 py-3 whitespace-nowrap font-medium text-primary">{entry.title}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-secondary">{Authors[entry.author]}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-secondary">{entry.mood || '-'}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                            {entry.author !== 'MY_VOICE' && (
                                <button onClick={() => onEditRequest(entry)} className="text-accent hover:text-accent-dark">Edit</button>
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);


export const JournalView: React.FC<JournalViewProps> = ({ entries, isLoading, setView, updateEntry }) => {
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'table'>('list');

  const handleSaveEdit = (updatedEntry: JournalEntry) => {
    updateEntry(updatedEntry);
    setEditingEntry(null);
  }

  return (
    <div className="h-full flex flex-col">
       <header className="p-4 flex-shrink-0">
         <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-primary">My Journal</h1>
              <p className="text-sm text-secondary">{entries.length} entries</p>
            </div>
            <div className="flex items-center gap-2 p-1 bg-amber-100 rounded-lg">
                <button onClick={() => setViewMode('list')} className={`p-1 rounded-md ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`} aria-label="List view">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
                </button>
                <button onClick={() => setViewMode('table')} className={`p-1 rounded-md ${viewMode === 'table' ? 'bg-white shadow-sm' : ''}`} aria-label="Table view">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                </button>
            </div>
         </div>
      </header>

      <main className="flex-grow overflow-y-auto px-4 pb-24 md:pb-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <LoadingSpinner className="w-8 h-8 text-accent"/>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center pt-20 flex flex-col items-center animate-fade-in">
            <EmptyStateIllustration />
            <h3 className="mt-4 text-lg font-semibold text-primary">Your Journal Awaits</h3>
            <p className="text-secondary mt-1 max-w-xs mx-auto">Tap the <span className="font-bold text-primary">+</span> button to begin your journey of self-reflection.</p>
          </div>
        ) : (
          viewMode === 'list' ? (
            <div>
              {entries.map(entry => (
                <DotCard key={entry.id} entry={entry} onEditRequest={setEditingEntry} />
              ))}
            </div>
           ) : (
             <JournalTable entries={entries} onEditRequest={setEditingEntry} />
           )
        )}
      </main>

       <button
        onClick={() => setView('WRITE')}
        className="fixed bottom-24 right-6 md:bottom-auto md:top-6 md:right-[calc(50vw-20rem)] bg-accent text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:bg-accent-dark transition-colors"
        aria-label="Create new entry"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
      </button>

      {editingEntry && (
        <EditModal 
            entry={editingEntry}
            onSave={handleSaveEdit}
            onClose={() => setEditingEntry(null)}
        />
      )}
    </div>
  );
};