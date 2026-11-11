import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Search, 
  Sparkles, 
  ShieldCheck, 
  MoreVertical, 
  UserX, 
  Flag, 
  Check, 
  CheckCheck, 
  MapPin, 
  AlertTriangle, 
  X, 
  MessageSquare,
  ShieldAlert,
  Info
} from 'lucide-react';
import { MatchItem, ChatMessage, UserProfile } from '../types';

interface MessagingViewProps {
  currentUser: UserProfile;
  matches: MatchItem[];
  messages: Record<string, ChatMessage[]>;
  onSendMessage: (matchId: string, content: string) => void;
  onUnmatch: (matchId: string) => void;
  onBlockReport: (matchId: string, reason: string) => void;
  activeMatchId?: string;
}

export const MessagingView: React.FC<MessagingViewProps> = ({
  currentUser,
  matches,
  messages,
  onSendMessage,
  onUnmatch,
  onBlockReport,
  activeMatchId,
}) => {
  const [selectedMatchId, setSelectedMatchId] = useState<string>(
    activeMatchId || (matches[0] ? matches[0].id : '')
  );
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showOptionsDropdown, setShowOptionsDropdown] = useState(false);
  const [showUnmatchModal, setShowUnmatchModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('Inappropriate communication');
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync activeMatchId if passed from outside
  useEffect(() => {
    if (activeMatchId) {
      setSelectedMatchId(activeMatchId);
    }
  }, [activeMatchId]);

  const currentMatch = matches.find((m) => m.id === selectedMatchId) || matches[0];
  const activeConversation: ChatMessage[] = currentMatch ? messages[currentMatch.id] || [] : [];

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation.length, selectedMatchId]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !currentMatch) return;
    onSendMessage(currentMatch.id, inputText.trim());
    setInputText('');
  };

  const handleIcebreaker = (text: string) => {
    if (!currentMatch) return;
    onSendMessage(currentMatch.id, text);
  };

  const filteredMatches = matches.filter((m) =>
    m.user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-4rem)] bg-[#111827] text-[#F9FAFB] flex flex-col md:flex-row overflow-hidden border-t border-[#263548]">
      
      {/* LEFT COLUMN: Conversation List */}
      <div className={`w-full md:w-80 lg:w-96 bg-[#111827] border-r border-[#263548] flex flex-col ${
        currentMatch && 'hidden md:flex'
      }`}>
        <div className="p-4 border-b border-[#263548] space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-lg text-[#F9FAFB]">Messages</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#263548] text-[#C7F36B] font-bold">
              {matches.length} active
            </span>
          </div>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#F4F4EC]/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search matches..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#263548]/50 border border-[#263548] text-xs text-[#F9FAFB] placeholder-[#F4F4EC]/40 focus:outline-none focus:border-[#C7F36B]"
            />
          </div>
        </div>

        {/* Conversation list items */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#263548]/50">
          {filteredMatches.length > 0 ? (
            filteredMatches.map((m) => {
              const isSelected = m.id === currentMatch?.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setSelectedMatchId(m.id);
                  }}
                  className={`w-full p-4 flex items-center gap-3.5 text-left transition-colors ${
                    isSelected ? 'bg-[#263548]/70 border-l-4 border-l-[#C7F36B]' : 'hover:bg-[#263548]/30'
                  }`}
                >
                  <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 border border-[#263548]">
                    <img
                      src={m.user.photos[0]}
                      alt={m.user.name}
                      className="w-full h-full object-cover"
                    />
                    {m.user.isVerified && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#C7F36B] border border-[#111827]" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between mb-0.5">
                      <span className="font-display font-bold text-sm text-[#F9FAFB] truncate">
                        {m.user.name}
                      </span>
                      <span className="text-[10px] text-[#F4F4EC]/50 shrink-0">
                        {m.lastMessageAt || m.matchedAt}
                      </span>
                    </div>

                    <p className="text-xs text-[#F4F4EC]/70 truncate">
                      {m.lastMessage || 'New match! Say hello...'}
                    </p>
                  </div>

                  {m.unreadCount > 0 && (
                    <span className="w-2 h-2 rounded-full bg-[#C7F36B] shrink-0" />
                  )}
                </button>
              );
            })
          ) : (
            <div className="p-8 text-center text-xs text-[#F4F4EC]/60 space-y-2">
              <MessageSquare className="w-8 h-8 text-[#263548] mx-auto" />
              <p>No active conversations found.</p>
              <p className="text-[11px] text-[#F4F4EC]/40">Mutual likes appear here automatically.</p>
            </div>
          )}
        </div>
      </div>

      {/* CENTER COLUMN: Active Chat Panel */}
      {currentMatch ? (
        <div className="flex-1 flex flex-col bg-[#111827] h-full overflow-hidden">
          
          {/* Top Chat Header */}
          <div className="h-16 px-4 sm:px-6 bg-[#111827] border-b border-[#263548] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSelectedMatchId('')}
                className="md:hidden p-1.5 rounded-lg text-[#F4F4EC]/60 hover:text-white"
                aria-label="Back to conversations"
              >
                ←
              </button>
              <div 
                onClick={() => setShowProfileDrawer(!showProfileDrawer)}
                className="cursor-pointer flex items-center gap-2.5 group"
              >
                <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[#C7F36B]/60 shrink-0">
                  <img
                    src={currentMatch.user.photos[0]}
                    alt={currentMatch.user.name}
                    className="w-full h-full object-cover"
                  />
                  {currentMatch.user.isVerified && (
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#C7F36B]" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-display font-bold text-sm text-[#F9FAFB] group-hover:text-[#C7F36B] transition-colors">
                      {currentMatch.user.name}
                    </span>
                    <span className="text-xs text-[#C7F36B] font-semibold">
                      ({currentMatch.compatibilityScore}% match)
                    </span>
                    {currentMatch.user.isDemo && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#263548] text-[#C7F36B]">
                        Demo
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#F4F4EC]/60 truncate">
                    {currentMatch.user.occupation} • {currentMatch.user.destinationCity}
                  </p>
                </div>
              </div>
            </div>

            {/* Header Right Actions */}
            <div className="relative flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowProfileDrawer(!showProfileDrawer)}
                className="hidden sm:inline-flex px-3 py-1.5 rounded-xl bg-[#263548] text-xs font-semibold text-[#F9FAFB] hover:bg-[#263548]/80 transition-colors"
              >
                {showProfileDrawer ? 'Hide Profile' : 'View Roomie Card'}
              </button>

              <button
                type="button"
                onClick={() => setShowOptionsDropdown(!showOptionsDropdown)}
                className="p-2 rounded-xl text-[#F4F4EC]/60 hover:text-white hover:bg-[#263548] transition-colors focus:outline-none"
                aria-label="More actions"
              >
                <MoreVertical className="w-5 h-5" />
              </button>

              {/* Safety Dropdown Menu */}
              {showOptionsDropdown && (
                <div
                  className="absolute right-0 top-12 w-48 rounded-2xl bg-[#111827] border border-[#263548] shadow-2xl py-1 z-30 divide-y divide-[#263548] animate-fadeIn"
                  onMouseLeave={() => setShowOptionsDropdown(false)}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setShowOptionsDropdown(false);
                      setShowUnmatchModal(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-rose-300 hover:bg-[#263548] transition-colors"
                  >
                    <UserX className="w-4 h-4 text-rose-400" />
                    <span>Unmatch Roommate</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowOptionsDropdown(false);
                      setShowReportModal(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-amber-300 hover:bg-[#263548] transition-colors"
                  >
                    <Flag className="w-4 h-4 text-amber-400" />
                    <span>Block & Report</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Demonstration Notice Banner if demo profile */}
          {currentMatch.user.isDemo && (
            <div className="bg-[#263548]/40 border-b border-[#263548] px-4 py-1.5 text-[11px] text-[#C7F36B] flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 shrink-0" />
                <span>Sample Demo Profile for evaluation. Replies are simulated with realistic roommate responses.</span>
              </span>
            </div>
          )}

          {/* Icebreaker Prompt Pills Bar (India localized) */}
          <div className="px-4 py-2 bg-[#111827] border-b border-[#263548] flex items-center gap-2 overflow-x-auto">
            <span className="text-[10px] font-bold text-[#C7F36B] uppercase shrink-0">Quick Icebreakers:</span>
            {[
              "Namaste! When are you planning to move in?",
              "Saw your rent budget fits perfectly! Looking in Koramangala or HSR?",
              "Do you prefer home-cooked food or ordering meals together?",
              "Hey! Want to do a quick 5-min video call to vibe check?",
            ].map((text, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleIcebreaker(text)}
                className="px-2.5 py-1 rounded-full bg-[#263548]/50 hover:bg-[#263548] text-[11px] text-[#F9FAFB]/90 border border-[#263548] shrink-0 transition-colors"
              >
                {text}
              </button>
            ))}
          </div>

          {/* Chat Messages Scrollable Feed */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {/* Mutual Match Banner */}
            <div className="text-center py-4 px-6 rounded-2xl bg-[#263548]/30 border border-[#263548] max-w-md mx-auto space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C7F36B]">
                <Sparkles className="w-3.5 h-3.5 fill-[#C7F36B]" />
                <span>You matched with {currentMatch.user.name}</span>
              </div>
              <p className="text-[11px] text-[#F4F4EC]/60">
                You share a {currentMatch.compatibilityScore}% compatibility rating based on habits and target Indian location.
              </p>
            </div>

            {/* Safety In-chat Warning */}
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200/90 max-w-md mx-auto flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                Safety reminder: Always meet potential flatmates in public places (e.g. coffee shops) before transferring deposits.
              </span>
            </div>

            {/* Messages */}
            {activeConversation.map((msg) => {
              const isMe = msg.senderId === currentUser.id;
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[75%] sm:max-w-md px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      isMe
                        ? 'bg-[#C7F36B] text-[#111827] font-medium rounded-tr-none shadow-md shadow-[#C7F36B]/15'
                        : 'bg-[#263548] text-[#F9FAFB] rounded-tl-none border border-[#263548]'
                    }`}
                  >
                    <p>{msg.content}</p>
                  </div>
                  <div className="flex items-center gap-1 mt-1 px-1">
                    <span className="text-[10px] text-[#F4F4EC]/50">{msg.timestamp}</span>
                    {isMe && (
                      <span className="text-[#C7F36B]">
                        {msg.status === 'read' ? (
                          <CheckCheck className="w-3 h-3 inline text-[#C7F36B]" />
                        ) : (
                          <Check className="w-3 h-3 inline text-[#F4F4EC]/50" />
                        )}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Chat Input Form */}
          <form
            onSubmit={handleSend}
            className="p-3 sm:p-4 bg-[#111827] border-t border-[#263548] flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Message ${currentMatch.user.name.split(' ')[0]}...`}
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#263548]/50 border border-[#263548] text-xs sm:text-sm text-[#F9FAFB] placeholder-[#F4F4EC]/40 focus:outline-none focus:border-[#C7F36B]"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2.5 rounded-xl bg-[#C7F36B] hover:bg-[#b8e859] disabled:opacity-40 text-[#111827] font-bold transition-all shadow-md shadow-[#C7F36B]/20"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      ) : (
        /* Empty Chat state when no match is selected */
        <div className="flex-1 flex items-center justify-center p-8 text-center bg-[#111827]">
          <div className="space-y-3 max-w-sm">
            <div className="w-12 h-12 rounded-2xl bg-[#263548] text-[#C7F36B] flex items-center justify-center mx-auto">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-[#F9FAFB]">No conversation selected</h3>
            <p className="text-xs text-[#F4F4EC]/60">
              Select a matched roommate on the left to start coordinating your future apartment.
            </p>
          </div>
        </div>
      )}

      {/* RIGHT DRAWER: Roomie Profile Preview */}
      {showProfileDrawer && currentMatch && (
        <div className="w-full md:w-80 lg:w-88 bg-[#111827] border-l border-[#263548] p-5 overflow-y-auto space-y-4 shrink-0">
          <div className="flex items-center justify-between pb-2 border-b border-[#263548]">
            <h3 className="font-display font-bold text-sm text-[#F9FAFB]">Roommate Profile</h3>
            <button
              type="button"
              onClick={() => setShowProfileDrawer(false)}
              className="p-1 rounded-lg text-[#F4F4EC]/60 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="relative aspect-square rounded-2xl overflow-hidden">
            <img
              src={currentMatch.user.photos[0]}
              alt={currentMatch.user.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div>
            <div className="flex items-baseline justify-between">
              <h4 className="font-display font-bold text-lg text-[#F9FAFB]">
                {currentMatch.user.name}, {currentMatch.user.age}
              </h4>
              <span className="text-xs px-2 py-0.5 rounded-lg bg-[#C7F36B] text-[#111827] font-bold">
                {currentMatch.compatibilityScore}%
              </span>
            </div>
            <p className="text-xs text-[#F4F4EC]/70 mt-0.5">
              {currentMatch.user.occupation} • {currentMatch.user.collegeOrCompany || currentMatch.user.companyOrCollege}
            </p>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-xl bg-[#263548]/40 border border-[#263548] space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#C7F36B]">Living Details</span>
              <p className="text-[#F9FAFB]">Budget: ₹{currentMatch.user.budgetMin.toLocaleString('en-IN')}–₹{currentMatch.user.budgetMax.toLocaleString('en-IN')}/mo</p>
              <p className="text-[#F9FAFB]">Move-in: {currentMatch.user.moveInDate}</p>
              <p className="text-[#F9FAFB]">Target: {currentMatch.user.destinationCity}</p>
            </div>

            <div className="p-3 rounded-xl bg-[#263548]/40 border border-[#263548] space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#C7F36B]">Lifestyle DNA</span>
              <p className="text-[#F9FAFB]">Sleep: {currentMatch.user.lifestyle.sleepSchedule === 'early_bird' ? 'Early Bird' : 'Night Owl'}</p>
              <p className="text-[#F9FAFB]">Cleanliness: {currentMatch.user.lifestyle.cleanliness}</p>
              <p className="text-[#F9FAFB]">Smoking: {currentMatch.user.lifestyle.smoking}</p>
              <p className="text-[#F9FAFB]">Cooking: {currentMatch.user.lifestyle.cooking}</p>
            </div>
          </div>

          {/* Quick Safety Buttons */}
          <div className="pt-2 space-y-2">
            <button
              type="button"
              onClick={() => setShowUnmatchModal(true)}
              className="w-full py-2 rounded-xl bg-[#263548] hover:bg-rose-500/20 text-rose-300 text-xs font-semibold border border-rose-500/20 transition-colors"
            >
              Unmatch
            </button>
            <button
              type="button"
              onClick={() => setShowReportModal(true)}
              className="w-full py-2 rounded-xl bg-[#263548] hover:bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/20 transition-colors"
            >
              Block & Report
            </button>
          </div>
        </div>
      )}

      {/* CONFIRM UNMATCH MODAL */}
      {showUnmatchModal && currentMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111827]/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-sm bg-[#111827] border border-rose-500/40 rounded-3xl p-6 shadow-2xl text-[#F9FAFB] space-y-4">
            <div className="flex items-center gap-2 text-rose-400">
              <UserX className="w-5 h-5" />
              <h3 className="font-display font-bold text-lg text-[#F9FAFB]">Unmatch {currentMatch.user.name}?</h3>
            </div>
            <p className="text-xs text-[#F4F4EC]/70 leading-relaxed">
              Are you sure you want to unmatch? This conversation will be removed from your inbox and you will no longer be connected.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowUnmatchModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#263548] text-xs font-semibold text-[#F9FAFB]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowUnmatchModal(false);
                  onUnmatch(currentMatch.id);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors"
              >
                Yes, Unmatch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BLOCK & REPORT SAFETY MODAL */}
      {showReportModal && currentMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111827]/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-sm bg-[#111827] border border-amber-500/40 rounded-3xl p-6 shadow-2xl text-[#F9FAFB] space-y-4">
            <div className="flex items-center gap-2 text-amber-400">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-display font-bold text-lg text-[#F9FAFB]">Block & Report Roommate</h3>
            </div>
            <p className="text-xs text-[#F4F4EC]/70">
              Blocking {currentMatch.user.name} will immediately close this conversation and prevent them from discovering your profile.
            </p>

            <div>
              <label className="block text-xs font-semibold text-[#F4F4EC]/80 mb-1.5">
                Reason for report:
              </label>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#263548] border border-[#263548] text-xs text-[#F9FAFB]"
              >
                <option value="Inappropriate communication">Inappropriate communication</option>
                <option value="Fake profile or misrepresentation">Fake profile or misrepresentation</option>
                <option value="Commercial solicitation / scam">Commercial solicitation / scam</option>
                <option value="Harassment">Harassment</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#263548] text-xs font-semibold text-[#F9FAFB]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowReportModal(false);
                  onBlockReport(currentMatch.id, reportReason);
                }}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 text-[#111827] text-xs font-bold hover:bg-amber-400 transition-colors"
              >
                Confirm Block
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
