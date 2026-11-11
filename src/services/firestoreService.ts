import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { UserProfile, MatchItem, ChatMessage, CompatibilityResult } from '../types';
import { INDIAN_DEMO_PROFILES, INITIAL_MATCHES, INITIAL_MESSAGES } from '../data/mockData';

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  const path = `profiles/${profile.id}`;
  try {
    await setDoc(doc(db, 'profiles', profile.id), {
      ...profile,
      userId: profile.id,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }

  // Also save private account info
  const privatePath = `users/${profile.id}/private/account`;
  try {
    await setDoc(doc(db, 'users', profile.id, 'private', 'account'), {
      uid: profile.id,
      phone: profile.phone || '',
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    // Non-fatal if private subcollection is still initializing
    console.warn("Private account record update notice:", error);
  }
}

export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  const path = `profiles/${uid}`;
  try {
    const snap = await getDoc(doc(db, 'profiles', uid));
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function fetchAllProfiles(currentUserId?: string): Promise<UserProfile[]> {
  const path = 'profiles';
  try {
    const snap = await getDocs(collection(db, 'profiles'));
    const loaded: UserProfile[] = [];
    snap.forEach((d) => {
      loaded.push(d.data() as UserProfile);
    });

    // If Firestore database is fresh/empty, seed the Indian sample profiles
    if (loaded.length === 0) {
      await seedIndianProfiles();
      return INDIAN_DEMO_PROFILES;
    }

    return loaded;
  } catch (error) {
    console.warn("Firestore fetch notice, using fallback sample profiles:", error);
    return INDIAN_DEMO_PROFILES;
  }
}

export async function seedIndianProfiles(): Promise<void> {
  try {
    for (const p of INDIAN_DEMO_PROFILES) {
      await setDoc(doc(db, 'profiles', p.id), {
        ...p,
        userId: p.id,
        isDemo: true,
        createdAt: new Date().toISOString(),
      });
    }
    console.log("Seeded Indian demo profiles to Firestore.");
  } catch (err) {
    console.warn("Seeding profiles notice:", err);
  }
}

export async function recordSwipe(
  swiperId: string, 
  targetUserId: string, 
  direction: 'like' | 'pass' | 'superlike'
): Promise<boolean> {
  const swipeDocId = `${swiperId}_${targetUserId}`;
  const path = `swipes/${swipeDocId}`;
  try {
    await setDoc(doc(db, 'swipes', swipeDocId), {
      swiperId,
      targetUserId,
      direction,
      createdAt: new Date().toISOString(),
    });

    // Check if target has liked swiper
    if (direction === 'like' || direction === 'superlike') {
      const reciprocalSwipeId = `${targetUserId}_${swiperId}`;
      const reciprocalSnap = await getDoc(doc(db, 'swipes', reciprocalSwipeId));
      
      const isTargetDemo = targetUserId.startsWith('demo-') || targetUserId.startsWith('current-user-');
      // For demo accounts, simulate reciprocal right-swipe if candidate is compatible!
      if (reciprocalSnap.exists()) {
        const data = reciprocalSnap.data();
        if (data.direction === 'like' || data.direction === 'superlike') {
          return true; // It's a mutual match!
        }
      } else if (isTargetDemo) {
        // Automatic mutual match for demo profiles
        return true;
      }
    }
    return false;
  } catch (error) {
    console.warn("Swipe recording notice:", error);
    // Return true for demo accounts to allow match UI to function even in offline dev state
    return (direction === 'like' || direction === 'superlike') && (targetUserId.startsWith('demo-') || targetUserId.startsWith('current-user-'));
  }
}

export async function createFirestoreMatch(
  user1: UserProfile, 
  user2: UserProfile, 
  compatibilityScore: number
): Promise<string> {
  const matchId = `match_${[user1.id, user2.id].sort().join('_')}`;
  const path = `matches/${matchId}`;
  try {
    await setDoc(doc(db, 'matches', matchId), {
      id: matchId,
      users: [user1.id, user2.id],
      user1Id: user1.id,
      user2Id: user2.id,
      compatibilityScore,
      createdAt: new Date().toISOString(),
    }, { merge: true });
    return matchId;
  } catch (error) {
    console.warn("Match document creation notice:", error);
    return matchId;
  }
}

export async function fetchUserMatches(userId: string): Promise<MatchItem[]> {
  const path = 'matches';
  try {
    const q = query(collection(db, 'matches'), where('users', 'array-contains', userId));
    const snap = await getDocs(q);
    const loadedMatches: MatchItem[] = [];

    for (const d of snap.docs) {
      const data = d.data();
      const otherUserId = (data.users as string[]).find((id) => id !== userId);
      if (otherUserId) {
        const otherProfile = await fetchUserProfile(otherUserId);
        if (otherProfile) {
          loadedMatches.push({
            id: d.id,
            userId: otherUserId,
            user: otherProfile,
            matchedAt: data.createdAt ? 'Recently' : 'Just now',
            compatibilityScore: data.compatibilityScore || 85,
            breakdown: { location: 22, budget: 23, dietary: 15, lifestyle: 18, habits: 10 },
            lastMessage: data.lastMessage,
            lastMessageAt: data.lastMessageAt || 'New match',
            unreadCount: 0,
          });
        }
      }
    }
    return loadedMatches;
  } catch (error) {
    console.warn("fetchUserMatches error:", error);
    return [];
  }
}

export async function sendFirestoreMessage(
  matchId: string, 
  senderId: string, 
  recipientId: string, 
  content: string
): Promise<void> {
  const path = `matches/${matchId}/messages`;
  try {
    await addDoc(collection(db, 'matches', matchId, 'messages'), {
      matchId,
      senderId,
      recipientId,
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
      createdAt: new Date().toISOString(),
    });

    await updateDoc(doc(db, 'matches', matchId), {
      lastMessage: content,
      lastMessageAt: 'Just now',
    });
  } catch (error) {
    console.warn("Message sending notice:", error);
  }
}

export function subscribeToMessages(
  matchId: string, 
  onUpdate: (messages: ChatMessage[]) => void
): () => void {
  const path = `matches/${matchId}/messages`;
  try {
    const q = query(collection(db, 'matches', matchId, 'messages'), orderBy('createdAt', 'asc'));
    return onSnapshot(q, (snapshot) => {
      const msgs: ChatMessage[] = [];
      snapshot.forEach((d) => {
        msgs.push({ id: d.id, ...d.data() } as ChatMessage);
      });
      onUpdate(msgs);
    }, (error) => {
      console.warn("Snapshot subscription notice:", error);
    });
  } catch (err) {
    console.warn("Message subscription fallback:", err);
    return () => {};
  }
}
