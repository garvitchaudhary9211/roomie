import React, { useState } from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  Edit3, 
  Eye, 
  Save, 
  Check, 
  Utensils, 
  MapPin,
  Camera,
  AlertCircle
} from 'lucide-react';
import { UserProfile, INDIAN_CITIES, POPULAR_LOCALITIES } from '../types';
import { PhotoUploadModal } from './PhotoUploadModal';

interface UserProfileViewProps {
  currentUser: UserProfile;
  onUpdateProfile: (updated: UserProfile) => Promise<void> | void;
  onNavigateToVerification: () => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  currentUser,
  onUpdateProfile,
  onNavigateToVerification,
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'edit'>('preview');
  const [formData, setFormData] = useState<UserProfile>(currentUser);
  const [savedNotification, setSavedNotification] = useState(false);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Sync internal state if currentUser updates externally
  React.useEffect(() => {
    setFormData(currentUser);
  }, [currentUser]);

  const handlePhotoSaved = async (newPhotoUrl: string) => {
    const updated: UserProfile = {
      ...formData,
      photos: [newPhotoUrl, ...(formData.photos.slice(1))],
    };
    setFormData(updated);
    await onUpdateProfile(updated);
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 2500);
  };

  const handlePhotoRemoved = async () => {
    const fallbackPhoto = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=500&q=80';
    const updated: UserProfile = {
      ...formData,
      photos: [fallbackPhoto],
    };
    setFormData(updated);
    await onUpdateProfile(updated);
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 2500);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validation
    if (!formData.name.trim()) {
      setValidationError('Name cannot be empty.');
      return;
    }
    if (formData.age < 18) {
      setValidationError('Roomie is strictly 18+ for adult flatmate discovery in India.');
      return;
    }
    if (formData.budgetMin < 1000 || formData.budgetMax < formData.budgetMin) {
      setValidationError('Please specify a valid rent budget range in Indian Rupees (₹).');
      return;
    }

    await onUpdateProfile(formData);
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 2500);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#111827] text-[#F9FAFB] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header & Mode Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#263548]">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-black text-2xl sm:text-3xl text-[#F9FAFB]">
                Profile & Roomie Card
              </h1>
              {currentUser.isDemo && (
                <span className="px-2.5 py-0.5 rounded-full bg-[#263548] text-[#C7F36B] text-[11px] font-semibold border border-[#263548]">
                  Sample Demo Account
                </span>
              )}
            </div>
            <p className="text-xs text-[#F4F4EC]/60 mt-1">
              Manage your profile photo, lifestyle preferences, rent budget (₹ INR), and Indian locality.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPhotoModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#263548] hover:bg-[#263548]/80 text-[#C7F36B] text-xs font-semibold border border-[#263548] hover:border-[#C7F36B]/40 transition-colors"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Change Photo</span>
            </button>

            <div className="flex rounded-xl bg-[#263548]/60 p-1 border border-[#263548]">
              <button
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'preview'
                    ? 'bg-[#C7F36B] text-[#111827] shadow'
                    : 'text-[#F9FAFB]/70 hover:text-[#F9FAFB]'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Card Preview</span>
              </button>
              <button
                onClick={() => setActiveTab('edit')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'edit'
                    ? 'bg-[#C7F36B] text-[#111827] shadow'
                    : 'text-[#F9FAFB]/70 hover:text-[#F9FAFB]'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            </div>
          </div>
        </div>

        {/* Saved Alert Banner */}
        {savedNotification && (
          <div className="p-3.5 rounded-2xl bg-[#C7F36B]/15 border border-[#C7F36B]/50 text-[#C7F36B] text-xs font-semibold flex items-center gap-2 animate-fadeIn">
            <Check className="w-4 h-4" />
            <span>Profile and photo successfully saved to Firestore! Updated across discovery and navbar.</span>
          </div>
        )}

        {/* Validation error */}
        {validationError && (
          <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/50 text-rose-300 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{validationError}</span>
          </div>
        )}

        {/* TAB 1: CARD PREVIEW */}
        {activeTab === 'preview' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            <div className="md:col-span-6 flex justify-center">
              <div className="w-full max-w-sm rounded-3xl overflow-hidden bg-[#263548] border border-[#263548] shadow-2xl relative">
                <div className="relative aspect-[3/4] w-full">
                  <img
                    src={currentUser.photos[0]}
                    alt={currentUser.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-[#111827]/40 to-transparent" />

                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                    {currentUser.isVerified ? (
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#111827]/90 backdrop-blur-md border border-[#C7F36B]/50 text-xs font-semibold text-[#C7F36B]">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Verified Profile</span>
                      </div>
                    ) : (
                      <button
                        onClick={onNavigateToVerification}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/50 text-xs font-semibold text-amber-300 backdrop-blur-md"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Get Verified Badge</span>
                      </button>
                    )}
                  </div>

                  {/* Photo Edit Trigger on Card */}
                  <button
                    onClick={() => setPhotoModalOpen(true)}
                    className="absolute top-4 right-4 p-2 rounded-full bg-[#111827]/80 backdrop-blur-md text-[#C7F36B] hover:scale-105 transition-transform border border-[#263548]"
                    title="Change profile picture"
                  >
                    <Camera className="w-4 h-4" />
                  </button>

                  {/* Bottom details */}
                  <div className="absolute bottom-0 inset-x-0 p-5 text-left">
                    <div className="flex items-baseline justify-between">
                      <div className="flex items-baseline gap-2">
                        <h2 className="text-2xl font-black font-display text-[#F9FAFB]">
                          {currentUser.name}
                        </h2>
                        <span className="text-lg font-medium text-[#F4F4EC]/80">{currentUser.age}</span>
                      </div>
                      <span className="text-xs px-2.5 py-1 rounded-lg bg-[#C7F36B] text-[#111827] font-black">
                        ₹{currentUser.budgetMin.toLocaleString('en-IN')}–₹{currentUser.budgetMax.toLocaleString('en-IN')}/mo
                      </span>
                    </div>

                    <p className="text-xs text-[#F4F4EC]/80 mt-1 font-medium flex items-center gap-1">
                      <span>{currentUser.occupation}</span>
                      {currentUser.collegeOrCompany && <span>({currentUser.collegeOrCompany})</span>}
                      <span>•</span>
                      <MapPin className="w-3 h-3 text-[#C7F36B]" />
                      <span>{currentUser.locality || currentUser.destinationCity}</span>
                    </p>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {currentUser.lifestyle?.dietaryPreference && (
                        <span className="px-2 py-0.5 rounded-md bg-[#111827]/85 text-[11px] font-bold text-[#C7F36B] border border-[#C7F36B]/30 flex items-center gap-1">
                          <Utensils className="w-3 h-3" />
                          {currentUser.lifestyle.dietaryPreference === 'vegetarian' ? 'Pure Veg' : currentUser.lifestyle.dietaryPreference === 'eggetarian' ? 'Eggetarian' : 'Non-Veg'}
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-md bg-[#111827]/85 text-[11px] font-medium text-[#F9FAFB] border border-[#263548]">
                        {currentUser.lifestyle.sleepSchedule === 'early_bird' ? 'Early Bird' : 'Night Owl'}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-[#111827]/85 text-[11px] font-medium text-[#F9FAFB] border border-[#263548]">
                        {currentUser.lifestyle.cleanliness === 'tidy_freak' ? 'Tidy' : 'Moderate'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-6 space-y-5">
              {/* Photo & Verification Quick Control */}
              <div className="p-6 rounded-3xl bg-[#263548]/30 border border-[#263548] space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-base text-[#F9FAFB]">Profile Picture & ID</h3>
                  {currentUser.isVerified ? (
                    <span className="px-2.5 py-1 rounded-full bg-[#C7F36B]/20 text-[#C7F36B] border border-[#C7F36B]/40 text-xs font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Active & Verified
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold">
                      Pending Verification
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[#C7F36B] shrink-0">
                    <img
                      src={currentUser.photos[0]}
                      alt={currentUser.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={() => setPhotoModalOpen(true)}
                      className="px-3 py-1.5 rounded-lg bg-[#C7F36B] text-[#111827] text-xs font-bold hover:bg-[#b8e859] transition-colors"
                    >
                      Upload / Take New Picture
                    </button>
                    <p className="text-[11px] text-[#F4F4EC]/60">
                      Crop, reposition, or capture from your phone/laptop camera.
                    </p>
                  </div>
                </div>

                {!currentUser.isVerified && (
                  <button
                    onClick={onNavigateToVerification}
                    className="w-full py-2.5 rounded-xl bg-[#263548] hover:bg-[#263548]/80 text-[#C7F36B] text-xs font-display font-bold border border-[#C7F36B]/30 transition-all flex items-center justify-center gap-1.5"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Complete Live Camera Selfie Verification</span>
                  </button>
                )}
              </div>

              {/* Bio summary */}
              <div className="p-6 rounded-3xl bg-[#263548]/30 border border-[#263548] space-y-3">
                <h3 className="font-display font-bold text-base text-[#F9FAFB]">About & Living Habits</h3>
                <p className="text-xs text-[#F4F4EC]/80 leading-relaxed bg-[#111827]/60 p-3 rounded-xl border border-[#263548]">
                  {currentUser.bio}
                </p>

                <div>
                  <span className="text-[11px] font-bold text-[#C7F36B] uppercase">Interests & Hobbies</span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {currentUser.interests.map((i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-[#263548] text-xs text-[#F9FAFB]">
                        {i}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-rose-300 uppercase">Non-Negotiable Rules</span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {currentUser.dealBreakers.map((d) => (
                      <span key={d} className="px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-200">
                        ✕ {d}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: EDIT PROFILE FORM */}
        {activeTab === 'edit' && (
          <form onSubmit={handleSave} className="bg-[#111827] border border-[#263548] rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#F4F4EC]/80 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#263548]/50 border border-[#263548] text-xs text-[#F9FAFB] focus:outline-none focus:border-[#C7F36B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#F4F4EC]/80 mb-1">Age (18+)</label>
                <input
                  type="number"
                  min={18}
                  max={65}
                  required
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#263548]/50 border border-[#263548] text-xs text-[#F9FAFB] focus:outline-none focus:border-[#C7F36B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#F4F4EC]/80 mb-1">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#263548] border border-[#263548] text-xs text-[#F9FAFB] focus:outline-none focus:border-[#C7F36B]"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non_binary">Non-Binary</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#F4F4EC]/80 mb-1">Occupation / Profession</label>
                <input
                  type="text"
                  required
                  value={formData.occupation}
                  onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#263548]/50 border border-[#263548] text-xs text-[#F9FAFB] focus:outline-none focus:border-[#C7F36B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#F4F4EC]/80 mb-1">College / Workplace</label>
                <input
                  type="text"
                  value={formData.collegeOrCompany || ''}
                  onChange={(e) => setFormData({ ...formData, collegeOrCompany: e.target.value, companyOrCollege: e.target.value })}
                  placeholder="e.g. CRED, Deloitte, IIT Delhi"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#263548]/50 border border-[#263548] text-xs text-[#F9FAFB] focus:outline-none focus:border-[#C7F36B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#F4F4EC]/80 mb-1">Destination City (India)</label>
                <select
                  value={formData.destinationCity}
                  onChange={(e) => setFormData({ ...formData, destinationCity: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#263548] border border-[#263548] text-xs text-[#F9FAFB] focus:outline-none focus:border-[#C7F36B]"
                >
                  {INDIAN_CITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#F4F4EC]/80 mb-1">Locality / Sector</label>
                <input
                  type="text"
                  value={formData.locality || ''}
                  onChange={(e) => setFormData({ ...formData, locality: e.target.value })}
                  placeholder="e.g. Koramangala, Cyber City, Bandra"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#263548]/50 border border-[#263548] text-xs text-[#F9FAFB] focus:outline-none focus:border-[#C7F36B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#F4F4EC]/80 mb-1">Target Move-in Date (DD/MM/YYYY)</label>
                <input
                  type="text"
                  value={formData.moveInDate}
                  onChange={(e) => setFormData({ ...formData, moveInDate: e.target.value })}
                  placeholder="01/09/2026"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#263548]/50 border border-[#263548] text-xs text-[#F9FAFB] focus:outline-none focus:border-[#C7F36B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#F4F4EC]/80 mb-1">Min Rent Budget (₹/month)</label>
                <input
                  type="number"
                  step={500}
                  value={formData.budgetMin}
                  onChange={(e) => setFormData({ ...formData, budgetMin: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#263548]/50 border border-[#263548] text-xs text-[#F9FAFB] focus:outline-none focus:border-[#C7F36B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#F4F4EC]/80 mb-1">Max Rent Budget (₹/month)</label>
                <input
                  type="number"
                  step={500}
                  value={formData.budgetMax}
                  onChange={(e) => setFormData({ ...formData, budgetMax: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#263548]/50 border border-[#263548] text-xs text-[#F9FAFB] focus:outline-none focus:border-[#C7F36B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#F4F4EC]/80 mb-1">Dietary Preference</label>
                <select
                  value={formData.lifestyle.dietaryPreference}
                  onChange={(e) => setFormData({
                    ...formData,
                    lifestyle: { ...formData.lifestyle, dietaryPreference: e.target.value as any },
                  })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#263548] border border-[#263548] text-xs text-[#F9FAFB]"
                >
                  <option value="vegetarian">Pure Vegetarian</option>
                  <option value="eggetarian">Eggetarian</option>
                  <option value="non_vegetarian">Non-Vegetarian</option>
                  <option value="vegan">Vegan</option>
                  <option value="no_preference">No Preference</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#F4F4EC]/80 mb-1">Sleep Schedule</label>
                <select
                  value={formData.lifestyle.sleepSchedule}
                  onChange={(e) => setFormData({
                    ...formData,
                    lifestyle: { ...formData.lifestyle, sleepSchedule: e.target.value as any },
                  })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#263548] border border-[#263548] text-xs text-[#F9FAFB]"
                >
                  <option value="early_bird">Early Bird (before 11 PM)</option>
                  <option value="night_owl">Night Owl (past midnight)</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#F4F4EC]/80 mb-1">Bio</label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#263548]/50 border border-[#263548] text-xs text-[#F9FAFB] focus:outline-none focus:border-[#C7F36B]"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[#263548] flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className="px-5 py-2.5 rounded-xl bg-[#263548] text-xs font-semibold text-[#F9FAFB] hover:bg-[#263548]/80 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#C7F36B] text-[#111827] font-display font-bold text-xs hover:bg-[#b8e859] transition-all flex items-center gap-1.5 shadow-md shadow-[#C7F36B]/20"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        )}

      </div>

      {/* Photo Upload Modal */}
      <PhotoUploadModal
        isOpen={photoModalOpen}
        onClose={() => setPhotoModalOpen(false)}
        currentPhotoUrl={currentUser.photos[0]}
        onPhotoSaved={handlePhotoSaved}
        onPhotoRemoved={handlePhotoRemoved}
      />
    </div>
  );
};
