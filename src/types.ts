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
  username: string;
  role: UserRole;
}
