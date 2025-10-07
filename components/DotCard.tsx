import React, { useState } from 'react';
import { Authors, JournalEntry } from '../types';

interface DotCardProps {
  entry: JournalEntry;
  onEditRequest: (entry: JournalEntry) => void;
}

const DetailSection: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
  <div className={className}>
    <h4 className="font-semibold text-primary mb-2">{title}</h4>
    {children}
  </div>
);

export const DotCard: React.FC<DotCardProps> = ({ entry, onEditRequest }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const date = new Date(entry.timestamp);
  const formattedDate = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const isAiEnhanced = entry.author !== 'MY_VOICE' && !!entry.rewrittenContent;
  const authorTag = isAiEnhanced ? Authors[entry.author] : 'Original';
  
  const contentToShow = isAiEnhanced ? entry.summary : entry.originalContent;

  const toggleExpand = () => {
    if (isAiEnhanced) {
      setIsExpanded(!isExpanded);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card from expanding when edit is clicked
    onEditRequest(entry);
  };

  return (
    <div 
      className={`bg-card text-card-text p-4 rounded-xl shadow-md border border-amber-100 mb-4 animate-fade-in transition-shadow duration-300 ${isAiEnhanced ? 'cursor-pointer hover:shadow-lg' : ''}`}
      onClick={toggleExpand}
      role={isAiEnhanced ? "button" : "article"}
      aria-expanded={isAiEnhanced ? isExpanded : undefined}
      tabIndex={isAiEnhanced ? 0 : -1}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleExpand(); } }}
    >
      <header className="flex justify-between items-start mb-2">
        <p className="text-sm font-medium text-secondary pt-1">{formattedDate}</p>
        <div className="flex items-center gap-2 flex-shrink-0">
          {isAiEnhanced && (
            <button onClick={handleEditClick} aria-label="Edit entry" className="p-1 text-secondary hover:text-primary rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
              </svg>
            </button>
          )}
          {isAiEnhanced && entry.mood && (
             <span className="text-xs font-semibold px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
               {entry.mood}
             </span>
          )}
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${!isAiEnhanced ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
            {authorTag}
          </span>
        </div>
      </header>
      <h3 className="font-bold text-lg mb-2 text-primary">{entry.title}</h3>
      <p className="text-secondary text-sm leading-relaxed mb-4">
        {contentToShow}
      </p>

      {entry.tags && entry.tags.length > 0 && !isExpanded && (
        <div className="flex flex-wrap gap-2">
          {entry.tags.map(tag => (
            <span key={tag} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {isAiEnhanced && isExpanded && (
        <div className="mt-4 pt-4 border-t border-amber-200 animate-fade-in space-y-4">
          
          <DetailSection title="My Original Thoughts">
            <p className="text-secondary text-sm bg-amber-50 p-3 rounded-lg">{entry.originalContent}</p>
          </DetailSection>

          <DetailSection title={`Rewrite by ${authorTag}`}>
            <p className="text-secondary text-sm italic">"{entry.rewrittenContent}"</p>
          </DetailSection>

          {entry.highlights && entry.highlights.length > 0 && (
            <DetailSection title="Key Highlights">
              <ul className="list-disc list-inside text-secondary text-sm space-y-1">
                {entry.highlights.map((highlight, i) => (
                  <li key={i}>{highlight}</li>
                ))}
              </ul>
            </DetailSection>
          )}

          {entry.tags && entry.tags.length > 0 && (
            <DetailSection title="Tags">
              <div className="flex flex-wrap gap-2">
                {entry.tags.map(tag => (
                  <span key={tag} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
            </DetailSection>
          )}

        </div>
      )}

      {isAiEnhanced && (
         <div className="flex justify-end items-center text-secondary/70 mt-3">
            <span className="text-xs mr-2 select-none">Click to {isExpanded ? 'collapse' : 'expand'}</span>
            <svg className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
         </div>
      )}

    </div>
  );
};