export interface SheetRow {
  _id: string;
  [key: string]: string;
}

export interface SheetDataResponse {
  spreadsheetId: string;
  gid: string;
  headers: string[];
  rows: SheetRow[];
  totalRows: number;
  updatedAt: string;
  sheetUrl: string;
  error?: string;
  message?: string;
}

export type ViewMode = 'table' | 'cards' | 'raw';

export interface ColumnFilter {
  column: string;
  value: string;
}

export type UserRole = 'super_admin' | 'admin' | 'user';

export interface UserSession {
  sessionId?: string;
  username: string;
  role: UserRole;
  loginTime?: string;
  deviceInfo?: string;
}

export interface DeviceSession {
  id: string;
  username: string;
  role: UserRole;
  deviceName?: string; // e.g. "Infinix Note 30", "Samsung Galaxy S24 Ultra", "iPhone 15 Pro"
  deviceType: 'mobile' | 'desktop' | 'tablet';
  browser: string;
  os: string;
  ipAddress: string;
  location: string;
  loginTime: string;
  lastActive: string;
  lastAction?: string;
  status: 'active' | 'blocked' | 'logged_out';
  isCurrentSession?: boolean;
}

export interface FirebaseUserRecord {
  id?: string;
  username: string;
  password: string;
  fullName: string;
  emailAddress: string;
  ipAddress: string;
  deviceName?: string;
  role: UserRole;
  status: 'active' | 'suspended' | 'blocked';
  createdAt: string;
}

export interface DeviceNotification {
  id: string;
  targetUsername: string;
  senderUsername: string;
  message: string;
  timestamp: string;
  read: boolean;
  sessionId?: string;
}

