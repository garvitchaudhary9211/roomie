import React, { useState } from 'react';
import { 
  SlidersHorizontal, 
  RotateCcw, 
  Lock 
} from 'lucide-react';
import { FilterSettings, INDIAN_CITIES } from '../types';

interface PreferencesViewProps {
  filters: FilterSettings;
  setFilters: React.Dispatch<React.SetStateAction<FilterSettings>>;
  onResetDemoData: () => void;
}

export const PreferencesView: React.FC<PreferencesViewProps> = ({
  filters,
  setFilters,
  onResetDemoData,
}) => {
  const [hideProfile, setHideProfile] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [resetConfirm, setResetConfirm] = useState(false);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#111827] text-[#F9FAFB] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="pb-6 border-b border-[#263548]">
          <h1 className="font-display font-black text-2xl sm:text-3xl text-[#F9FAFB]">
            Preferences & Matching Filters (India)
          </h1>
          <p className="text-xs text-[#F4F4EC]/60 mt-1">
            Configure roommate matching criteria, INR rent limits, and privacy settings.
          </p>
        </div>

        {/* Discovery Filter Preferences */}
        <div className="p-6 rounded-3xl bg-[#263548]/30 border border-[#263548] space-y-5">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-[#C7F36B]" />
            <h2 className="font-display font-bold text-lg text-[#F9FAFB]">Hard Roommate Filters</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#F4F4EC]/80 mb-1.5">
                Eligible Roommate Gender (Same-Gender Restriction Default)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'male', label: 'Men Only' },
                  { id: 'female', label: 'Women Only' },
                  { id: 'any', label: 'All Genders' },
                ].map((g) => (
                  <button
                    key={g.id}
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

            <div>
              <label className="block text-xs font-semibold text-[#F4F4EC]/80 mb-1.5">
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

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-semibold text-[#F4F4EC]/80">Rent Budget Range (₹ INR)</span>
                <span className="text-xs font-bold text-[#C7F36B]">
                  ₹{filters.budgetRange[0].toLocaleString('en-IN')} – ₹{filters.budgetRange[1].toLocaleString('en-IN')}/mo
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  step={1000}
                  value={filters.budgetRange[0]}
                  onChange={(e) =>
                    setFilters({ ...filters, budgetRange: [Number(e.target.value), filters.budgetRange[1]] })
                  }
                  className="px-3 py-1.5 rounded-xl bg-[#263548] border border-[#263548] text-xs text-[#F9FAFB]"
                />
                <input
                  type="number"
                  step={1000}
                  value={filters.budgetRange[1]}
                  onChange={(e) =>
                    setFilters({ ...filters, budgetRange: [filters.budgetRange[0], Number(e.target.value)] })
                  }
                  className="px-3 py-1.5 rounded-xl bg-[#263548] border border-[#263548] text-xs text-[#F9FAFB]"
                />
              </div>
            </div>

            {/* Verified Only */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#263548]/40 border border-[#263548]">
              <div>
                <p className="text-xs font-semibold text-[#F9FAFB]">Verified Profiles Only</p>
                <p className="text-[11px] text-[#F4F4EC]/60">Require prospective matches to hold an active ID verified badge</p>
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
          </div>
        </div>

        {/* Privacy & Safety */}
        <div className="p-6 rounded-3xl bg-[#263548]/30 border border-[#263548] space-y-4">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-[#C7F36B]" />
            <h2 className="font-display font-bold text-lg text-[#F9FAFB]">Privacy & Visibility</h2>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#263548]/40 border border-[#263548]">
              <div>
                <p className="text-xs font-semibold text-[#F9FAFB]">Pause Profile from Discovery</p>
                <p className="text-[11px] text-[#F4F4EC]/60">Temporarily hide your card while keeping current chats open</p>
              </div>
              <button
                type="button"
                onClick={() => setHideProfile(!hideProfile)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  hideProfile ? 'bg-[#C7F36B]' : 'bg-[#263548]'
                }`}
              >
                <div
                  className={`bg-[#111827] w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    hideProfile ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#263548]/40 border border-[#263548]">
              <div>
                <p className="text-xs font-semibold text-[#F9FAFB]">Instant Match Push Notifications</p>
                <p className="text-[11px] text-[#F4F4EC]/60">Notify immediately when someone right-swipes back</p>
              </div>
              <button
                type="button"
                onClick={() => setPushNotifications(!pushNotifications)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  pushNotifications ? 'bg-[#C7F36B]' : 'bg-[#263548]'
                }`}
              >
                <div
                  className={`bg-[#111827] w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    pushNotifications ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Prototype Demo Controls */}
        <div className="p-6 rounded-3xl bg-[#263548]/20 border border-[#263548] space-y-3">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-amber-400" />
            <h2 className="font-display font-bold text-lg text-[#F9FAFB]">Reset Matching Filters</h2>
          </div>
          <p className="text-xs text-[#F4F4EC]/60 leading-relaxed">
            Restore default Indian roommate matching settings and filters.
          </p>

          {resetConfirm ? (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
              <p className="text-xs text-amber-300 font-semibold">
                Reset filters to default Indian settings?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onResetDemoData();
                    setResetConfirm(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-400 text-[#111827] text-xs font-bold hover:bg-amber-300 transition-colors"
                >
                  Yes, Reset Filters
                </button>
                <button
                  onClick={() => setResetConfirm(false)}
                  className="px-4 py-2 rounded-xl bg-[#263548] text-xs text-[#F9FAFB]"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setResetConfirm(true)}
              className="py-2.5 px-4 rounded-xl bg-[#263548] hover:bg-[#263548]/80 text-xs font-semibold text-[#F9FAFB] border border-[#263548] transition-colors"
            >
              Reset Filters to Default
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
