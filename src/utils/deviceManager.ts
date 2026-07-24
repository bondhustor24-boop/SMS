import { DeviceSession, UserRole, UserSession } from '../types';

const STORAGE_KEY_SESSIONS = 'sms333_active_sessions';
const STORAGE_KEY_BLOCKED = 'sms333_blocked_users';

export function parseUserAgent(): { deviceType: 'mobile' | 'desktop' | 'tablet'; browser: string; os: string } {
  const ua = navigator.userAgent || '';
  
  // OS Detection
  let os = 'Windows OS';
  if (ua.includes('iPhone')) os = 'iOS (iPhone)';
  else if (ua.includes('iPad')) os = 'iPadOS';
  else if (ua.includes('Android')) os = 'Android OS';
  else if (ua.includes('Macintosh') || ua.includes('Mac OS')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux OS';

  // Device Type
  let deviceType: 'mobile' | 'desktop' | 'tablet' = 'desktop';
  if (/iPad|Tablet/i.test(ua)) deviceType = 'tablet';
  else if (/Mobile|iPhone|Android/i.test(ua)) deviceType = 'mobile';

  // Browser Detection
  let browser = 'Chrome Browser';
  if (ua.includes('Firefox')) browser = 'Mozilla Firefox';
  else if (ua.includes('SamsungBrowser')) browser = 'Samsung Internet';
  else if (ua.includes('Opera') || ua.includes('OPR')) browser = 'Opera Browser';
  else if (ua.includes('Edge') || ua.includes('Edg')) browser = 'Microsoft Edge';
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Apple Safari';

  return { deviceType, browser, os };
}

// Initial mock devices if empty
const DEFAULT_MOCK_DEVICES: DeviceSession[] = [
  {
    id: 'session-dev-1',
    username: 'superadmin',
    role: 'super_admin',
    deviceType: 'desktop',
    browser: 'Chrome 126.0 (Windows)',
    os: 'Windows 11 Pro',
    ipAddress: '103.112.42.12',
    location: 'Dhaka, Bangladesh',
    loginTime: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    lastActive: new Date().toISOString(),
    status: 'active',
  },
  {
    id: 'session-dev-2',
    username: 'admin_agent1',
    role: 'admin',
    deviceType: 'mobile',
    browser: 'Chrome Mobile 125',
    os: 'Android 14 (Samsung Galaxy)',
    ipAddress: '103.150.186.24',
    location: 'Chittagong, Bangladesh',
    loginTime: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    lastActive: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    status: 'active',
  },
  {
    id: 'session-dev-3',
    username: 'user_operator',
    role: 'user',
    deviceType: 'mobile',
    browser: 'Safari Mobile',
    os: 'iOS 17.5 (iPhone 15)',
    ipAddress: '103.220.30.88',
    location: 'Sylhet, Bangladesh',
    loginTime: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    lastActive: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    status: 'active',
  },
  {
    id: 'session-dev-4',
    username: 'field_staff_02',
    role: 'user',
    deviceType: 'tablet',
    browser: 'Firefox Mobile',
    os: 'Android 13 Tablet',
    ipAddress: '103.102.12.90',
    location: 'Rajshahi, Bangladesh',
    loginTime: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
    lastActive: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    status: 'active',
  },
];

export function getStoredSessions(): DeviceSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SESSIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(DEFAULT_MOCK_DEVICES));
      return DEFAULT_MOCK_DEVICES;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_MOCK_DEVICES;
  }
}

export function saveSessions(sessions: DeviceSession[]): void {
  localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
}

export function getBlockedUsers(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BLOCKED);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveBlockedUsers(users: string[]): void {
  localStorage.setItem(STORAGE_KEY_BLOCKED, JSON.stringify(users));
}

export function isUserBlocked(username: string): boolean {
  const blockedList = getBlockedUsers();
  return blockedList.some((u) => u.toLowerCase() === username.trim().toLowerCase());
}

export function registerNewSession(user: UserSession): DeviceSession {
  const sessions = getStoredSessions();
  const { deviceType, browser, os } = parseUserAgent();
  
  const sessionId = 'session-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
  
  const newSession: DeviceSession = {
    id: sessionId,
    username: user.username,
    role: user.role,
    deviceType,
    browser: `${browser}`,
    os,
    ipAddress: '103.112.' + Math.floor(Math.random() * 200 + 10) + '.' + Math.floor(Math.random() * 200 + 10),
    location: 'Dhaka, Bangladesh',
    loginTime: new Date().toISOString(),
    lastActive: new Date().toISOString(),
    status: 'active',
    isCurrentSession: true,
  };

  const updatedSessions = [newSession, ...sessions.map(s => ({ ...s, isCurrentSession: false }))];
  saveSessions(updatedSessions);
  return newSession;
}

export function terminateSession(sessionId: string): DeviceSession[] {
  const sessions = getStoredSessions();
  const updated = sessions.map((s) => {
    if (s.id === sessionId) {
      return { ...s, status: 'logged_out' as const };
    }
    return s;
  });
  saveSessions(updated);
  return updated;
}

export function toggleBlockUser(username: string): { isBlocked: boolean; updatedSessions: DeviceSession[] } {
  const blockedList = getBlockedUsers();
  const normalized = username.trim().toLowerCase();
  const isCurrentlyBlocked = blockedList.some((u) => u.toLowerCase() === normalized);

  let newBlockedList: string[];
  if (isCurrentlyBlocked) {
    newBlockedList = blockedList.filter((u) => u.toLowerCase() !== normalized);
  } else {
    newBlockedList = [...blockedList, username];
  }
  saveBlockedUsers(newBlockedList);

  // Update sessions status
  const sessions = getStoredSessions();
  const updatedSessions = sessions.map((s) => {
    if (s.username.toLowerCase() === normalized) {
      return {
        ...s,
        status: isCurrentlyBlocked ? ('active' as const) : ('blocked' as const),
      };
    }
    return s;
  });
  saveSessions(updatedSessions);

  return { isBlocked: !isCurrentlyBlocked, updatedSessions };
}

export interface DeviceNotification {
  id: string;
  sessionId?: string;
  targetUsername: string;
  senderUsername: string;
  message: string;
  timestamp: string;
  read: boolean;
}

const STORAGE_KEY_NOTIFICATIONS = 'sms333_device_notifications';

export function getStoredNotifications(): DeviceNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function sendNotificationToDevice(
  targetUsername: string,
  message: string,
  senderUsername: string = 'Super Admin',
  sessionId?: string
): void {
  const notifications = getStoredNotifications();
  const newNotif: DeviceNotification = {
    id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
    sessionId,
    targetUsername: targetUsername.toLowerCase(),
    senderUsername,
    message,
    timestamp: new Date().toISOString(),
    read: false,
  };
  localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify([newNotif, ...notifications]));
}

export function getUserUnreadNotifications(username: string): DeviceNotification[] {
  const notifications = getStoredNotifications();
  return notifications.filter(
    (n) => n.targetUsername === username.toLowerCase() && !n.read
  );
}

export function markNotificationAsRead(notificationId: string): void {
  const notifications = getStoredNotifications();
  const updated = notifications.map((n) =>
    n.id === notificationId ? { ...n, read: true } : n
  );
  localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(updated));
}

export function terminateAllOtherSessions(currentSessionId?: string): DeviceSession[] {
  const sessions = getStoredSessions();
  const updated = sessions.map((s) => {
    if (s.id !== currentSessionId && s.status === 'active') {
      return { ...s, status: 'logged_out' as const };
    }
    return s;
  });
  saveSessions(updated);
  return updated;
}
