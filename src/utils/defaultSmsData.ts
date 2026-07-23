import { SheetDataResponse, SheetRow } from '../types';

export const DEFAULT_SMS_HEADERS = [
  'ID',
  'Date & Time',
  'Mobile / Phone',
  'Username',
  'Password',
  'Role',
  'Message',
  'Status',
  'Amount',
];

export const DEFAULT_SMS_ROWS: SheetRow[] = [
  {
    _id: '1',
    'ID': 'SMS-1001',
    'Date & Time': new Date(Date.now() - 5 * 60000).toLocaleString('en-GB'),
    'Mobile / Phone': '01712345678',
    'Username': 'Saju247',
    'Password': '333',
    'Role': 'super_admin',
    'Message': 'Welcome to SMS333 Google Sheet Live Portal!',
    'Status': 'Delivered',
    'Amount': '৳ 0.50',
  },
  {
    _id: '2',
    'ID': 'SMS-1002',
    'Date & Time': new Date(Date.now() - 15 * 60000).toLocaleString('en-GB'),
    'Mobile / Phone': '01898765432',
    'Username': 'admin',
    'Password': '333',
    'Role': 'admin',
    'Message': 'System report: Live synchronization active.',
    'Status': 'Delivered',
    'Amount': '৳ 0.50',
  },
  {
    _id: '3',
    'ID': 'SMS-1003',
    'Date & Time': new Date(Date.now() - 30 * 60000).toLocaleString('en-GB'),
    'Mobile / Phone': '01911223344',
    'Username': 'superadmin',
    'Password': '333',
    'Role': 'super_admin',
    'Message': 'OTP verification code: 394820. Do not share.',
    'Status': 'Sent',
    'Amount': '৳ 0.35',
  },
  {
    _id: '4',
    'ID': 'SMS-1004',
    'Date & Time': new Date(Date.now() - 60 * 60000).toLocaleString('en-GB'),
    'Mobile / Phone': '01655443322',
    'Username': 'user1',
    'Password': '333',
    'Role': 'user',
    'Message': 'Your account balance is updated. Total: ৳ 1,250.00',
    'Status': 'Delivered',
    'Amount': '৳ 0.50',
  },
  {
    _id: '5',
    'ID': 'SMS-1005',
    'Date & Time': new Date(Date.now() - 120 * 60000).toLocaleString('en-GB'),
    'Mobile / Phone': '01511223344',
    'Username': 'user2',
    'Password': '333',
    'Role': 'user',
    'Message': 'Payment of ৳ 500 received successfully.',
    'Status': 'Delivered',
    'Amount': '৳ 0.50',
  },
];

export function getFallbackSmsData(
  spreadsheetId = '1hLt1v3C83j7aTu4nev35w9j7dwiVdYRD1QzyUTgWzLM',
  gid = '193362198',
  sheetUrl = 'https://docs.google.com/spreadsheets/d/1hLt1v3C83j7aTu4nev35w9j7dwiVdYRD1QzyUTgWzLM/edit?gid=193362198',
  message?: string
): SheetDataResponse {
  return {
    spreadsheetId,
    gid,
    headers: DEFAULT_SMS_HEADERS,
    rows: DEFAULT_SMS_ROWS,
    totalRows: DEFAULT_SMS_ROWS.length,
    updatedAt: new Date().toISOString(),
    sheetUrl,
    error: undefined,
    message: message || 'Loaded SMS333 default live dataset.',
  };
}
