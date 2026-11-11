import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Heart, 
  X, 
  Flame, 
  Building2, 
  Moon, 
  Utensils, 
  Coffee 
} from 'lucide-react';
import { UserProfile } from '../types';

interface LandingPageProps {
  onStartOnboarding: () => void;
  onEnterDiscovery: () => void;
  sampleProfiles: UserProfile[];
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartOnboarding,
  onEnterDiscovery,
  sampleProfiles,
}) => {
  const [sampleIndex, setSampleIndex] = useState(0);
  const [swipedState, setSwipedState] = useState<'liked' | 'passed' | null>(null);

  const currentSample = sampleProfiles[sampleIndex % sampleProfiles.length];

  const handleInteractiveSwipe = (direction: 'left' | 'right') => {
    setSwipedState(direction === 'right' ? 'liked' : 'passed');
    setTimeout(() => {
      setSampleIndex((prev) => prev + 1);
      setSwipedState(null);
    }, 450);
  };

  return (
    <div className="min-h-screen bg-[#111827] text-[#F9FAFB] overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative pt-10 pb-20 lg:pt-16 lg:pb-28 overflow-hidden border-b border-[#263548]">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#26354815_1px,transparent_1px),linear-gradient(to_bottom,#26354815_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            
            {/* Left Column: Editorial Headline & Value Prop */}
            <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#263548] border border-[#C7F36B]/30 text-xs font-semibold text-[#C7F36B]">
                <Sparkles className="w-3.5 h-3.5 fill-[#C7F36B]" />
                <span>India&apos;s Tinder-Inspired Roommate Discovery Platform</span>
              </div>

              <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#F9FAFB] leading-[1.08]">
                Find your people. <br />
                <span className="text-[#C7F36B]">Own your space.</span>
              </h1>

              <p className="text-base sm:text-lg text-[#F4F4EC]/80 font-normal max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                A better roommate isn&apos;t just someone who shares rent. It&apos;s someone who shares your lifestyle, dietary preferences, sleep schedule, and cleanliness.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={onStartOnboarding}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#C7F36B] hover:bg-[#b8e859] text-[#111827] font-display font-bold text-sm transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg shadow-[#C7F36B]/25 flex items-center justify-center gap-2 group"
                >
                  <span>Register & Find Flatmates</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={onEnterDiscovery}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#263548] hover:bg-[#263548]/80 text-[#F9FAFB] font-semibold text-sm border border-[#263548] transition-colors flex items-center justify-center gap-2"
                >
                  <Flame className="w-4 h-4 text-[#C7F36B]" />
                  <span>Try Interactive Swiper</span>
                </button>
              </div>

              {/* Trust & Proof Metrics */}
              <div className="pt-6 border-t border-[#263548] grid grid-cols-3 gap-6 max-w-lg mx-auto lg:mx-0 text-left">
                <div>
                  <p className="font-display text-2xl sm:text-3xl font-extrabold text-[#C7F36B]">96%</p>
                  <p className="text-xs text-[#F4F4EC]/60 mt-1">Lifestyle Compatibility</p>
                </div>
                <div>
                  <p className="font-display text-2xl sm:text-3xl font-extrabold text-[#F9FAFB]">13+</p>
                  <p className="text-xs text-[#F4F4EC]/60 mt-1">Indian Tech Metros</p>
                </div>
                <div>
                  <p className="font-display text-2xl sm:text-3xl font-extrabold text-[#C7F36B]">100%</p>
                  <p className="text-xs text-[#F4F4EC]/60 mt-1">Adults 18+ Verified</p>
                </div>
              </div>
            </div>

            {/* Right Column: Live Interactive Swipe Card Teaser */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="w-full max-w-sm relative">
                
                {/* Floating pill badge */}
                <div className="absolute -top-3 -right-2 z-20 bg-[#C7F36B] text-[#111827] px-3 py-1 rounded-full text-xs font-bold shadow-md flex items-center gap-1">
                  <Sparkles className="w-3 h-3 fill-[#111827]" />
                  <span>96% Match Potential</span>
                </div>

                {/* Card Container */}
                <div 
                  className={`relative rounded-3xl overflow-hidden bg-[#263548] border border-[#263548] shadow-2xl transition-all duration-300 ${
                    swipedState === 'liked' ? 'translate-x-32 rotate-6 opacity-0' : 
                    swipedState === 'passed' ? '-translate-x-32 -rotate-6 opacity-0' : 'translate-x-0 rotate-0 opacity-100'
                  }`}
                >
                  <div className="relative h-[430px] w-full">
                    <img
                      src={currentSample.photos[0]}
                      alt={currentSample.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-[#111827]/30 to-transparent" />

                    {/* Verified badge */}
                    <div className="absolute top-4 left-4 flex flex-col gap-1">
                      {currentSample.isVerified && (
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#111827]/85 backdrop-blur-md border border-[#C7F36B]/40 text-xs font-semibold text-[#C7F36B]">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Verified Roomie</span>
                        </div>
                      )}
                      {currentSample.isDemo && (
                        <div className="px-2 py-0.5 rounded-full bg-[#263548]/90 text-[10px] text-[#F4F4EC]/80 border border-[#263548]">
                          <span>Sample Indian Profile</span>
                        </div>
                      )}
                    </div>

                    {/* Card Content Overlay */}
                    <div className="absolute bottom-0 inset-x-0 p-5 text-left">
                      <div className="flex items-baseline justify-between">
                        <div className="flex items-baseline gap-2">
                          <h2 className="text-2xl font-black font-display text-[#F9FAFB]">
                            {currentSample.name}
                          </h2>
                          <span className="text-lg font-medium text-[#F4F4EC]/80">{currentSample.age}</span>
                        </div>
                        <span className="text-xs px-2.5 py-1 rounded-lg bg-[#C7F36B] text-[#111827] font-black">
                          ₹{currentSample.budgetMin.toLocaleString('en-IN')}–₹{currentSample.budgetMax.toLocaleString('en-IN')}/mo
                        </span>
                      </div>

                      <p className="text-xs text-[#F4F4EC]/80 mt-1 font-medium">
                        {currentSample.occupation} • Heading to {currentSample.destinationCity}
                      </p>

                      {/* Lifestyle tags */}
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {currentSample.lifestyle?.dietaryPreference && (
                          <span className="px-2 py-0.5 rounded-md bg-[#111827]/85 text-[11px] font-bold text-[#C7F36B] border border-[#C7F36B]/30 flex items-center gap-1">
                            <Utensils className="w-3 h-3" />
                            {currentSample.lifestyle.dietaryPreference === 'vegetarian' ? 'Pure Veg' : 'Non-Veg'}
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-md bg-[#111827]/85 text-[11px] font-medium text-[#F9FAFB] border border-[#263548]">
                          {currentSample.lifestyle.sleepSchedule === 'early_bird' ? 'Early Bird' : 'Night Owl'}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-[#111827]/85 text-[11px] font-medium text-[#F9FAFB] border border-[#263548]">
                          {currentSample.lifestyle.smoking === 'non_smoker' ? 'Non-smoker' : 'Social'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Interactive swipe button bar */}
                  <div className="p-3.5 bg-[#111827] flex items-center justify-around border-t border-[#263548]">
                    <button
                      onClick={() => handleInteractiveSwipe('left')}
                      className="w-11 h-11 rounded-full bg-[#263548] text-[#F9FAFB] hover:bg-rose-500 hover:text-white flex items-center justify-center transition-colors shadow-lg focus:outline-none"
                      aria-label="Pass profile"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <span className="text-xs text-[#F4F4EC]/60 font-medium">
                      Try clicking Like or Pass
                    </span>
                    <button
                      onClick={() => handleInteractiveSwipe('right')}
                      className="w-11 h-11 rounded-full bg-[#C7F36B] text-[#111827] hover:bg-[#b8e859] flex items-center justify-center transition-transform hover:scale-105 shadow-lg shadow-[#C7F36B]/20 focus:outline-none"
                      aria-label="Like profile"
                    >
                      <Heart className="w-5 h-5 fill-[#111827]" />
                    </button>
                  </div>
                </div>

                <p className="text-center text-xs text-[#F4F4EC]/50 mt-3">
                  Indian sample profiles are interactive. Mutual likes generate instant match simulations.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* How Roomie Works */}
      <section className="py-16 bg-[#111827] border-b border-[#263548]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold tracking-widest text-[#C7F36B] uppercase">The Matching Engine</h2>
            <p className="mt-2 text-3xl sm:text-4xl font-display font-extrabold text-[#F9FAFB]">
              Finding flatmates across Indian cities without the hassle
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-7 rounded-3xl bg-[#263548]/40 border border-[#263548] hover:border-[#C7F36B]/40 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-[#C7F36B]/10 border border-[#C7F36B]/30 flex items-center justify-center text-[#C7F36B] mb-5">
                <Utensils className="w-6 h-6" />
              </div>
              <span className="text-xs font-mono font-bold text-[#C7F36B]">01 / FOOD & LIFESTYLE DNA</span>
              <h3 className="mt-2 text-lg font-display font-bold text-[#F9FAFB]">
                Dietary & Routine Compatibility
              </h3>
              <p className="mt-2 text-xs text-[#F4F4EC]/70 leading-relaxed">
                Vegetarian vs non-vegetarian kitchen habits, early risers, shift workers, and cleanliness levels are profiled upfront.
              </p>
            </div>

            <div className="p-7 rounded-3xl bg-[#263548]/40 border border-[#263548] hover:border-[#C7F36B]/40 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-[#C7F36B]/10 border border-[#C7F36B]/30 flex items-center justify-center text-[#C7F36B] mb-5">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="text-xs font-mono font-bold text-[#C7F36B]">02 / REAL AUTH & SAFETY</span>
              <h3 className="mt-2 text-lg font-display font-bold text-[#F9FAFB]">
                Firebase Auth & Same-Gender Rule
              </h3>
              <p className="mt-2 text-xs text-[#F4F4EC]/70 leading-relaxed">
                Protected by Firebase Authentication. Same-gender roommate restriction enabled by default for peace of mind.
              </p>
            </div>

            <div className="p-7 rounded-3xl bg-[#263548]/40 border border-[#263548] hover:border-[#C7F36B]/40 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-[#C7F36B]/10 border border-[#C7F36B]/30 flex items-center justify-center text-[#C7F36B] mb-5">
                <Building2 className="w-6 h-6" />
              </div>
              <span className="text-xs font-mono font-bold text-[#C7F36B]">03 / SWIPE, CHAT & LEASE</span>
              <h3 className="mt-2 text-lg font-display font-bold text-[#F9FAFB]">
                Pre-leased Flats & PGs in ₹
              </h3>
              <p className="mt-2 text-xs text-[#F4F4EC]/70 leading-relaxed">
                Swipe right on compatible flatmates. Mutual matches unlock direct chat to coordinate society flats in Bengaluru, Gurugram, Mumbai and more.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 bg-[#111827] border-t border-[#263548] text-xs text-[#F4F4EC]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#C7F36B] flex items-center justify-center text-[#111827] font-bold text-xs">
              R
            </div>
            <span className="font-display font-bold text-sm text-[#F9FAFB]">Roomie India</span>
            <span className="text-[#F4F4EC]/40">— Find your people. Own your space.</span>
          </div>
          <p>© {new Date().getFullYear()} Roomie Technologies India. Midnight & Lime Design System.</p>
        </div>
      </footer>
    </div>
  );
};
