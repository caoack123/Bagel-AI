import { JournalEntry } from '../types';

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';
const SPREADSHEET_ID_KEY = 'dotly-spreadsheet-id';

let gapiInited = false;
let gisInited = false;
let tokenClient: any = null;

const loadGapiScript = () => new Promise<void>((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = () => resolve();
    document.body.appendChild(script);
});

const loadGisScript = () => new Promise<void>((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.onload = () => resolve();
    document.body.appendChild(script);
});

const initializeGapiClient = async () => {
  if (gapiInited) return;
  const gapi = (window as any).gapi;
  await new Promise<void>((resolve, reject) => {
    gapi.load('client', () => {
      gapi.client.init({ apiKey: GOOGLE_API_KEY })
        .then(() => {
          gapi.client.load('https://sheets.googleapis.com/$discovery/rest?version=v4');
          gapiInited = true;
          resolve();
        }).catch(reject);
    });
  });
};

const initializeGisClient = () => {
  if (gisInited) return;
  const google = (window as any).google;
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: GOOGLE_CLIENT_ID,
    scope: SCOPES,
    callback: '', // The callback is handled by the Promise in handleAuthClick
  });
  gisInited = true;
};

// Returns true if successful, false otherwise.
const ensureClientsInitialized = async (setStatus: (message: any) => void): Promise<boolean> => {
    if (!GOOGLE_API_KEY || !GOOGLE_CLIENT_ID) {
        const errorMsg = 'Google Sheets Sync is disabled. The API Key and Client ID have not been configured.';
        setStatus({ type: 'error', text: errorMsg });
        return false;
    }
    
    try {
        if (!(window as any).gapi) await loadGapiScript();
        if (!(window as any).google) await loadGisScript();

        await initializeGapiClient();
        initializeGisClient();
        return true;
    } catch (error) {
        console.error("Error initializing Google clients:", error);
        setStatus({ type: 'error', text: 'Could not initialize Google services. Please check your connection and try again.' });
        return false;
    }
};

const handleAuthClick = (setStatus: (message: any) => void) => {
  return new Promise<void>((resolve, reject) => {
    if ((window as any).gapi.client.getToken() !== null) {
      return resolve();
    }
    if (!tokenClient) {
      return reject(new Error("Google Auth client not initialized."));
    }
    tokenClient.callback = (resp: any) => {
      if (resp.error !== undefined) reject(resp);
      else resolve();
    };
    tokenClient.requestAccessToken({ prompt: 'consent' });
  });
};

const createSheet = async (setStatus: (message: any) => void): Promise<string | null> => {
    const headers = ['ID', 'Timestamp', 'Title', 'Original Content', 'Author', 'Rewritten Content', 'Summary', 'Mood', 'Tags', 'Highlights'];
    const spreadsheetBody = {
        properties: { title: `Dotly.ai Journal - ${new Date().toLocaleString()}` },
        sheets: [{
            properties: { title: 'Entries' },
            data: [{ rowData: [{ values: headers.map(h => ({ userEnteredValue: { stringValue: h } })) }] }]
        }]
    };
    try {
        const response = await (window as any).gapi.client.sheets.spreadsheets.create({}, spreadsheetBody);
        const sheetUrl = response.result.spreadsheetUrl;
        const sheetId = response.result.spreadsheetId;
        localStorage.setItem(SPREADSHEET_ID_KEY, sheetId);
        setStatus({ type: 'success', text: 'Spreadsheet created successfully.' });
        return sheetUrl;
    } catch (e: any) {
        console.error(e);
        setStatus({ type: 'error', text: `Error creating sheet: ${e.result?.error?.message || e.message}` });
        return null;
    }
};

export const connectToGoogleSheets = async (
    setStatus: (message: { type: 'info' | 'success' | 'error', text: string }) => void
): Promise<string | null> => {
    try {
        const initialized = await ensureClientsInitialized(setStatus);
        if (!initialized) return null;

        setStatus({ type: 'info', text: 'Please sign in with Google to authorize.' });
        await handleAuthClick(setStatus);
        setStatus({ type: 'info', text: 'Authorization successful. Creating sheet...' });
        return await createSheet(setStatus);
    } catch (error: any) {
        console.error(error);
        const errorMessage = (error as any).error === 'popup_closed_by_user' 
            ? 'Sign-in was cancelled.' 
            : 'Connection failed. Please try again.';
        setStatus({ type: 'error', text: errorMessage });
        return null;
    }
};

export const appendEntryToSheet = async (entry: JournalEntry): Promise<void> => {
    const spreadsheetId = localStorage.getItem(SPREADSHEET_ID_KEY);
    if (!spreadsheetId) return; // Not connected, do nothing.

    try {
        const initialized = await ensureClientsInitialized(() => {}); // No-op setStatus for background tasks
        if (!initialized) {
            console.warn('Google Sheets sync is disabled because API keys are not configured.');
            return;
        }

        if (!(window as any).gapi.client.getToken()) {
            console.warn("Cannot sync to sheets: user not authenticated.");
            return;
        }

        const row = [
            entry.id, new Date(entry.timestamp).toISOString(), entry.title,
            entry.originalContent, entry.author, entry.rewrittenContent || '',
            entry.summary || '', entry.mood || '', entry.tags?.join(', ') || '',
            entry.highlights?.join('; ') || '',
        ];

        await (window as any).gapi.client.sheets.spreadsheets.values.append({
            spreadsheetId: spreadsheetId,
            range: 'Entries!A:A',
            valueInputOption: 'USER_ENTERED',
            resource: { values: [row] },
        });
    } catch(err) {
        console.error("Failed to append row to Google Sheet:", err);
        // Do not throw, as this is a background task.
    }
};

export const disconnectFromGoogleSheets = () => {
    localStorage.removeItem(SPREADSHEET_ID_KEY);
    const token = (window as any).gapi.client.getToken();
    if (token) {
        (window as any).google.accounts.oauth2.revoke(token.access_token, () => {});
        (window as any).gapi.client.setToken(null);
    }
};

export const checkSignInStatus = async (): Promise<boolean> => {
    try {
        const initialized = await ensureClientsInitialized(() => {});
        if (!initialized) return false;

        return (window as any).gapi.client.getToken() !== null && !!localStorage.getItem(SPREADSHEET_ID_KEY);
    } catch {
        return false;
    }
}

export const getSheetUrl = (): string | null => {
    const id = localStorage.getItem(SPREADSHEET_ID_KEY);
    return id ? `https://docs.google.com/spreadsheets/d/${id}` : null;
}