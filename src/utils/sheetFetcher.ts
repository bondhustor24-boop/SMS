import Papa from 'papaparse';
import { SheetDataResponse, SheetRow } from '../types';

export async function fetchGoogleSheetData(targetUrl: string): Promise<SheetDataResponse> {
  // 1. First attempt: Server API endpoint /api/sheet-data
  try {
    const apiRes = await fetch(`/api/sheet-data?url=${encodeURIComponent(targetUrl)}`, {
      headers: { Accept: 'application/json' },
    });

    const contentType = apiRes.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const json = await apiRes.json();
      if (json && (json.headers || json.error)) {
        return json;
      }
    }
  } catch (err) {
    console.warn('Server endpoint /api/sheet-data unavailable, trying direct client fetch:', err);
  }

  // 2. Client-side direct Google Sheets CSV fetch fallback
  let spreadsheetId = '1hLt1v3C83j7aTu4nev35w9j7dwiVdYRD1QzyUTgWzLM';
  let gid = '193362198';

  if (targetUrl) {
    const idMatch = targetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (idMatch && idMatch[1]) {
      spreadsheetId = idMatch[1];
    }
    const gidMatch = targetUrl.match(/gid=([0-9]+)/);
    if (gidMatch && gidMatch[1]) {
      gid = gidMatch[1];
    } else if (spreadsheetId !== '1hLt1v3C83j7aTu4nev35w9j7dwiVdYRD1QzyUTgWzLM') {
      gid = '0';
    }
  }

  const candidateUrls = [
    `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=${gid}`,
    `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&gid=${gid}`,
    `https://docs.google.com/spreadsheets/d/${spreadsheetId}/pub?output=csv&gid=${gid}`,
    `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv`,
  ];

  let csvText = '';
  let isAccessRestricted = false;

  const fetchCandidate = async (urlCandidate: string): Promise<string> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    try {
      const res = await fetch(urlCandidate, { signal: controller.signal });
      if (res.ok) {
        const text = await res.text();
        if (text && !text.includes('<!DOCTYPE html') && !text.includes('<html')) {
          return text;
        } else if (text && (text.includes('<!DOCTYPE html') || text.includes('<html'))) {
          isAccessRestricted = true;
        }
      }
    } finally {
      clearTimeout(timeoutId);
    }
    throw new Error(`Client candidate failed: ${urlCandidate}`);
  };

  try {
    csvText = await Promise.any(candidateUrls.map((url) => fetchCandidate(url)));
  } catch (err) {
    csvText = '';
  }

  if (isAccessRestricted && !csvText) {
    return {
      error: 'ACCESS_RESTRICTED',
      message: 'This Google Sheet is either private or requires sharing permission. Please set link sharing to "Anyone with the link can view" in Google Sheets.',
      spreadsheetId,
      gid,
      sheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit?gid=${gid}`,
      headers: [],
      rows: [],
      totalRows: 0,
      updatedAt: new Date().toISOString(),
    };
  }

  if (!csvText) {
    throw new Error('Google Sheet data could not be retrieved. Please check the sheet link or sharing permissions.');
  }

  // Parse CSV client-side
  const parsed = Papa.parse<string[]>(csvText, { skipEmptyLines: 'greedy' });
  if (!parsed.data || parsed.data.length === 0) {
    return {
      spreadsheetId,
      gid,
      headers: [],
      rows: [],
      totalRows: 0,
      updatedAt: new Date().toISOString(),
      sheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit?gid=${gid}`,
    };
  }

  const rows = parsed.data;
  const headers = rows[0].map((h, i) => (h ? h.trim() : `Column ${i + 1}`));
  const dataRows: SheetRow[] = rows.slice(1).map((row, rowIndex) => {
    const obj: SheetRow = { _id: String(rowIndex + 1) };
    headers.forEach((header, i) => {
      obj[header] = row[i] !== undefined ? row[i] : '';
    });
    return obj;
  });

  return {
    spreadsheetId,
    gid,
    headers,
    rows: dataRows,
    totalRows: dataRows.length,
    updatedAt: new Date().toISOString(),
    sheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit?gid=${gid}`,
  };
}
