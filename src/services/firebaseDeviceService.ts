import { db, collection, getDocs, doc, setDoc, addDoc, updateDoc, deleteDoc, onSnapshot, query, where } from '../firebase';
import { DeviceSession, DeviceNotification, UserRole } from '../types';

const SESSIONS_COLLECTION = 'device_sessions';
const NOTIFICATIONS_COLLECTION = 'device_notifications';

// Initial default realistic device sessions with Infinix Note 30 example
const INITIAL_FIREBASE_DEVICES: Omit<DeviceSession, 'id'>[] = [
  {
    username: 'superadmin',
    role: 'super_admin',
    deviceName: 'Infinix Note 30 VIP',
    deviceType: 'mobile',
    browser: 'Chrome Mobile 126',
    os: 'Android 13 (Infinix XOS)',
    ipAddress: '103.112.42.12',
    location: 'Dhaka, Bangladesh',
    loginTime: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    lastActive: new Date().toISOString(),
    lastAction: 'Managing Live System & Devices',
    status: 'active',
  },
  {
    username: 'admin_agent1',
    role: 'admin',
    deviceName: 'Infinix Note 30 5G',
    deviceType: 'mobile',
    browser: 'Chrome Mobile 125',
    os: 'Android 13 (XOS 13)',
    ipAddress: '103.150.186.24',
    location: 'Chittagong, Bangladesh',
    loginTime: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    lastActive: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    lastAction: 'Viewing SMS Data & Sheet Records',
    status: 'active',
  },
  {
    username: 'user_operator',
    role: 'user',
    deviceName: 'iPhone 15 Pro Max',
    deviceType: 'mobile',
    browser: 'Safari Mobile 17.5',
    os: 'iOS 17.5.1',
    ipAddress: '103.220.30.88',
    location: 'Sylhet, Bangladesh',
    loginTime: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    lastActive: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    lastAction: 'Searching Phone Numbers & Filter Data',
    status: 'active',
  },
  {
    username: 'field_staff_02',
    role: 'user',
    deviceName: 'Samsung Galaxy S24 Ultra',
    deviceType: 'mobile',
    browser: 'Samsung Internet 24.0',
    os: 'Android 14 (One UI 6.1)',
    ipAddress: '103.102.12.90',
    location: 'Rajshahi, Bangladesh',
    loginTime: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
    lastActive: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    lastAction: 'Logged In & Syncing Local Sheet Data',
    status: 'active',
  },
];

// Fetch all device sessions from Firebase Firestore
export async function getAllFirebaseDeviceSessions(): Promise<DeviceSession[]> {
  try {
    const snapshot = await getDocs(collection(db, SESSIONS_COLLECTION));
    const sessions: DeviceSession[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as Omit<DeviceSession, 'id'>;
      sessions.push({
        id: docSnap.id,
        ...data,
      });
    });

    // Seed default devices if empty
    if (sessions.length === 0) {
      for (const dev of INITIAL_FIREBASE_DEVICES) {
        const docRef = await addDoc(collection(db, SESSIONS_COLLECTION), dev);
        sessions.push({ id: docRef.id, ...dev });
      }
    }

    return sessions;
  } catch (err) {
    console.error('Error getting device sessions from Firebase:', err);
    return [];
  }
}

// Subscribe to real-time device sessions from Firebase
export function subscribeFirebaseDeviceSessions(
  onUpdate: (sessions: DeviceSession[]) => void
): () => void {
  try {
    const q = collection(db, SESSIONS_COLLECTION);
    return onSnapshot(
      q,
      (snapshot) => {
        const sessions: DeviceSession[] = [];
        snapshot.forEach((docSnap) => {
          sessions.push({
            id: docSnap.id,
            ...(docSnap.data() as Omit<DeviceSession, 'id'>),
          });
        });
        onUpdate(sessions);
      },
      (err) => {
        console.error('Error listening to Firebase device sessions:', err);
      }
    );
  } catch (e) {
    console.error('Failed to subscribe to Firebase device sessions:', e);
    return () => {};
  }
}

// Save or Update Device Session in Firebase Firestore
export async function saveDeviceSessionToFirebase(
  session: Partial<DeviceSession> & { username: string }
): Promise<string> {
  try {
    const sessionData: Omit<DeviceSession, 'id'> = {
      username: session.username.trim(),
      role: session.role || 'user',
      deviceName: session.deviceName || 'Infinix Note 30',
      deviceType: session.deviceType || 'mobile',
      browser: session.browser || 'Chrome Mobile',
      os: session.os || 'Android 13',
      ipAddress: session.ipAddress || '103.112.42.12',
      location: session.location || 'Dhaka, Bangladesh',
      loginTime: session.loginTime || new Date().toISOString(),
      lastActive: new Date().toISOString(),
      lastAction: session.lastAction || 'Active in Dashboard',
      status: session.status || 'active',
      isCurrentSession: session.isCurrentSession || false,
    };

    if (session.id) {
      const docRef = doc(db, SESSIONS_COLLECTION, session.id);
      await setDoc(docRef, sessionData, { merge: true });
      return session.id;
    } else {
      const docRef = await addDoc(collection(db, SESSIONS_COLLECTION), sessionData);
      return docRef.id;
    }
  } catch (err) {
    console.error('Error saving device session to Firebase:', err);
    throw err;
  }
}

// Terminate Device Session in Firebase
export async function terminateDeviceSessionInFirebase(sessionId: string): Promise<void> {
  try {
    const docRef = doc(db, SESSIONS_COLLECTION, sessionId);
    await updateDoc(docRef, {
      status: 'logged_out',
      lastActive: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Error terminating device session in Firebase:', err);
    throw err;
  }
}

// Terminate All Other Sessions in Firebase
export async function terminateAllOtherFirebaseSessions(currentSessionId?: string): Promise<void> {
  try {
    const all = await getAllFirebaseDeviceSessions();
    for (const s of all) {
      if (s.id !== currentSessionId && s.status === 'active') {
        await updateDoc(doc(db, SESSIONS_COLLECTION, s.id), {
          status: 'logged_out',
          lastActive: new Date().toISOString(),
        });
      }
    }
  } catch (err) {
    console.error('Error terminating all other sessions in Firebase:', err);
  }
}

// Block / Unblock User Devices in Firebase
export async function toggleBlockUserInFirebase(
  username: string
): Promise<{ isBlocked: boolean }> {
  try {
    const all = await getAllFirebaseDeviceSessions();
    const cleanUser = username.trim().toLowerCase();
    
    // Check if user has active or blocked session
    const targetSessions = all.filter((s) => s.username.toLowerCase() === cleanUser);
    const isCurrentlyBlocked = targetSessions.some((s) => s.status === 'blocked');

    const newStatus = isCurrentlyBlocked ? 'active' : 'blocked';

    for (const s of targetSessions) {
      await updateDoc(doc(db, SESSIONS_COLLECTION, s.id), {
        status: newStatus,
        lastActive: new Date().toISOString(),
      });
    }

    return { isBlocked: !isCurrentlyBlocked };
  } catch (err) {
    console.error('Error toggling block user in Firebase:', err);
    throw err;
  }
}

// Send Notification Warning to Device in Firebase
export async function sendFirebaseDeviceNotification(
  targetUsername: string,
  message: string,
  senderUsername: string = 'Super Admin',
  sessionId?: string
): Promise<void> {
  try {
    const notifData: Omit<DeviceNotification, 'id'> = {
      sessionId,
      targetUsername: targetUsername.trim().toLowerCase(),
      senderUsername: senderUsername.trim(),
      message: message.trim(),
      timestamp: new Date().toISOString(),
      read: false,
    };
    await addDoc(collection(db, NOTIFICATIONS_COLLECTION), notifData);
  } catch (err) {
    console.error('Error sending device notification to Firebase:', err);
    throw err;
  }
}

// Fetch Unread Notifications for User from Firebase
export async function getFirebaseUserNotifications(username: string): Promise<DeviceNotification[]> {
  try {
    const cleanUser = username.trim().toLowerCase();
    const q = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where('targetUsername', '==', cleanUser)
    );
    const snapshot = await getDocs(q);
    const notifications: DeviceNotification[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as Omit<DeviceNotification, 'id'>;
      if (!data.read) {
        notifications.push({
          id: docSnap.id,
          ...data,
        });
      }
    });
    return notifications;
  } catch (err) {
    console.error('Error getting user notifications from Firebase:', err);
    return [];
  }
}
