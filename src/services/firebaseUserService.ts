import { db, collection, getDocs, doc, setDoc, addDoc, updateDoc, query, where, deleteDoc } from '../firebase';
import { FirebaseUserRecord, UserRole } from '../types';

const USERS_COLLECTION = 'users';

// Helper to fetch client IP address
export async function fetchClientIpAddress(): Promise<string> {
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    if (res.ok) {
      const data = await res.json();
      if (data && data.ip) return data.ip;
    }
  } catch (err) {
    console.warn('Could not fetch IP from ipify:', err);
  }

  try {
    const res = await fetch('https://ipapi.co/json/');
    if (res.ok) {
      const data = await res.json();
      if (data && data.ip) return data.ip;
    }
  } catch (err) {
    console.warn('Could not fetch IP from ipapi:', err);
  }

  return '127.0.0.1';
}

// Fetch all users stored in Firebase Firestore
export async function getAllFirebaseUsers(): Promise<FirebaseUserRecord[]> {
  try {
    const snapshot = await getDocs(collection(db, USERS_COLLECTION));
    const users: FirebaseUserRecord[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as Omit<FirebaseUserRecord, 'id'>;
      users.push({
        id: docSnap.id,
        ...data,
      });
    });
    return users;
  } catch (err) {
    console.error('Error getting users from Firebase:', err);
    return [];
  }
}

// Add or update a user record in Firebase Firestore
export async function saveUserToFirebase(user: Omit<FirebaseUserRecord, 'id'> & { id?: string }): Promise<string> {
  try {
    const currentIp = user.ipAddress && user.ipAddress !== '127.0.0.1' 
      ? user.ipAddress 
      : await fetchClientIpAddress();

    const userData: FirebaseUserRecord = {
      username: user.username.trim(),
      password: user.password.trim(),
      fullName: user.fullName?.trim() || user.username.trim(),
      emailAddress: user.emailAddress?.trim() || `${user.username.trim()}@sms333.com`,
      ipAddress: currentIp,
      role: user.role || 'user',
      status: user.status || 'active',
      createdAt: user.createdAt || new Date().toISOString(),
    };

    if (user.id) {
      // Update existing document
      const userRef = doc(db, USERS_COLLECTION, user.id);
      await setDoc(userRef, userData, { merge: true });
      return user.id;
    } else {
      // Add new document
      const docRef = await addDoc(collection(db, USERS_COLLECTION), userData);
      return docRef.id;
    }
  } catch (err) {
    console.error('Error saving user to Firebase:', err);
    throw err;
  }
}

// Delete user from Firebase Firestore
export async function deleteUserFromFirebase(userId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, USERS_COLLECTION, userId));
  } catch (err) {
    console.error('Error deleting user from Firebase:', err);
    throw err;
  }
}

// Authenticate user against Firebase Firestore
export async function authenticateFirebaseUser(usernameInput: string, passwordInput: string): Promise<FirebaseUserRecord | null> {
  try {
    const cleanUser = usernameInput.trim().toLowerCase();
    const cleanPass = passwordInput.trim();

    const allUsers = await getAllFirebaseUsers();
    
    // Find matching user by username (case-insensitive) and password
    const match = allUsers.find(
      (u) =>
        u.username.toLowerCase() === cleanUser &&
        (u.password === cleanPass || u.password.toLowerCase() === cleanPass.toLowerCase())
    );

    if (match) {
      // Update IP address on login
      const currentIp = await fetchClientIpAddress();
      if (match.id) {
        await updateDoc(doc(db, USERS_COLLECTION, match.id), {
          ipAddress: currentIp,
        });
      }
      return {
        ...match,
        ipAddress: currentIp,
      };
    }

    return null;
  } catch (err) {
    console.error('Error authenticating with Firebase:', err);
    return null;
  }
}

// Get user by username from Firebase Firestore
export async function getFirebaseUserByUsername(username: string): Promise<FirebaseUserRecord | null> {
  try {
    const allUsers = await getAllFirebaseUsers();
    const clean = username.trim().toLowerCase();
    const match = allUsers.find((u) => u.username.toLowerCase() === clean);
    return match || null;
  } catch (err) {
    console.error('Error fetching user by username:', err);
    return null;
  }
}

// Seed default Super Admin user in Firebase if no users exist
export async function seedDefaultSuperAdminInFirebase(): Promise<void> {
  try {
    const users = await getAllFirebaseUsers();
    if (users.length === 0) {
      const currentIp = await fetchClientIpAddress();
      await addDoc(collection(db, USERS_COLLECTION), {
        username: 'admin',
        password: 'admin123',
        fullName: 'System Super Admin',
        emailAddress: 'admin@sms333.com',
        ipAddress: currentIp,
        role: 'super_admin' as UserRole,
        status: 'active',
        createdAt: new Date().toISOString(),
      });
      console.log('Seeded default Super Admin in Firebase Firestore');
    }
  } catch (err) {
    console.warn('Failed to seed default super admin in Firebase:', err);
  }
}
