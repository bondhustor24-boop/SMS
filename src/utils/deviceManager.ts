import { DeviceSession, UserRole, UserSession } from '../types';

const STORAGE_KEY_SESSIONS = 'sms333_active_sessions';
const STORAGE_KEY_BLOCKED = 'sms333_blocked_users';

export function parseUserAgent(): { deviceType: 'mobile' | 'desktop' | 'tablet'; browser: string; os: string } {
  const ua = navigator.userAgent || '';
  const platform = (navigator as any).userAgentData?.platform || navigator.platform || '';
  
  // OS Detection
  let os = 'Windows 11/10';
  if (/iPhone/i.test(ua)) os = 'iOS (iPhone)';
  else if (/iPad/i.test(ua)) os = 'iPadOS (iPad)';
  else if (/Android/i.test(ua)) {
    const match = ua.match(/Android\s([0-9.]+)/i);
    os = match ? `Android ${match[1]}` : 'Android OS';
  } else if (/Macintosh|Mac OS X/i.test(ua)) {
    os = 'macOS (Apple Mac)';
  } else if (/Linux/i.test(ua)) {
    os = 'Linux OS';
  } else if (/Windows NT 10.0/i.test(ua)) {
    os = 'Windows 10/11';
  } else if (/Windows/i.test(ua)) {
    os = 'Windows OS';
  }

  // Device Type
  let deviceType: 'mobile' | 'desktop' | 'tablet' = 'desktop';
  if (/iPad|Tablet|(Android(?!.*Mobile))/i.test(ua)) {
    deviceType = 'tablet';
  } else if (/Mobile|iPhone|iPod|Android.*Mobile|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
    deviceType = 'mobile';
  }

  // Browser Detection & Version
  let browser = 'Chrome Browser';
  if (/Edg\/([0-9.]+)/i.test(ua)) {
    const m = ua.match(/Edg\/([0-9.]+)/i);
    browser = `Microsoft Edge ${m ? m[1].split('.')[0] : ''}`;
  } else if (/SamsungBrowser\/([0-9.]+)/i.test(ua)) {
    const m = ua.match(/SamsungBrowser\/([0-9.]+)/i);
    browser = `Samsung Internet ${m ? m[1].split('.')[0] : ''}`;
  } else if (/OPR\/([0-9.]+)|Opera/i.test(ua)) {
    const m = ua.match(/OPR\/([0-9.]+)/i);
    browser = `Opera ${m ? m[1].split('.')[0] : ''}`;
  } else if (/Firefox\/([0-9.]+)/i.test(ua)) {
    const m = ua.match(/Firefox\/([0-9.]+)/i);
    browser = `Mozilla Firefox ${m ? m[1].split('.')[0] : ''}`;
  } else if (/Chrome\/([0-9.]+)/i.test(ua)) {
    const m = ua.match(/Chrome\/([0-9.]+)/i);
    browser = `Google Chrome ${m ? m[1].split('.')[0] : ''}`;
  } else if (/Safari\/([0-9.]+)/i.test(ua) && !/Chrome/i.test(ua)) {
    const m = ua.match(/Version\/([0-9.]+)/i);
    browser = `Apple Safari ${m ? m[1].split('.')[0] : ''}`;
  }

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
    lastAction: 'Managing Live System & Devices',
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
    lastAction: 'Viewing SMS Data & Sheet Records',
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
    lastAction: 'Searching Phone Numbers & Filter Data',
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
    lastAction: 'Logged In & Syncing Local Sheet Data',
    status: 'active',
  },
];

// Get or generate sessions, ensuring current real user is attached
export function getStoredSessions(): DeviceSession[] {
  let sessions: DeviceSession[] = [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SESSIONS);
    if (raw) {
      sessions = JSON.parse(raw);
    }
  } catch {
    sessions = [];
  }

  // Ensure current logged-in user from localStorage has a real active session
  try {
    const rawUser = localStorage.getItem('sms333_user_session');
    if (rawUser) {
      const currentUser: UserSession = JSON.parse(rawUser);
      const { deviceType, browser, os } = parseUserAgent();
      
      const existingIndex = sessions.findIndex(
        (s) => s.username.toLowerCase() === currentUser.username.toLowerCase() && s.status === 'active'
      );

      if (existingIndex >= 0) {
        // Update existing session with real live browser details
        sessions[existingIndex] = {
          ...sessions[existingIndex],
          deviceType,
          browser,
          os,
          lastActive: new Date().toISOString(),
          lastAction: sessions[existingIndex].lastAction || 'Active in Live SMS Dashboard',
          isCurrentSession: true,
        };
      } else {
        // Create a new real session for this logged in user
        const realSession: DeviceSession = {
          id: 'session-real-' + Date.now(),
          username: currentUser.username,
          role: currentUser.role,
          deviceType,
          browser,
          os,
          ipAddress: '103.112.' + Math.floor(Math.random() * 200 + 10) + '.' + Math.floor(Math.random() * 200 + 10),
          location: 'Dhaka, Bangladesh',
          loginTime: new Date().toISOString(),
          lastActive: new Date().toISOString(),
          lastAction: 'Active in Live SMS Dashboard',
          status: 'active',
          isCurrentSession: true,
        };
        sessions.unshift(realSession);
      }
      
      // Save updated list
      localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
    }
  } catch (e) {
    console.error('Error syncing real device session:', e);
  }

  if (sessions.length === 0) {
    sessions = DEFAULT_MOCK_DEVICES;
    localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
  }

  return sessions;
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
