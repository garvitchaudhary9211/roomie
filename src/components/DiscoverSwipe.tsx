import React, { useState, useEffect } from 'react';
import { 
  motion, 
  useMotionValue, 
  useTransform, 
  AnimatePresence 
} from 'motion/react';
import { 
  Heart, 
  X, 
  Star, 
  RotateCcw, 
  SlidersHorizontal, 
  ShieldCheck, 
  MapPin, 
  Utensils, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react';
import { UserProfile, FilterSettings, CompatibilityResult, INDIAN_CITIES } from '../types';
import { calculateCompatibility, passesHardFilters } from '../utils/matching';

interface DiscoverSwipeProps {
  currentUser: UserProfile;
  candidates: UserProfile[];
  filters: FilterSettings;
  setFilters: React.Dispatch<React.SetStateAction<FilterSettings>>;
  onMatchCreated: (matchedUser: UserProfile, result: CompatibilityResult) => Promise<void> | void;
  onNavigateToChat: (userId: string) => void;
}

export const DiscoverSwipe: React.FC<DiscoverSwipeProps> = ({
  currentUser,
  candidates,
  filters,
  setFilters,
  onMatchCreated,
  onNavigateToChat,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | 'up' | null>(null);
  const [history, setHistory] = useState<{ candidate: UserProfile; action: 'like' | 'pass' | 'superlike' }[]>([]);

  // Modals & Drawers
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showMatchModal, setShowMatchModal] = useState<UserProfile | null>(null);

  // Motion values for gesture tracking
  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);

  // Rotation while dragging: -250px to 250px -> -16deg to 16deg
  const cardRotate = useTransform(dragX, [-260, 0, 260], [-16, 0, 16]);

  // Dynamic Opacity for stamps
  const likeOpacity = useTransform(dragX, [25, 120], [0, 1]);
  const passOpacity = useTransform(dragX, [-25, -120], [0, 1]);
  const superLikeOpacity = useTransform(dragY, [-25, -100], [0, 1]);

  // Next card scale and opacity underneath
  const nextCardScale = useTransform(dragX, [-200, 0, 200], [1, 0.95, 1]);
  const nextCardOpacity = useTransform(dragX, [-200, 0, 200], [0.95, 0.7, 0.95]);

  // Filter candidates using hard filters
  const eligibleCandidates = candidates.filter((c) =>
    c.id !== currentUser.id && passesHardFilters(c, filters, currentUser)
  );

  const currentCandidate: UserProfile | undefined = eligibleCandidates[currentIndex];
  const nextCandidate: UserProfile | undefined = eligibleCandidates[currentIndex + 1];

  const compatibility: CompatibilityResult | null = currentCandidate
    ? calculateCompatibility(currentUser, currentCandidate)
    : null;

  // Haptic feedback helper
  const triggerHaptic = (duration = 15) => {
    try {
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(duration);
      }
    } catch {
      // Ignore vibration error on unsupported platforms
    }
  };

  const handleSwipe = (direction: 'left' | 'right' | 'up') => {
    if (!currentCandidate || !compatibility) return;

    triggerHaptic(direction === 'right' ? 25 : 15);
    setExitDirection(direction);

    // Save history for undo/rewind
    const action = direction === 'right' ? 'like' : direction === 'up' ? 'superlike' : 'pass';
    setHistory((prev) => [...prev, { candidate: currentCandidate, action }]);

    const isMatch = direction === 'right' || direction === 'up';
    const targetCandidate = currentCandidate;

    setTimeout(() => {
      if (isMatch) {
        onMatchCreated(targetCandidate, compatibility);
        setShowMatchModal(targetCandidate);
      }

      setCurrentIndex((prev) => prev + 1);
      setPhotoIndex(0);
      setExitDirection(null);
      dragX.set(0);
      dragY.set(0);
    }, 280);
  };

  // Drag End handler with threshold detection
  const handleDragEnd = (_: any, info: { offset: { x: number; y: number } }) => {
    const swipeThreshold = 100;
    const verticalThreshold = -120;

    if (info.offset.y < verticalThreshold) {
      handleSwipe('up');
    } else if (info.offset.x > swipeThreshold) {
      handleSwipe('right');
    } else if (info.offset.x < -swipeThreshold) {
      handleSwipe('left');
    } else {
      // Revert to center smoothly
      dragX.set(0);
      dragY.set(0);
    }
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is inside an input or modal is open
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
      if (showFilterDrawer || showDetailsModal || showMatchModal) return;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleSwipe('right');
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleSwipe('left');
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        handleSwipe('up');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentCandidate, compatibility, showFilterDrawer, showDetailsModal, showMatchModal]);

  const handleUndo = () => {
    if (currentIndex > 0 && history.length > 0) {
      triggerHaptic(10);
      setCurrentIndex((prev) => prev - 1);
      setHistory((prev) => prev.slice(0, -1));
      setPhotoIndex(0);
    }
  };

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentCandidate && photoIndex < currentCandidate.photos.length - 1) {
      setPhotoIndex((prev) => prev + 1);
    } else {
      setPhotoIndex(0);
    }
  };

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentCandidate && photoIndex > 0) {
      setPhotoIndex((prev) => prev - 1);
    } else if (currentCandidate) {
      setPhotoIndex(currentCandidate.photos.length - 1);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#111827] text-[#F9FAFB] py-4 px-4 flex flex-col items-center justify-center relative overflow-hidden select-none">
      
      {/* Top Filter Bar */}
      <div className="w-full max-w-md mb-3 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <span className="font-display font-black text-lg text-[#F9FAFB]">Roommate Radar</span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#263548] text-[#C7F36B] font-bold">
            {eligibleCandidates.length - currentIndex > 0
              ? `${eligibleCandidates.length - currentIndex} in ${filters.destinationCity}`
              : 'All viewed'}
          </span>
        </div>

        <button
          onClick={() => setShowFilterDrawer(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#263548] hover:bg-[#263548]/80 text-[#F9FAFB] text-xs font-semibold border border-[#263548] hover:border-[#C7F36B]/40 transition-colors"
          aria-label="Filter preferences"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#C7F36B]" />
          <span>Filters</span>
          {(filters.gender !== 'any' || filters.mustBeVerified || filters.dietaryPreference !== 'all') && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#C7F36B]" />
          )}
        </button>
      </div>

      {/* Main Swipe Deck Container */}
      {currentCandidate && compatibility ? (
        <div className="w-full max-w-md relative flex items-center justify-center min-h-[580px]">
          
          {/* UNDERNEATH CARD (STACK DEPTH EFFECT) */}
          {nextCandidate && (
            <motion.div
              style={{
                scale: nextCardScale,
                opacity: nextCardOpacity,
              }}
              className="absolute inset-x-0 mx-auto rounded-3xl overflow-hidden bg-[#263548] border border-[#263548] shadow-xl pointer-events-none translate-y-3"
            >
              <div className="relative h-[440px] sm:h-[470px] w-full bg-[#111827]">
                <img
                  src={nextCandidate.photos[0]}
                  alt={nextCandidate.name}
                  className="w-full h-full object-cover filter brightness-75"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-transparent" />
                <div className="absolute bottom-4 left-5">
                  <h3 className="font-display font-bold text-xl text-[#F9FAFB]">
                    {nextCandidate.name}, {nextCandidate.age}
                  </h3>
                  <p className="text-xs text-[#F4F4EC]/60">{nextCandidate.destinationCity}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* ACTIVE SWIPEABLE CARD */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentCandidate.id}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.7}
              style={{
                x: dragX,
                rotate: cardRotate,
              }}
              onDragEnd={handleDragEnd}
              animate={
                exitDirection === 'right'
                  ? { x: 500, rotate: 25, opacity: 0 }
                  : exitDirection === 'left'
                  ? { x: -500, rotate: -25, opacity: 0 }
                  : exitDirection === 'up'
                  ? { y: -500, scale: 0.9, opacity: 0 }
                  : { x: 0, y: 0, rotate: 0, opacity: 1 }
              }
              transition={{ type: 'spring', stiffness: 320, damping: 24 }}
              className="relative w-full rounded-3xl overflow-hidden bg-[#263548] border border-[#263548] shadow-2xl cursor-grab active:cursor-grabbing z-20"
            >
              
              {/* DYNAMIC STAMPS (LIKE / PASS / SUPERLIKE) */}
              <motion.div
                style={{ opacity: likeOpacity }}
                className="absolute top-10 left-6 z-40 px-5 py-2 border-4 border-[#C7F36B] rounded-2xl bg-[#111827]/90 text-[#C7F36B] font-display font-black text-2xl uppercase tracking-wider rotate-[-15deg] shadow-2xl pointer-events-none"
              >
                LIKE
              </motion.div>

              <motion.div
                style={{ opacity: passOpacity }}
                className="absolute top-10 right-6 z-40 px-5 py-2 border-4 border-rose-500 rounded-2xl bg-[#111827]/90 text-rose-500 font-display font-black text-2xl uppercase tracking-wider rotate-[15deg] shadow-2xl pointer-events-none"
              >
                PASS
              </motion.div>

              <motion.div
                style={{ opacity: superLikeOpacity }}
                className="absolute top-10 inset-x-0 mx-auto w-max z-40 px-5 py-2 border-4 border-amber-400 rounded-2xl bg-[#111827]/90 text-amber-400 font-display font-black text-2xl uppercase tracking-wider shadow-2xl pointer-events-none"
              >
                SUPER LIKE
              </motion.div>

              {/* Card Photo & Carousel */}
              <div className="relative h-[440px] sm:h-[470px] w-full bg-[#111827]">
                <img
                  src={currentCandidate.photos[photoIndex] || currentCandidate.photos[0]}
                  alt={currentCandidate.name}
                  className="w-full h-full object-cover pointer-events-none"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-[#111827]/30 to-transparent pointer-events-none" />

                {/* Photo Carousel Indicators */}
                {currentCandidate.photos.length > 1 && (
                  <div className="absolute top-3 inset-x-3 flex gap-1.5 z-20 pointer-events-none">
                    {currentCandidate.photos.map((_, idx) => (
                      <div
                        key={idx}
                        className={`h-1 flex-1 rounded-full transition-all ${
                          idx === photoIndex ? 'bg-[#C7F36B]' : 'bg-white/30'
                        }`}
                      />
                    ))}
                  </div>
                )}

                {/* Photo Click Tap Zones */}
                <button
                  type="button"
                  onClick={handlePrevPhoto}
                  className="absolute inset-y-0 left-0 w-1/3 z-20 focus:outline-none flex items-center justify-start pl-2 opacity-0 hover:opacity-100 transition-opacity"
                  aria-label="Previous photo"
                >
                  <div className="w-8 h-8 rounded-full bg-[#111827]/70 flex items-center justify-center text-white">
                    <ChevronLeft className="w-5 h-5" />
                  </div>
                </button>
                <button
                  type="button"
                  onClick={handleNextPhoto}
                  className="absolute inset-y-0 right-0 w-1/3 z-20 focus:outline-none flex items-center justify-end pr-2 opacity-0 hover:opacity-100 transition-opacity"
                  aria-label="Next photo"
                >
                  <div className="w-8 h-8 rounded-full bg-[#111827]/70 flex items-center justify-center text-white">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </button>

                {/* Badges Overlay */}
                <div className="absolute top-6 left-4 flex flex-col gap-1.5 z-20 pointer-events-none">
                  {currentCandidate.isVerified && (
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#111827]/90 backdrop-blur-md border border-[#C7F36B]/50 text-[11px] font-semibold text-[#C7F36B] shadow-md">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Verified</span>
                    </div>
                  )}
                  {currentCandidate.isDemo && (
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#263548]/90 text-[10px] font-medium text-[#F4F4EC]/80 border border-[#263548]">
                      <span>Sample Demo Profile</span>
                    </div>
                  )}
                </div>

                {/* Compatibility Score Pill */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDetailsModal(true);
                  }}
                  className="absolute top-6 right-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#111827]/90 backdrop-blur-md border border-[#C7F36B] text-xs font-black text-[#C7F36B] hover:scale-105 transition-transform shadow-lg shadow-[#C7F36B]/20"
                  title="View full lifestyle compatibility breakdown"
                >
                  <Sparkles className="w-3.5 h-3.5 fill-[#C7F36B]" />
                  <span>{compatibility.score}% Match</span>
                </button>

                {/* Bottom Card Content */}
                <div className="absolute bottom-0 inset-x-0 p-5 text-left z-20 pointer-events-none">
                  <div className="flex items-baseline justify-between">
                    <div className="flex items-baseline gap-2">
                      <h2 className="text-2xl font-black font-display text-[#F9FAFB]">
                        {currentCandidate.name}
                      </h2>
                      <span className="text-lg font-medium text-[#F4F4EC]/80">{currentCandidate.age}</span>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-lg bg-[#C7F36B] text-[#111827] font-black">
                      ₹{currentCandidate.budgetMin.toLocaleString('en-IN')}–₹{currentCandidate.budgetMax.toLocaleString('en-IN')}/mo
                    </span>
                  </div>

                  <p className="text-xs text-[#F4F4EC]/80 mt-1 font-medium flex items-center gap-1.5">
                    <span>{currentCandidate.occupation}</span>
                    {currentCandidate.collegeOrCompany && <span>({currentCandidate.collegeOrCompany})</span>}
                    <span>•</span>
                    <MapPin className="w-3 h-3 text-[#C7F36B]" />
                    <span>{currentCandidate.locality || currentCandidate.destinationCity}</span>
                  </p>

                  {/* Highlights */}
                  {compatibility.highlights.length > 0 && (
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-[#C7F36B] font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{compatibility.highlights[0]}</span>
                    </div>
                  )}

                  {/* Lifestyle pills */}
                  <div className="mt-2.5 flex flex-wrap gap-1.5 pointer-events-auto">
                    {currentCandidate.lifestyle?.dietaryPreference && (
                      <span className="px-2 py-0.5 rounded-md bg-[#111827]/85 text-[11px] font-bold text-[#C7F36B] border border-[#C7F36B]/40 flex items-center gap-1">
                        <Utensils className="w-3 h-3" />
                        {currentCandidate.lifestyle.dietaryPreference === 'vegetarian' ? 'Pure Veg' : currentCandidate.lifestyle.dietaryPreference === 'eggetarian' ? 'Eggetarian' : 'Non-Veg'}
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-md bg-[#111827]/85 text-[11px] font-medium text-[#F9FAFB] border border-[#263548]">
                      {currentCandidate.lifestyle?.sleepSchedule === 'early_bird' ? 'Early Bird' : 'Night Owl'}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-[#111827]/85 text-[11px] font-medium text-[#F9FAFB] border border-[#263548]">
                      {currentCandidate.lifestyle?.cleanliness === 'tidy_freak' ? 'Tidy' : 'Moderate'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowDetailsModal(true)}
                      className="px-2 py-0.5 rounded-md bg-[#C7F36B]/20 text-[11px] font-bold text-[#C7F36B] border border-[#C7F36B]/40 hover:bg-[#C7F36B]/30 transition-colors"
                    >
                      + View DNA
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Interactive Controls */}
              <div className="p-3.5 bg-[#111827] flex items-center justify-between px-8 border-t border-[#263548]">
                {/* Rewind / Undo */}
                <button
                  type="button"
                  onClick={handleUndo}
                  disabled={currentIndex === 0}
                  className="w-10 h-10 rounded-full bg-[#263548] text-[#F4F4EC]/60 hover:text-[#F9FAFB] hover:bg-[#263548]/80 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all shadow-md focus:outline-none"
                  aria-label="Undo previous swipe"
                  title="Undo previous swipe"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                {/* Pass (Swipe Left) */}
                <button
                  type="button"
                  onClick={() => handleSwipe('left')}
                  className="w-13 h-13 rounded-full bg-[#263548] text-rose-400 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-all transform hover:scale-110 active:scale-95 shadow-lg shadow-rose-950/40 focus:outline-none"
                  aria-label="Pass (Left)"
                  title="Pass on candidate (Left Arrow)"
                >
                  <X className="w-6 h-6" />
                </button>

                {/* Super Like (Swipe Up) */}
                <button
                  type="button"
                  onClick={() => handleSwipe('up')}
                  className="w-10 h-10 rounded-full bg-[#263548] text-amber-400 hover:bg-amber-400 hover:text-[#111827] flex items-center justify-center transition-all transform hover:scale-110 active:scale-95 shadow-md focus:outline-none"
                  aria-label="Super Like (Up)"
                  title="Super Like candidate (Up Arrow)"
                >
                  <Star className="w-4 h-4 fill-current" />
                </button>

                {/* Match / Like (Swipe Right) */}
                <button
                  type="button"
                  onClick={() => handleSwipe('right')}
                  className="w-13 h-13 rounded-full bg-[#C7F36B] text-[#111827] hover:bg-[#b8e859] flex items-center justify-center transition-all transform hover:scale-110 active:scale-95 shadow-xl shadow-[#C7F36B]/30 focus:outline-none"
                  aria-label="Like and Match (Right)"
                  title="Like and Match candidate (Right Arrow)"
                >
                  <Heart className="w-6 h-6 fill-[#111827]" />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      ) : (
        /* Empty Deck State */
        <div className="w-full max-w-md p-8 rounded-3xl bg-[#263548]/40 border border-[#263548] text-center space-y-4 shadow-2xl z-10">
          <div className="w-16 h-16 rounded-full bg-[#263548] text-[#C7F36B] flex items-center justify-center mx-auto border border-[#C7F36B]/30">
            <Sparkles className="w-8 h-8 fill-[#C7F36B]" />
          </div>
          <h3 className="font-display font-bold text-2xl text-[#F9FAFB]">
            {eligibleCandidates.length === 0
              ? `No candidates match filters in ${filters.destinationCity}`
              : `You've viewed all candidates in ${filters.destinationCity}!`}
          </h3>
          <p className="text-xs text-[#F4F4EC]/70 max-w-xs mx-auto">
            {eligibleCandidates.length === 0
              ? 'Try broadening your budget range in ₹ INR, relaxing gender constraints, or switching destination cities.'
              : 'Broaden your rent budget in ₹ INR, expand destination cities, or reset the deck to review candidates again.'}
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => {
                setCurrentIndex(0);
                setHistory([]);
              }}
              className="w-full py-3 rounded-xl bg-[#C7F36B] text-[#111827] font-display font-bold text-xs hover:bg-[#b8e859] transition-all shadow-md shadow-[#C7F36B]/20"
            >
              Reset Deck & Review Again
            </button>
            <button
              type="button"
              onClick={() => setShowFilterDrawer(true)}
              className="w-full py-3 rounded-xl bg-[#263548] text-[#F9FAFB] text-xs font-semibold hover:bg-[#263548]/80 transition-colors"
            >
              Adjust Indian Filters
            </button>
          </div>
        </div>
      )}

      {/* FILTER DRAWER / MODAL */}
      {showFilterDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111827]/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md bg-[#111827] border border-[#263548] rounded-3xl p-6 shadow-2xl space-y-5 text-[#F9FAFB] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#263548]">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-[#C7F36B]" />
                <h3 className="font-display font-bold text-lg text-[#F9FAFB]">Discovery Filters (India)</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowFilterDrawer(false)}
                className="p-1 rounded-lg text-[#F4F4EC]/60 hover:text-white"
                aria-label="Close filters"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Same-gender Roommate Hard Filter */}
            <div>
              <label className="block text-xs font-bold text-[#C7F36B] uppercase mb-1.5">
                Roommate Gender (Same-Gender Restriction Default)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'male', label: 'Men Only' },
                  { id: 'female', label: 'Women Only' },
                  { id: 'any', label: 'All Genders' },
                ].map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setFilters({ ...filters, gender: g.id as any })}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border ${
                      filters.gender === g.id
                        ? 'bg-[#C7F36B] text-[#111827] border-[#C7F36B]'
                        : 'bg-[#263548]/50 text-[#F9FAFB] border-[#263548]'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Destination Indian City */}
            <div>
              <label className="block text-xs font-bold text-[#C7F36B] uppercase mb-1.5">
                Destination City (India)
              </label>
              <select
                value={filters.destinationCity}
                onChange={(e) => setFilters({ ...filters, destinationCity: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#263548] border border-[#263548] text-xs text-[#F9FAFB] focus:outline-none focus:border-[#C7F36B]"
              >
                <option value="all">All Indian Cities</option>
                {INDIAN_CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Food / Dietary Preference */}
            <div>
              <label className="block text-xs font-bold text-[#C7F36B] uppercase mb-1.5">
                Dietary Preference
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'all', label: 'All Diets' },
                  { id: 'vegetarian', label: 'Pure Veg Only' },
                ].map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setFilters({ ...filters, dietaryPreference: d.id })}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border ${
                      filters.dietaryPreference === d.id
                        ? 'bg-[#C7F36B] text-[#111827] border-[#C7F36B]'
                        : 'bg-[#263548]/50 text-[#F9FAFB] border-[#263548]'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Budget Range in INR */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-[#C7F36B] uppercase">Rent Budget (₹ INR)</label>
                <span className="text-xs font-bold text-[#F9FAFB]">
                  ₹{filters.budgetRange[0].toLocaleString('en-IN')} – ₹{filters.budgetRange[1].toLocaleString('en-IN')}/mo
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-[#F4F4EC]/60">Min (₹)</span>
                  <input
                    type="number"
                    step={1000}
                    value={filters.budgetRange[0]}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        budgetRange: [Number(e.target.value), filters.budgetRange[1]],
                      })
                    }
                    className="w-full px-3 py-1.5 rounded-lg bg-[#263548] border border-[#263548] text-xs text-[#F9FAFB]"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-[#F4F4EC]/60">Max (₹)</span>
                  <input
                    type="number"
                    step={1000}
                    value={filters.budgetRange[1]}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        budgetRange: [filters.budgetRange[0], Number(e.target.value)],
                      })
                    }
                    className="w-full px-3 py-1.5 rounded-lg bg-[#263548] border border-[#263548] text-xs text-[#F9FAFB]"
                  />
                </div>
              </div>
            </div>

            {/* Age Range */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-[#C7F36B] uppercase">Age Range</label>
                <span className="text-xs font-bold text-[#F9FAFB]">
                  {filters.ageRange[0]} – {filters.ageRange[1]} years
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  min={18}
                  max={60}
                  value={filters.ageRange[0]}
                  onChange={(e) => setFilters({ ...filters, ageRange: [Number(e.target.value), filters.ageRange[1]] })}
                  className="w-full px-3 py-1.5 rounded-lg bg-[#263548] border border-[#263548] text-xs text-[#F9FAFB]"
                />
                <input
                  type="number"
                  min={18}
                  max={60}
                  value={filters.ageRange[1]}
                  onChange={(e) => setFilters({ ...filters, ageRange: [filters.ageRange[0], Number(e.target.value)] })}
                  className="w-full px-3 py-1.5 rounded-lg bg-[#263548] border border-[#263548] text-xs text-[#F9FAFB]"
                />
              </div>
            </div>

            {/* Verified only */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#263548]/40 border border-[#263548]">
              <div>
                <p className="text-xs font-semibold text-[#F9FAFB]">Verified Profiles Only</p>
                <p className="text-[10px] text-[#F4F4EC]/60">Only show users with completed ID/selfie verification</p>
              </div>
              <button
                type="button"
                onClick={() => setFilters({ ...filters, mustBeVerified: !filters.mustBeVerified })}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  filters.mustBeVerified ? 'bg-[#C7F36B]' : 'bg-[#263548]'
                }`}
              >
                <div
                  className={`bg-[#111827] w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    filters.mustBeVerified ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowFilterDrawer(false)}
              className="w-full py-3 rounded-xl bg-[#C7F36B] text-[#111827] font-display font-bold text-xs hover:bg-[#b8e859] transition-all"
            >
              Apply Indian Filters
            </button>
          </div>
        </div>
      )}

      {/* DETAILED PROFILE & COMPATIBILITY MODAL */}
      {showDetailsModal && currentCandidate && compatibility && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111827]/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg bg-[#111827] border border-[#263548] rounded-3xl p-6 shadow-2xl text-[#F9FAFB] max-h-[85vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#263548]">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-bold text-xl text-[#F9FAFB]">
                    {currentCandidate.name}, {currentCandidate.age}
                  </h3>
                  {currentCandidate.isDemo && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#263548] text-[#C7F36B] font-medium">
                      Sample Profile
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#F4F4EC]/60">
                  {currentCandidate.occupation} • {currentCandidate.collegeOrCompany}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowDetailsModal(false)}
                className="p-1 rounded-lg text-[#F4F4EC]/60 hover:text-white"
                aria-label="Close candidate details"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Compatibility Scorecard Breakdown */}
            <div className="p-4 rounded-2xl bg-[#263548]/40 border border-[#C7F36B]/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#C7F36B] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 fill-[#C7F36B]" />
                  <span>Lifestyle Compatibility Score</span>
                </span>
                <span className="font-display text-xl font-black text-[#C7F36B]">
                  {compatibility.score}%
                </span>
              </div>

              {/* Progress bars */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-[#F4F4EC]/70">Location Alignment</span>
                    <span className="font-bold text-[#F9FAFB]">{compatibility.breakdown.location}/25</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#263548]">
                    <div
                      className="h-full rounded-full bg-[#C7F36B]"
                      style={{ width: `${(compatibility.breakdown.location / 25) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-[#F4F4EC]/70">Rent Budget Fit</span>
                    <span className="font-bold text-[#F9FAFB]">{compatibility.breakdown.budget}/25</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#263548]">
                    <div
                      className="h-full rounded-full bg-[#C7F36B]"
                      style={{ width: `${(compatibility.breakdown.budget / 25) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-[#F4F4EC]/70">Food & Diet</span>
                    <span className="font-bold text-[#F9FAFB]">{compatibility.breakdown.dietary}/15</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#263548]">
                    <div
                      className="h-full rounded-full bg-[#C7F36B]"
                      style={{ width: `${(compatibility.breakdown.dietary / 15) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-[#F4F4EC]/70">Sleep & Cleanliness</span>
                    <span className="font-bold text-[#F9FAFB]">{compatibility.breakdown.lifestyle}/20</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#263548]">
                    <div
                      className="h-full rounded-full bg-[#C7F36B]"
                      style={{ width: `${(compatibility.breakdown.lifestyle / 20) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Highlights & Cautions */}
              <div className="pt-2 space-y-1.5 border-t border-[#263548]">
                {compatibility.highlights.map((h, i) => (
                  <p key={i} className="text-xs text-[#C7F36B] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 shrink-0" />
                    <span>{h}</span>
                  </p>
                ))}
                {compatibility.cautions.map((c, i) => (
                  <p key={i} className="text-xs text-amber-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                    <span>{c}</span>
                  </p>
                ))}
              </div>
            </div>

            {/* Bio */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#F4F4EC]/60 mb-1.5">About</h4>
              <p className="text-xs text-[#F9FAFB]/90 leading-relaxed bg-[#263548]/30 p-3 rounded-xl border border-[#263548]">
                {currentCandidate.bio}
              </p>
            </div>

            {/* Dealbreakers */}
            {currentCandidate.dealBreakers.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-300 mb-1.5">Strict Deal-Breakers</h4>
                <div className="flex flex-wrap gap-1.5">
                  {currentCandidate.dealBreakers.map((d, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-200">
                      ✕ {d}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDetailsModal(false);
                  handleSwipe('left');
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#263548] text-rose-300 text-xs font-bold hover:bg-rose-500 hover:text-white transition-colors"
              >
                Pass
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDetailsModal(false);
                  handleSwipe('right');
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#C7F36B] text-[#111827] text-xs font-display font-bold hover:bg-[#b8e859] transition-all shadow-md shadow-[#C7F36B]/20"
              >
                Like & Match
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IT'S A MATCH CELEBRATION MODAL */}
      {showMatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111827]/90 backdrop-blur-lg animate-fadeIn">
          <div className="w-full max-w-sm bg-[#111827] border border-[#C7F36B]/60 rounded-3xl p-6 sm:p-8 text-center shadow-2xl shadow-[#C7F36B]/15 space-y-5">
            <div className="space-y-2">
              <span className="inline-block px-3 py-1 rounded-full bg-[#C7F36B] text-[#111827] text-xs font-bold uppercase tracking-widest animate-pulse">
                Mutual Like!
              </span>
              <h2 className="font-display font-black text-3xl sm:text-4xl text-[#F9FAFB] tracking-tight">
                It&apos;s a Match!
              </h2>
              <p className="text-xs text-[#F4F4EC]/70">
                You and <strong className="text-[#C7F36B]">{showMatchModal.name}</strong> both liked each other for flat hunting in {showMatchModal.destinationCity}.
              </p>
            </div>

            {/* Dual Avatars */}
            <div className="flex items-center justify-center -space-x-4 py-2">
              <div className="w-20 h-20 rounded-full border-4 border-[#C7F36B] overflow-hidden shadow-xl z-10">
                <img
                  src={currentUser.photos[0]}
                  alt={currentUser.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="w-20 h-20 rounded-full border-4 border-[#C7F36B] overflow-hidden shadow-xl z-20">
                <img
                  src={showMatchModal.photos[0]}
                  alt={showMatchModal.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  const targetId = showMatchModal.id;
                  setShowMatchModal(null);
                  onNavigateToChat(targetId);
                }}
                className="w-full py-3 rounded-xl bg-[#C7F36B] hover:bg-[#b8e859] text-[#111827] font-display font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-transform hover:scale-102 shadow-lg shadow-[#C7F36B]/25"
              >
                <span>Send First Message</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setShowMatchModal(null)}
                className="w-full py-2.5 rounded-xl bg-[#263548] hover:bg-[#263548]/80 text-[#F9FAFB] text-xs font-semibold transition-colors"
              >
                Keep Swiping
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
