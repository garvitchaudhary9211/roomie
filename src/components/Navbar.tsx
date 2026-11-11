import React from 'react';
import { 
  Flame, 
  Heart, 
  MessageSquare, 
  Building2, 
  ShieldCheck, 
  User, 
  SlidersHorizontal,
  LogOut,
  Sparkles,
  Menu,
  X,
  Camera,
  LogIn
} from 'lucide-react';
import { UserProfile } from '../types';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentUser: UserProfile | null;
  matchesCount: number;
  unreadCount: number;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenPhotoModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  currentUser,
  matchesCount,
  unreadCount,
  onOpenAuth,
  onLogout,
  onOpenPhotoModal,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = React.useState(false);

  const navItems = [
    { id: 'discover', label: 'Discover', icon: Flame },
    { id: 'matches', label: 'Matches', icon: Heart, badge: matchesCount },
    { id: 'messages', label: 'Messages', icon: MessageSquare, badge: unreadCount },
    { id: 'accommodations', label: 'Apartments', icon: Building2 },
    { id: 'verification', label: 'Safety & ID', icon: ShieldCheck, isVerified: currentUser?.isVerified },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#111827]/95 backdrop-blur-md border-b border-[#263548]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Wordmark (Zone 1) */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setCurrentTab('landing')}
              className="flex items-center gap-2.5 text-left group focus:outline-none"
              aria-label="Roomie Home"
            >
              <div className="w-9 h-9 rounded-xl bg-[#C7F36B] flex items-center justify-center text-[#111827] shadow-md shadow-[#C7F36B]/20 group-hover:scale-105 transition-transform duration-200">
                <Sparkles className="w-5 h-5 fill-[#111827]" />
              </div>
              <span className="font-display font-black text-2xl tracking-tight text-[#F9FAFB]">
                roomie
              </span>
            </button>
          </div>

          {/* Desktop Navigation (Zone 2) */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2" aria-label="Main navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setCurrentTab(item.id);
                  }}
                  className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs lg:text-sm font-medium transition-all duration-200 whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-[#263548] text-[#C7F36B] shadow-inner'
                      : 'text-[#F9FAFB]/80 hover:text-[#F9FAFB] hover:bg-[#263548]/50'
                  }`}
                  aria-label={item.label}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#C7F36B]' : 'text-[#F4F4EC]/70'}`} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-[#C7F36B] text-[#111827]">
                      {item.badge}
                    </span>
                  )}
                  {item.id === 'verification' && currentUser?.isVerified && (
                    <span className="w-2 h-2 rounded-full bg-[#C7F36B]" title="Verified Profile" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* User Profile / Auth Action (Zone 3) */}
          <div className="flex items-center gap-3 shrink-0">
            {currentUser ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full bg-[#263548] border border-[#263548] hover:border-[#C7F36B]/40 transition-colors focus:outline-none"
                  aria-expanded={userDropdownOpen}
                  aria-label="User menu"
                >
                  <div className="relative w-8 h-8 rounded-full overflow-hidden border border-[#C7F36B]/60 shrink-0">
                    <img
                      src={currentUser.photos[0] || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                      alt={currentUser.name}
                      className="w-full h-full object-cover"
                    />
                    {currentUser.isVerified && (
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#C7F36B] border border-[#111827]" />
                    )}
                  </div>
                  <div className="flex flex-col items-start leading-none hidden sm:flex">
                    <span className="text-xs font-semibold text-[#F9FAFB] max-w-[100px] truncate">
                      {currentUser.name.split(' ')[0]}
                    </span>
                    {currentUser.isDemo && (
                      <span className="text-[9px] text-[#C7F36B] font-medium">Demo</span>
                    )}
                  </div>
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#111827] border border-[#263548] shadow-2xl py-2 z-50 divide-y divide-[#263548] animate-fadeIn"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2.5">
                      <p className="text-[11px] text-[#F4F4EC]/60">
                        {currentUser.isDemo ? 'College Demonstration Profile' : 'Signed in account'}
                      </p>
                      <p className="text-sm font-semibold text-[#F9FAFB] truncate">{currentUser.name}</p>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className={`inline-block w-2 h-2 rounded-full ${currentUser.isVerified ? 'bg-[#C7F36B]' : 'bg-amber-400'}`} />
                        <span className="text-[11px] text-[#C7F36B] font-medium">
                          {currentUser.isVerified ? 'ID Verified' : 'Pending Verification'}
                        </span>
                      </div>
                    </div>

                    <div className="py-1">
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentTab('profile');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#F9FAFB] hover:bg-[#263548] transition-colors"
                      >
                        <User className="w-4 h-4 text-[#C7F36B]" />
                        <span>My Profile & Card Preview</span>
                      </button>

                      {onOpenPhotoModal && (
                        <button
                          type="button"
                          onClick={() => {
                            setUserDropdownOpen(false);
                            onOpenPhotoModal();
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#F9FAFB] hover:bg-[#263548] transition-colors"
                        >
                          <Camera className="w-4 h-4 text-[#C7F36B]" />
                          <span>Change Profile Picture</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setCurrentTab('preferences');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#F9FAFB] hover:bg-[#263548] transition-colors"
                      >
                        <SlidersHorizontal className="w-4 h-4 text-[#C7F36B]" />
                        <span>Search & City Filters</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setCurrentTab('verification');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#F9FAFB] hover:bg-[#263548] transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 text-[#C7F36B]" />
                        <span>Camera Verification Badge</span>
                      </button>
                    </div>

                    <div className="py-1">
                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onOpenAuth();
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#F4F4EC]/80 hover:bg-[#263548] transition-colors"
                      >
                        <LogIn className="w-4 h-4" />
                        <span>Switch Account / Demo</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onLogout();
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-400 hover:bg-[#263548] transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Signed Out State Actions */
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onOpenAuth}
                  className="px-3.5 py-1.5 rounded-xl bg-[#263548] hover:bg-[#263548]/80 text-xs font-semibold text-[#F9FAFB] transition-colors"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={onOpenAuth}
                  className="px-4 py-1.5 rounded-xl bg-[#C7F36B] hover:bg-[#b8e859] text-[#111827] text-xs font-display font-bold transition-all shadow-md shadow-[#C7F36B]/20 whitespace-nowrap"
                >
                  Join Roomie
                </button>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-[#F9FAFB] hover:bg-[#263548] focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#111827] border-b border-[#263548] px-4 pt-2 pb-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setCurrentTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium ${
                  isActive
                    ? 'bg-[#263548] text-[#C7F36B]'
                    : 'text-[#F9FAFB]/80 hover:bg-[#263548]/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-[#C7F36B] text-[#111827]">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
