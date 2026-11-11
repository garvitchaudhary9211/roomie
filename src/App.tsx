/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, testFirestoreConnection } from './firebase';
import { 
  UserProfile, 
  MatchItem, 
  ChatMessage, 
  FilterSettings, 
  AccommodationListing, 
  CompatibilityResult 
} from './types';
import { 
  CURRENT_USER_DEFAULT, 
  INDIAN_DEMO_PROFILES, 
  INITIAL_MATCHES, 
  INITIAL_MESSAGES, 
  INITIAL_LISTINGS, 
  DEFAULT_FILTERS 
} from './data/mockData';
import { 
  saveUserProfile, 
  fetchUserProfile, 
  fetchAllProfiles, 
  recordSwipe, 
  createFirestoreMatch, 
  sendFirestoreMessage,
  subscribeToMessages,
  fetchUserMatches
} from './services/firestoreService';
import { 
  signOutUser, 
  sendVerificationEmail, 
  reloadCurrentUser 
} from './services/firebaseAuth';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { DiscoverSwipe } from './components/DiscoverSwipe';
import { MutualMatches } from './components/MutualMatches';
import { MessagingView } from './components/MessagingView';
import { UserProfileView } from './components/UserProfileView';
import { PreferencesView } from './components/PreferencesView';
import { VerificationView } from './components/VerificationView';
import { AccommodationDiscovery } from './components/AccommodationDiscovery';
import { OnboardingFlow } from './components/OnboardingFlow';
import { AuthModal } from './components/AuthModal';
import { PhotoUploadModal } from './components/PhotoUploadModal';
import { Mail, RefreshCw, LogIn, Sparkles } from 'lucide-react';

export default function App() {
  const isAutostart = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('autostart') === '1';

  // Navigation tab state
  const [currentTab, setCurrentTab] = useState<string>(isAutostart ? 'discover' : 'landing');

  // Firebase Auth state
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [verificationBannerDismissed, setVerificationBannerDismissed] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(false);
  const [verificationFeedback, setVerificationFeedback] = useState<string | null>(null);

  // Application user state (null when signed out and not in demo mode)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const isDemo = localStorage.getItem('roomie_in_demo_user');
      const saved = localStorage.getItem('roomie_in_user');
      if (saved && (isDemo === '1' || auth.currentUser)) {
        return JSON.parse(saved);
      }
      return null;
    } catch {
      return null;
    }
  });

  const [candidates, setCandidates] = useState<UserProfile[]>(INDIAN_DEMO_PROFILES);
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});
  const [filters, setFilters] = useState<FilterSettings>(DEFAULT_FILTERS);
  const [listings, setListings] = useState<AccommodationListing[]>(INITIAL_LISTINGS);

  // Modals & UI
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [activeChatMatchId, setActiveChatMatchId] = useState<string | undefined>(undefined);

  // 1. Initialize Firestore & Monitor Real Firebase Auth State
  useEffect(() => {
    testFirestoreConnection();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      setAuthLoading(false);

      if (user) {
        // Authenticated real user
        try {
          const profile = await fetchUserProfile(user.uid);
          if (profile) {
            setCurrentUser(profile);
            localStorage.setItem('roomie_in_user', JSON.stringify(profile));
            localStorage.removeItem('roomie_in_demo_user');

            // Load real matches from Firestore
            const realMatches = await fetchUserMatches(user.uid);
            setMatches(realMatches);
          } else {
            // New user without complete profile -> guide to onboarding
            setCurrentTab('onboarding');
          }
        } catch (err) {
          console.warn("User profile fetch notice:", err);
        }
      } else {
        // Logged out
        const isDemo = localStorage.getItem('roomie_in_demo_user');
        if (isDemo !== '1') {
          setCurrentUser(null);
          setMatches([]);
          setMessages({});
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // 2. Load Profiles from Firestore
  useEffect(() => {
    async function loadData() {
      try {
        const loaded = await fetchAllProfiles(currentUser?.id);
        if (loaded && loaded.length > 0) {
          setCandidates(loaded);
        }
      } catch (err) {
        console.warn("Profiles load notice:", err);
      }
    }
    loadData();
  }, [currentUser?.id]);

  // Sync active message subscriptions if in active chat
  useEffect(() => {
    if (!activeChatMatchId) return;
    const unsub = subscribeToMessages(activeChatMatchId, (chatMsgs) => {
      if (chatMsgs.length > 0) {
        setMessages((prev) => ({
          ...prev,
          [activeChatMatchId]: chatMsgs,
        }));
      }
    });
    return () => unsub();
  }, [activeChatMatchId]);

  // Sync currentUser to localStorage
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('roomie_in_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('roomie_in_user');
      }
    } catch (e) {
      console.error(e);
    }
  }, [currentUser]);

  // Swipe & Mutual Matching Handlers with Firestore
  const handleMatchCreated = async (matchedUser: UserProfile, result: CompatibilityResult) => {
    if (!currentUser) return;

    const matchId = `match_${[currentUser.id, matchedUser.id].sort().join('_')}`;

    // Record swipe in Firestore
    await recordSwipe(currentUser.id, matchedUser.id, 'like');

    // Create mutual match document in Firestore
    await createFirestoreMatch(currentUser, matchedUser, result.score);

    if (matches.some((m) => m.userId === matchedUser.id)) return;

    const newMatch: MatchItem = {
      id: matchId,
      userId: matchedUser.id,
      user: matchedUser,
      matchedAt: 'Just now',
      compatibilityScore: result.score,
      breakdown: result.breakdown,
      lastMessage: undefined,
      unreadCount: 0,
    };

    setMatches((prev) => [newMatch, ...prev]);
  };

  const handleSendMessage = async (matchId: string, content: string) => {
    if (!currentUser) return;
    const match = matches.find((m) => m.id === matchId);
    if (!match) return;

    // Send to Firestore
    await sendFirestoreMessage(matchId, currentUser.id, match.userId, content);

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      matchId,
      senderId: currentUser.id,
      recipientId: match.userId,
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
    };

    setMessages((prev) => ({
      ...prev,
      [matchId]: [...(prev[matchId] || []), newMessage],
    }));

    setMatches((prev) =>
      prev.map((m) =>
        m.id === matchId
          ? { ...m, lastMessage: content, lastMessageAt: 'Just now' }
          : m
      )
    );

    // Realistic roommate response simulation for demo accounts
    if (match.user.isDemo) {
      setTimeout(async () => {
        const indianReplies = [
          "Namaste! Thanks for reaching out. Yes, my budget is flexible and I am planning to move around late August.",
          "Hey! Koramangala and HSR are both great for me. Are you looking for a fully furnished 2BHK?",
          "Awesome! Being pure vegetarian and early risers, our routines will match up really well.",
          "Sounds great! Let's definitely do a quick video call to chat through society options.",
        ];
        const randomReply = indianReplies[Math.floor(Math.random() * indianReplies.length)];

        await sendFirestoreMessage(matchId, match.userId, currentUser.id, randomReply);

        const replyMsg: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          matchId,
          senderId: match.userId,
          recipientId: currentUser.id,
          content: randomReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'delivered',
        };

        setMessages((prev) => ({
          ...prev,
          [matchId]: [...(prev[matchId] || []), replyMsg],
        }));

        setMatches((prev) =>
          prev.map((m) =>
            m.id === matchId
              ? { ...m, lastMessage: randomReply, lastMessageAt: 'Just now' }
              : m
          )
        );
      }, 1200);
    }
  };

  const handleUnmatch = (matchId: string) => {
    setMatches((prev) => prev.filter((m) => m.id !== matchId));
    setActiveChatMatchId(undefined);
  };

  const handleBlockReport = (matchId: string, reason: string) => {
    const targetMatch = matches.find((m) => m.id === matchId);
    if (targetMatch) {
      setCandidates((prev) => prev.filter((c) => c.id !== targetMatch.userId));
    }
    setMatches((prev) => prev.filter((m) => m.id !== matchId));
    setActiveChatMatchId(undefined);
  };

  const handleContactApartmentHost = (hostName: string) => {
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }
    const hostProfile = candidates.find((c) => c.name.toLowerCase() === hostName.toLowerCase());
    if (hostProfile) {
      const matchId = `match_${[currentUser.id, hostProfile.id].sort().join('_')}`;
      if (!matches.some((m) => m.id === matchId)) {
        const newMatch: MatchItem = {
          id: matchId,
          userId: hostProfile.id,
          user: hostProfile,
          matchedAt: 'Just now',
          compatibilityScore: 95,
          breakdown: { location: 25, budget: 25, dietary: 15, lifestyle: 20, habits: 10 },
          lastMessage: `Hi ${hostName.split(' ')[0]}! I saw your flat listing on Roomie India and would love to connect.`,
          lastMessageAt: 'Just now',
          unreadCount: 0,
        };
        setMatches((prev) => [newMatch, ...prev]);
        handleSendMessage(matchId, `Hi ${hostName.split(' ')[0]}! I saw your flat listing on Roomie India and would love to connect.`);
      }
      setActiveChatMatchId(matchId);
      setCurrentTab('messages');
    } else {
      setCurrentTab('messages');
    }
  };

  const handleResendEmailVerification = async () => {
    setResendCooldown(true);
    try {
      await sendVerificationEmail();
      setVerificationFeedback("Verification link sent! Check your inbox.");
    } catch (err: any) {
      setVerificationFeedback("Verification email rate-limited. Please wait a moment.");
    }
    setTimeout(() => setResendCooldown(false), 30000);
  };

  const handleCheckEmailVerificationStatus = async () => {
    const refreshed = await reloadCurrentUser();
    if (refreshed?.emailVerified) {
      setVerificationFeedback("Email successfully verified! Full Roommate Discovery unlocked.");
    } else {
      setVerificationFeedback("Email not verified yet. Please check your spam folder or click the verification link in your email.");
    }
  };

  // Fixed Logout: Clears all user identity, matches, cache, and returns to landing
  const handleSignOut = async () => {
    await signOutUser();
    setFirebaseUser(null);
    setCurrentUser(null);
    localStorage.removeItem('roomie_in_user');
    localStorage.removeItem('roomie_in_demo_user');
    setMatches([]);
    setMessages({});
    setActiveChatMatchId(undefined);
    setCurrentTab('landing');
  };

  // Profile photo saved from PhotoUploadModal
  const handlePhotoSavedRoot = async (newPhotoUrl: string) => {
    if (!currentUser) return;
    const updated: UserProfile = {
      ...currentUser,
      photos: [newPhotoUrl, ...(currentUser.photos.slice(1))],
    };
    setCurrentUser(updated);
    await saveUserProfile(updated);
  };

  // Protected route evaluation
  const isEmailUnverified = firebaseUser && !firebaseUser.emailVerified;
  const isProtectedTab = ['discover', 'matches', 'messages', 'profile', 'preferences', 'verification'].includes(currentTab);

  const totalUnread = matches.reduce((sum, m) => sum + (m.unreadCount || 0), 0);

  return (
    <div className="min-h-screen bg-[#111827] text-[#F9FAFB] flex flex-col font-sans">
      {/* Top Email Verification Warning Banner for Authenticated Unverified Users */}
      {isEmailUnverified && !verificationBannerDismissed && (
        <div className="bg-[#263548] border-b border-[#C7F36B]/40 px-4 py-2.5 text-xs text-[#F9FAFB] flex flex-col sm:flex-row items-center justify-between gap-2 z-50">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-[#C7F36B] shrink-0" />
            <span>
              <strong>Verify your email:</strong> We sent a verification link to <strong className="text-[#C7F36B]">{firebaseUser?.email}</strong>. Unverified accounts cannot access roommate discovery.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCheckEmailVerificationStatus}
              className="px-2.5 py-1 rounded-lg bg-[#C7F36B] text-[#111827] font-bold text-[11px] hover:bg-[#b8e859] transition-all"
            >
              Check Status
            </button>
            <button
              onClick={handleResendEmailVerification}
              disabled={resendCooldown}
              className="px-2.5 py-1 rounded-lg bg-[#111827] text-[#F9FAFB] text-[11px] hover:bg-[#111827]/80 disabled:opacity-50 transition-colors"
            >
              {resendCooldown ? 'Sent!' : 'Resend Email'}
            </button>
            <button
              onClick={() => setVerificationBannerDismissed(true)}
              className="text-[#F4F4EC]/60 hover:text-white px-1 text-xs"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Verification Feedback Toast */}
      {verificationFeedback && (
        <div className="bg-[#111827] border-b border-[#263548] px-4 py-2 text-center text-xs text-[#C7F36B] font-semibold animate-fadeIn">
          {verificationFeedback}
        </div>
      )}

      {/* Universal Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          if (!currentUser && ['discover', 'matches', 'messages', 'profile', 'preferences', 'verification'].includes(tab)) {
            setAuthModalOpen(true);
            return;
          }
          setCurrentTab(tab);
          if (tab !== 'messages') setActiveChatMatchId(undefined);
        }}
        currentUser={currentUser}
        matchesCount={matches.length}
        unreadCount={totalUnread}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={handleSignOut}
        onOpenPhotoModal={() => setPhotoModalOpen(true)}
      />

      {/* Main View Router */}
      <main className="flex-1 flex flex-col">
        {/* Unverified Email Gate Protection */}
        {isEmailUnverified && isProtectedTab ? (
          <div className="flex-1 flex items-center justify-center p-6 text-center">
            <div className="max-w-md p-8 rounded-3xl bg-[#263548]/40 border border-[#263548] space-y-4 shadow-2xl">
              <div className="w-16 h-16 rounded-full bg-[#263548] text-[#C7F36B] flex items-center justify-center mx-auto border border-[#C7F36B]/40">
                <Mail className="w-8 h-8" />
              </div>
              <h2 className="font-display font-black text-2xl text-[#F9FAFB]">Email Verification Required</h2>
              <p className="text-xs text-[#F4F4EC]/70 leading-relaxed">
                To protect user safety and prevent fake accounts on Roomie India, email verification is strictly required before accessing roommate discovery and messaging.
              </p>
              <div className="p-3 rounded-2xl bg-[#111827] border border-[#263548] text-xs font-mono text-[#C7F36B]">
                {firebaseUser?.email}
              </div>
              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={handleCheckEmailVerificationStatus}
                  className="w-full py-3 rounded-xl bg-[#C7F36B] text-[#111827] font-display font-bold text-xs hover:bg-[#b8e859] transition-all flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>I&apos;ve Verified My Email</span>
                </button>
                <button
                  onClick={handleResendEmailVerification}
                  disabled={resendCooldown}
                  className="w-full py-2.5 rounded-xl bg-[#263548] text-xs font-semibold text-[#F9FAFB] hover:bg-[#263548]/80 transition-colors"
                >
                  {resendCooldown ? 'Verification Email Resent' : 'Resend Verification Email'}
                </button>
                <button
                  onClick={() => {
                    // Test drive with demo profile
                    setCurrentUser(INDIAN_DEMO_PROFILES[0]);
                    localStorage.setItem('roomie_in_demo_user', '1');
                    setMatches(INITIAL_MATCHES);
                    setMessages(INITIAL_MESSAGES);
                  }}
                  className="text-[11px] text-[#F4F4EC]/60 hover:text-[#C7F36B] pt-2"
                >
                  Or explore with sample college demo profile
                </button>
              </div>
            </div>
          </div>
        ) : !currentUser && isProtectedTab ? (
          /* Sign-In Wall for Guest Visitors Attempting Protected Routes */
          <div className="flex-1 flex items-center justify-center p-6 text-center">
            <div className="max-w-md p-8 rounded-3xl bg-[#263548]/30 border border-[#263548] space-y-4 shadow-2xl">
              <div className="w-16 h-16 rounded-full bg-[#C7F36B] text-[#111827] flex items-center justify-center mx-auto shadow-lg shadow-[#C7F36B]/20">
                <LogIn className="w-8 h-8" />
              </div>
              <h2 className="font-display font-black text-2xl text-[#F9FAFB]">
                Sign In to Roomie
              </h2>
              <p className="text-xs text-[#F4F4EC]/70 leading-relaxed">
                Connect with compatible flatmates across India. Create your profile or test drive using a college demo profile.
              </p>
              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="w-full py-3 rounded-xl bg-[#C7F36B] text-[#111827] font-display font-bold text-xs uppercase tracking-wider hover:bg-[#b8e859] transition-all"
                >
                  Sign In / Register
                </button>
                <button
                  onClick={() => {
                    setCurrentUser(INDIAN_DEMO_PROFILES[0]);
                    localStorage.setItem('roomie_in_demo_user', '1');
                    setMatches(INITIAL_MATCHES);
                    setMessages(INITIAL_MESSAGES);
                    setCurrentTab('discover');
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#263548] text-xs font-semibold text-[#C7F36B] hover:bg-[#263548]/80 transition-colors"
                >
                  Explore as Demo User (Rohit Sharma)
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {currentTab === 'landing' && (
              <LandingPage
                onStartOnboarding={() => {
                  if (!currentUser && !firebaseUser) setAuthModalOpen(true);
                  else setCurrentTab('onboarding');
                }}
                onEnterDiscovery={() => {
                  if (!currentUser) {
                    // Let visitor enter demo discovery
                    setCurrentUser(INDIAN_DEMO_PROFILES[0]);
                    localStorage.setItem('roomie_in_demo_user', '1');
                    setMatches(INITIAL_MATCHES);
                    setMessages(INITIAL_MESSAGES);
                  }
                  setCurrentTab('discover');
                }}
                sampleProfiles={candidates}
              />
            )}

            {currentTab === 'onboarding' && (
              <OnboardingFlow
                initialProfile={currentUser || CURRENT_USER_DEFAULT}
                onComplete={async (newProfile) => {
                  const updated: UserProfile = {
                    ...newProfile,
                    id: firebaseUser ? firebaseUser.uid : newProfile.id,
                    userId: firebaseUser ? firebaseUser.uid : newProfile.id,
                  };
                  setCurrentUser(updated);
                  localStorage.removeItem('roomie_in_demo_user');
                  // Save to Firestore
                  await saveUserProfile(updated);
                  setCandidates((prev) => [updated, ...prev.filter((p) => p.id !== updated.id)]);
                  setCurrentTab('discover');
                }}
                onCancel={() => setCurrentTab('discover')}
              />
            )}

            {currentTab === 'discover' && currentUser && (
              <DiscoverSwipe
                currentUser={currentUser}
                candidates={candidates}
                filters={filters}
                setFilters={setFilters}
                onMatchCreated={handleMatchCreated}
                onNavigateToChat={(userId) => {
                  const matchedItem = matches.find((m) => m.userId === userId);
                  if (matchedItem) {
                    setActiveChatMatchId(matchedItem.id);
                  }
                  setCurrentTab('messages');
                }}
              />
            )}

            {currentTab === 'matches' && (
              <MutualMatches
                matches={matches}
                demoMatches={INITIAL_MATCHES}
                onOpenChat={(userId) => {
                  const matchedItem = [...matches, ...INITIAL_MATCHES].find((m) => m.userId === userId);
                  if (matchedItem) {
                    setActiveChatMatchId(matchedItem.id);
                    if (!matches.some(m => m.id === matchedItem.id)) {
                      setMatches(prev => [matchedItem, ...prev]);
                    }
                  }
                  setCurrentTab('messages');
                }}
                onExploreDiscovery={() => setCurrentTab('discover')}
              />
            )}

            {currentTab === 'messages' && currentUser && (
              <MessagingView
                currentUser={currentUser}
                matches={matches.length > 0 ? matches : INITIAL_MATCHES}
                messages={Object.keys(messages).length > 0 ? messages : INITIAL_MESSAGES}
                activeMatchId={activeChatMatchId}
                onSendMessage={handleSendMessage}
                onUnmatch={handleUnmatch}
                onBlockReport={handleBlockReport}
              />
            )}

            {currentTab === 'profile' && currentUser && (
              <UserProfileView
                currentUser={currentUser}
                onUpdateProfile={async (updated) => {
                  setCurrentUser(updated);
                  await saveUserProfile(updated);
                }}
                onNavigateToVerification={() => setCurrentTab('verification')}
              />
            )}

            {currentTab === 'preferences' && (
              <PreferencesView
                filters={filters}
                setFilters={setFilters}
                onResetDemoData={() => {
                  setFilters(DEFAULT_FILTERS);
                }}
              />
            )}

            {currentTab === 'verification' && currentUser && (
              <VerificationView
                currentUser={currentUser}
                onVerificationComplete={async () => {
                  const verified: UserProfile = {
                    ...currentUser,
                    isVerified: true,
                    verificationMethod: 'selfie_id',
                  };
                  setCurrentUser(verified);
                  await saveUserProfile(verified);
                }}
              />
            )}

            {currentTab === 'accommodations' && (
              <AccommodationDiscovery
                listings={listings}
                currentUser={currentUser || CURRENT_USER_DEFAULT}
                onContactHost={handleContactApartmentHost}
                onAddNewListing={(newListing) => setListings((prev) => [newListing, ...prev])}
              />
            )}
          </>
        )}
      </main>

      {/* Real Firebase Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={(uid, email) => {
          setAuthModalOpen(false);
          setCurrentTab('discover');
        }}
        onLoginAsDemoProfile={(profile) => {
          setCurrentUser(profile);
          localStorage.setItem('roomie_in_demo_user', '1');
          localStorage.setItem('roomie_in_user', JSON.stringify(profile));
          setMatches(INITIAL_MATCHES);
          setMessages(INITIAL_MESSAGES);
          setAuthModalOpen(false);
          setCurrentTab('discover');
        }}
        onLaunchNewOnboarding={() => {
          setAuthModalOpen(false);
          setCurrentTab('onboarding');
        }}
      />

      {/* Global Photo Upload Modal accessible from Navbar and Profile */}
      {currentUser && (
        <PhotoUploadModal
          isOpen={photoModalOpen}
          onClose={() => setPhotoModalOpen(false)}
          currentPhotoUrl={currentUser.photos[0]}
          onPhotoSaved={handlePhotoSavedRoot}
        />
      )}
    </div>
  );
}
