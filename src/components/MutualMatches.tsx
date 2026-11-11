import React, { useState } from 'react';
import { 
  Heart, 
  MessageSquare, 
  Sparkles, 
  MapPin, 
  ShieldCheck, 
  Search, 
  Flame,
  X,
  Users
} from 'lucide-react';
import { MatchItem, UserProfile } from '../types';

interface MutualMatchesProps {
  matches: MatchItem[];
  demoMatches?: MatchItem[];
  onOpenChat: (userId: string) => void;
  onExploreDiscovery: () => void;
}

export const MutualMatches: React.FC<MutualMatchesProps> = ({
  matches,
  demoMatches = [],
  onOpenChat,
  onExploreDiscovery,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [activeView, setActiveView] = useState<'real' | 'demo'>('real');

  // If user has 0 real matches but demo matches exist, allow viewing demo matches
  const displayedMatches = activeView === 'real' ? matches : demoMatches;

  const filteredMatches = displayedMatches.filter((m) =>
    m.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.user.destinationCity.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.user.occupation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#111827] text-[#F9FAFB] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#263548]">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-black text-2xl sm:text-3xl text-[#F9FAFB]">
                Mutual Roomie Matches
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-[#C7F36B] text-[#111827] text-xs font-bold">
                {displayedMatches.length}
              </span>
            </div>
            <p className="text-xs text-[#F4F4EC]/60 mt-1">
              Indian roommate seekers who mutually liked your profile. Direct messaging is unlocked for all matches.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* View switcher between Real and Demo matches */}
            {demoMatches.length > 0 && (
              <div className="flex rounded-xl bg-[#263548]/60 p-1 border border-[#263548] shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveView('real')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeView === 'real'
                      ? 'bg-[#C7F36B] text-[#111827] shadow'
                      : 'text-[#F9FAFB]/70 hover:text-[#F9FAFB]'
                  }`}
                >
                  My Real Matches ({matches.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveView('demo')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeView === 'demo'
                      ? 'bg-[#C7F36B] text-[#111827] shadow'
                      : 'text-[#F9FAFB]/70 hover:text-[#F9FAFB]'
                  }`}
                >
                  College Demo Matches ({demoMatches.length})
                </button>
              </div>
            )}

            {/* Search input */}
            <div className="relative w-full sm:w-60">
              <Search className="w-4 h-4 text-[#F4F4EC]/40 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, city or role..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#263548]/50 border border-[#263548] text-xs text-[#F9FAFB] placeholder-[#F4F4EC]/30 focus:outline-none focus:border-[#C7F36B]"
              />
            </div>
          </div>
        </div>

        {/* Demo Mode Notice Banner if viewing demo matches */}
        {activeView === 'demo' && (
          <div className="p-3.5 rounded-2xl bg-[#263548]/40 border border-[#C7F36B]/30 text-xs flex items-center justify-between gap-3 text-[#F4F4EC]/80">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#C7F36B] shrink-0" />
              <span>
                <strong>College Evaluation Preview:</strong> Displaying sample Indian roommate conversations for demonstration purposes. Real account matches are isolated under &quot;My Real Matches&quot;.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setActiveView('real')}
              className="text-[#C7F36B] font-bold text-xs hover:underline shrink-0"
            >
              Back to My Matches
            </button>
          </div>
        )}

        {/* Matches Grid */}
        {filteredMatches.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMatches.map((match) => (
              <div
                key={match.id}
                className="group rounded-3xl overflow-hidden bg-[#263548]/30 border border-[#263548] hover:border-[#C7F36B]/40 transition-all duration-300 flex flex-col justify-between shadow-xl"
              >
                <div>
                  {/* Photo and Badges */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#111827]">
                    <img
                      src={match.user.photos[0]}
                      alt={match.user.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-transparent opacity-80" />

                    {/* Compatibility Pill */}
                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#111827]/90 backdrop-blur-md border border-[#C7F36B] text-xs font-bold text-[#C7F36B]">
                      <Sparkles className="w-3 h-3 fill-[#C7F36B]" />
                      <span>{match.compatibilityScore}%</span>
                    </div>

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1">
                      {match.user.isVerified && (
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#111827]/85 border border-[#C7F36B]/40 text-[10px] font-semibold text-[#C7F36B]">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Verified</span>
                        </div>
                      )}
                      {match.user.isDemo && (
                        <div className="px-2 py-0.5 rounded-full bg-[#263548]/90 border border-[#263548] text-[9px] font-medium text-[#F4F4EC]/80">
                          <span>Sample Profile</span>
                        </div>
                      )}
                    </div>

                    {/* Bottom name overlay */}
                    <div className="absolute bottom-2.5 inset-x-3 text-left">
                      <div className="flex items-baseline justify-between">
                        <span className="font-display font-bold text-lg text-[#F9FAFB]">
                          {match.user.name}, {match.user.age}
                        </span>
                        <span className="text-[11px] font-bold text-[#C7F36B]">
                          ₹{match.user.budgetMin.toLocaleString('en-IN')}–₹{match.user.budgetMax.toLocaleString('en-IN')}/mo
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 space-y-3 text-left">
                    <p className="text-xs text-[#F4F4EC]/80 font-medium flex items-center gap-1">
                      <span>{match.user.occupation}</span>
                      <span>•</span>
                      <MapPin className="w-3 h-3 text-[#C7F36B]" />
                      <span>{match.user.locality || match.user.destinationCity}</span>
                    </p>

                    <p className="text-xs text-[#F4F4EC]/60 line-clamp-2 leading-relaxed">
                      {match.user.bio}
                    </p>

                    {match.lastMessage && (
                      <div className="p-2.5 rounded-xl bg-[#263548]/60 border border-[#263548] text-[11px] text-[#F9FAFB]/90 truncate">
                        <span className="text-[#C7F36B] font-semibold">Latest: </span>
                        <span>{match.lastMessage}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-4 pt-0 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedUser(match.user)}
                    className="flex-1 py-2 px-3 rounded-xl bg-[#263548] hover:bg-[#263548]/80 text-[#F9FAFB] text-xs font-semibold transition-colors"
                  >
                    View Card
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenChat(match.user.id)}
                    className="flex-1 py-2 px-3 rounded-xl bg-[#C7F36B] hover:bg-[#b8e859] text-[#111827] text-xs font-display font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-[#C7F36B]/15"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Open Chat</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 p-8 rounded-3xl bg-[#263548]/20 border border-[#263548] space-y-4 max-w-md mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-[#263548] text-[#C7F36B] flex items-center justify-center mx-auto">
              <Heart className="w-7 h-7" />
            </div>
            <h3 className="font-display font-bold text-xl text-[#F9FAFB]">
              {activeView === 'real' ? 'No real mutual matches yet' : 'No matching profiles found'}
            </h3>
            <p className="text-xs text-[#F4F4EC]/70">
              {activeView === 'real'
                ? 'Swipe right on roommate profiles in Discover. When a real seeker likes you back, your mutual match and chat will unlock here!'
                : 'Try adjusting your search query above.'}
            </p>
            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={onExploreDiscovery}
                className="py-3 px-6 rounded-xl bg-[#C7F36B] text-[#111827] font-display font-bold text-xs hover:bg-[#b8e859] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#C7F36B]/20"
              >
                <Flame className="w-4 h-4 fill-[#111827]" />
                <span>Explore Discover Cards</span>
              </button>
              {activeView === 'real' && demoMatches.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveView('demo')}
                  className="py-2.5 px-4 rounded-xl bg-[#263548] hover:bg-[#263548]/80 text-[#C7F36B] text-xs font-semibold transition-colors"
                >
                  Preview Sample College Demo Matches ({demoMatches.length})
                </button>
              )}
            </div>
          </div>
        )}

        {/* Modal for viewing profile details */}
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111827]/80 backdrop-blur-md animate-fadeIn">
            <div className="w-full max-w-md bg-[#111827] border border-[#263548] rounded-3xl p-6 shadow-2xl text-[#F9FAFB] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#263548]">
                <h3 className="font-display font-bold text-lg text-[#F9FAFB]">
                  {selectedUser.name}, {selectedUser.age}
                </h3>
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="p-1 rounded-lg text-[#F4F4EC]/60 hover:text-white"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="relative aspect-video rounded-2xl overflow-hidden">
                <img
                  src={selectedUser.photos[0]}
                  alt={selectedUser.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-2 text-xs">
                <p className="text-[#F4F4EC]/80">
                  <strong className="text-white">Role:</strong> {selectedUser.occupation} ({selectedUser.collegeOrCompany})
                </p>
                <p className="text-[#F4F4EC]/80">
                  <strong className="text-white">Budget:</strong> ₹{selectedUser.budgetMin.toLocaleString('en-IN')}–₹{selectedUser.budgetMax.toLocaleString('en-IN')}/mo
                </p>
                <p className="text-[#F4F4EC]/80">
                  <strong className="text-white">Target Date:</strong> {selectedUser.moveInDate}
                </p>
                <p className="text-[#F4F4EC]/80 leading-relaxed bg-[#263548]/30 p-3 rounded-xl border border-[#263548]">
                  {selectedUser.bio}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  const uid = selectedUser.id;
                  setSelectedUser(null);
                  onOpenChat(uid);
                }}
                className="w-full py-2.5 rounded-xl bg-[#C7F36B] text-[#111827] font-display font-bold text-xs hover:bg-[#b8e859] transition-all flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Message {selectedUser.name.split(' ')[0]}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
