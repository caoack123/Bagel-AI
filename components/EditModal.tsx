import React, { useState, useEffect } from 'react';
import { JournalEntry } from '../types';

interface EditModalProps {
    entry: JournalEntry;
    onSave: (updatedEntry: JournalEntry) => void;
    onClose: () => void;
}

interface FormData {
    title: string;
    rewrittenContent: string;
    summary: string;
    mood: string;
    tags: string; // Stored as comma-separated string for easier input
    highlights: string; // Stored as newline-separated string
}

export const EditModal: React.FC<EditModalProps> = ({ entry, onSave, onClose }) => {
    const [formData, setFormData] = useState<FormData>({
        title: entry.title,
        rewrittenContent: entry.rewrittenContent || '',
        summary: entry.summary || '',
        mood: entry.mood || '',
        tags: entry.tags?.join(', ') || '',
        highlights: entry.highlights?.join('\n') || '',
    });

    // Handle modal closing with Escape key
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const updatedEntry: JournalEntry = {
            ...entry,
            title: formData.title,
            rewrittenContent: formData.rewrittenContent,
            summary: formData.summary,
            mood: formData.mood,
            tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
            highlights: formData.highlights.split('\n').map(h => h.trim()).filter(Boolean),
        };
        onSave(updatedEntry);
    };

    const FormField: React.FC<{ label: string; name: keyof FormData; type?: 'input' | 'textarea', rows?: number }> = ({ label, name, type = 'input', rows }) => (
        <div>
            <label htmlFor={name} className="block text-sm font-medium text-secondary mb-1">{label}</label>
            {type === 'input' ? (
                <input
                    type="text"
                    id={name}
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    className="w-full bg-amber-50 border-amber-300 border rounded-md p-2 text-primary focus:ring-2 focus:ring-accent focus:border-transparent"
                />
            ) : (
                <textarea
                    id={name}
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    rows={rows}
                    className="w-full bg-amber-50 border-amber-300 border rounded-md p-2 text-primary focus:ring-2 focus:ring-accent focus:border-transparent"
                />
            )}
        </div>
    );

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 animate-fade-in"
            aria-modal="true"
            role="dialog"
            onClick={onClose}
        >
            <div 
                className="bg-background rounded-lg shadow-xl w-full max-w-lg m-4 max-h-[90vh] flex flex-col"
                onClick={e => e.stopPropagation()} // Prevent click inside modal from closing it
            >
                <header className="p-4 border-b border-amber-200 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-primary">Edit Entry</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-amber-100">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </header>
                <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto">
                    <FormField label="Title" name="title" />
                    <FormField label="AI Rewrite" name="rewrittenContent" type="textarea" rows={4} />
                    <FormField label="Summary" name="summary" type="textarea" rows={2} />
                    <FormField label="Mood" name="mood" />
                    <FormField label="Tags (comma-separated)" name="tags" />
                    <FormField label="Highlights (one per line)" name="highlights" type="textarea" rows={3} />
                </form>
                <footer className="p-4 border-t border-amber-200 flex justify-end space-x-2 mt-auto">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-secondary text-white rounded-lg hover:opacity-90">Cancel</button>
                    <button type="submit" onClick={handleSubmit} className="px-4 py-2 bg-accent text-white font-bold rounded-lg hover:bg-accent-dark">Save Changes</button>
                </footer>
            </div>
        </div>
    );
};
