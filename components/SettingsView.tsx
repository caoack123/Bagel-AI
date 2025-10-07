import React, { useState, useEffect } from 'react';
import { JournalEntry } from '../types';
import { connectToGoogleSheets, disconnectFromGoogleSheets, getSheetUrl, checkSignInStatus } from '../services/googleSheetsService';
import { LoadingSpinner } from './LoadingSpinner';

interface SettingsViewProps {
  clearJournal: () => void;
  entries: JournalEntry[];
}

export const SettingsView: React.FC<SettingsViewProps> = ({ clearJournal, entries }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<{ type: 'info' | 'success' | 'error', text: string } | null>(null);
  const [sheetUrl, setSheetUrl] = useState<string | null>(null);
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
        setIsProcessing(true);
        const signedIn = await checkSignInStatus();
        setIsSignedIn(signedIn);
        if (signedIn) {
            const url = getSheetUrl();
            setSheetUrl(url);
        }
        setIsProcessing(false);
    };
    checkStatus();
  }, []);

  const handleClear = () => {
    if (window.confirm('Are you sure you want to delete all your journal entries? This action cannot be undone.')) {
      clearJournal();
      alert('Your journal has been cleared.');
    }
  };

  const handleExportJson = () => {
    if (entries.length === 0) {
        alert("There are no entries to export.");
        return;
    }
    try {
        const jsonString = JSON.stringify(entries, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `dotly-journal-export-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Failed to export entries as JSON", error);
        alert("An error occurred while trying to export your journal.");
    }
  };


  const handleConnect = async () => {
    setIsProcessing(true);
    setStatus(null);
    setSheetUrl(null);
    
    const url = await connectToGoogleSheets((statusUpdate) => {
        setStatus(statusUpdate);
    });

    if (url) {
        setSheetUrl(url);
        setIsSignedIn(true);
        setStatus({ type: 'success', text: 'Successfully connected to Google Sheets!' });
    }
    setIsProcessing(false);
  };

  const handleDisconnect = () => {
    disconnectFromGoogleSheets();
    setIsSignedIn(false);
    setSheetUrl(null);
    setStatus({ type: 'info', text: 'Disconnected from Google Sheets.' });
  }

  const statusColorMap = {
    info: 'text-blue-800 bg-blue-100',
    success: 'text-green-800 bg-green-100',
    error: 'text-red-800 bg-red-100',
  };

  return (
    <div className="p-4 animate-fade-in">
       <header className="mb-6">
        <h1 className="text-2xl font-bold text-primary">Settings</h1>
      </header>
      
      <div className="space-y-6">
        <div className="bg-surface p-4 rounded-lg shadow-sm border border-amber-100">
            <h2 className="text-lg font-semibold text-primary mb-2">Google Sheets Sync</h2>
            <p className="text-secondary text-sm mb-4">
              Connect your Google Account to automatically save every journal entry to a private Google Sheet in real-time.
            </p>
            {!isSignedIn ? (
                <button
                    onClick={handleConnect}
                    disabled={isProcessing}
                    className="bg-accent text-white font-bold py-2 px-4 rounded-lg hover:bg-accent-dark transition-colors disabled:opacity-50 disabled:cursor-wait w-full flex items-center justify-center"
                >
                    {isProcessing ? <> <LoadingSpinner className="w-5 h-5 mr-2"/> Connecting... </> : 'Connect to Google Sheets'}
                </button>
            ) : (
                 <button
                    onClick={handleDisconnect}
                    disabled={isProcessing}
                    className="bg-secondary text-white font-bold py-2 px-4 rounded-lg hover:opacity-90 transition-colors w-full flex items-center justify-center"
                >
                    Disconnect
                </button>
            )}
            {status && (
                <div className={`mt-4 p-3 rounded-md text-sm ${statusColorMap[status.type]}`}>
                    <p>{status.text}</p>
                </div>
            )}
            {sheetUrl && (
                 <div className="mt-4">
                    <a href={sheetUrl} target="_blank" rel="noopener noreferrer" className="font-bold text-sm text-primary underline hover:text-accent">
                        Open Connected Google Sheet
                    </a>
                 </div>
            )}
        </div>

        <div className="bg-surface p-4 rounded-lg shadow-sm border border-amber-100">
            <h2 className="text-lg font-semibold text-primary mb-2">Data Management</h2>
            <p className="text-secondary text-sm mb-4">
            All your journal data is stored locally in your browser. You can export it or clear it permanently.
            </p>
            <div className="flex space-x-2">
                 <button
                    onClick={handleExportJson}
                    className="bg-primary text-background font-bold py-2 px-4 rounded-lg hover:opacity-90 transition-colors"
                 >
                    Export as JSON
                 </button>
                <button
                    onClick={handleClear}
                    className="bg-red-800 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                >
                    Clear All Journal Data
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};