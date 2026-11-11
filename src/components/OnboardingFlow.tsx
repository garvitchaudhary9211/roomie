import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Clock, 
  Sparkle, 
  Building2, 
  Coffee, 
  Dog, 
  Cigarette, 
  HeartHandshake, 
  Utensils, 
  Home, 
  MapPin, 
  AlertCircle,
  Camera
} from 'lucide-react';
import { PhotoUploadModal } from './PhotoUploadModal';
import { 
  UserProfile, 
  UserLifestyle, 
  AccommodationType, 
  DietaryPreference, 
  INDIAN_CITIES, 
  POPULAR_LOCALITIES 
} from '../types';

interface OnboardingFlowProps {
  initialProfile: UserProfile;
  onComplete: (profile: UserProfile) => void;
  onCancel: () => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  initialProfile,
  onComplete,
  onCancel,
}) => {
  const [currentStep, setCurrentStep] = useState(1);

  // STEP 1: Personal Details
  const [name, setName] = useState(initialProfile.name || '');
  const [age, setAge] = useState(initialProfile.age || 23);
  const [dob, setDob] = useState('2003-05-14');
  const [gender, setGender] = useState<UserProfile['gender']>(initialProfile.gender || 'male');
  const [phone, setPhone] = useState(initialProfile.phone || '+91 98765 43210');
  const [occupation, setOccupation] = useState(initialProfile.occupation || 'Software Engineer');
  const [collegeOrCompany, setCollegeOrCompany] = useState(initialProfile.collegeOrCompany || 'Tech Corp');

  // STEP 2: Indian Locations & Locality
  const [currentCity, setCurrentCity] = useState(initialProfile.currentCity || 'Delhi');
  const [destinationCity, setDestinationCity] = useState(initialProfile.destinationCity || 'Bengaluru');
  const [locality, setLocality] = useState(initialProfile.locality || 'Koramangala');
  const [customLocality, setCustomLocality] = useState('');
  const [moveInDate, setMoveInDate] = useState(initialProfile.moveInDate || '01/09/2026');

  // STEP 3: Accommodation & Rent Budget in ₹ INR
  const [budgetMin, setBudgetMin] = useState(initialProfile.budgetMin || 14000);
  const [budgetMax, setBudgetMax] = useState(initialProfile.budgetMax || 25000);
  const [accommodationType, setAccommodationType] = useState<AccommodationType>(initialProfile.accommodationType || 'private_room');
  const [furnishing, setFurnishing] = useState<'furnished' | 'semi_furnished' | 'unfurnished'>('furnished');
  const [foodInclusion, setFoodInclusion] = useState<'included' | 'excluded' | 'flexible'>('flexible');
  const [lookingForGender, setLookingForGender] = useState<'any' | 'male' | 'female'>(
    initialProfile.gender === 'female' ? 'female' : 'male' // Same-gender roommate restriction by default
  );

  // STEP 4: Lifestyle & Dietary DNA
  const [dietaryPreference, setDietaryPreference] = useState<DietaryPreference>(
    initialProfile.lifestyle?.dietaryPreference || 'vegetarian'
  );
  const [lifestyle, setLifestyle] = useState<UserLifestyle>(initialProfile.lifestyle || {
    sleepSchedule: 'early_bird',
    cleanliness: 'tidy_freak',
    smoking: 'non_smoker',
    cooking: 'daily_cook',
    guestPolicy: 'weekends_only',
    socialStyle: 'balanced',
    noisePreference: 'quiet_focus',
    petPreference: 'loves_pets',
    dietaryPreference: 'vegetarian',
  });

  // STEP 5: Photos, Bio, Interests & Dealbreakers
  const [bio, setBio] = useState(
    initialProfile.bio || 'Working professional looking for a clean, peaceful flat with respectful roommates.'
  );
  const [photoUrl, setPhotoUrl] = useState(
    initialProfile.photos[0] || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=80'
  );
  const [interests, setInterests] = useState<string[]>(initialProfile.interests || ['Filter Coffee', 'Cricket', 'Tech', 'Music']);
  const [interestInput, setInterestInput] = useState('');
  const [dealBreakers, setDealBreakers] = useState<string[]>(initialProfile.dealBreakers || ['No indoor cigarette smoking', 'Dishes cleaned promptly']);
  const [dealBreakerInput, setDealBreakerInput] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);

  const stepsTotal = 5;

  const handleNext = () => {
    setValidationError(null);

    if (currentStep === 1) {
      if (!name.trim()) {
        setValidationError('Please enter your full name.');
        return;
      }
      if (age < 18) {
        setValidationError('Roomie is strictly for adults 18+.');
        return;
      }
    }

    if (currentStep === 3) {
      if (budgetMin >= budgetMax) {
        setValidationError('Minimum budget must be less than maximum budget.');
        return;
      }
    }

    if (currentStep < stepsTotal) {
      setCurrentStep(currentStep + 1);
    } else {
      const activeLocality = customLocality.trim() || locality;
      const finalizedProfile: UserProfile = {
        ...initialProfile,
        name: name.trim(),
        age: Number(age),
        gender,
        phone,
        occupation: occupation.trim(),
        collegeOrCompany: collegeOrCompany.trim(),
        bio: bio.trim(),
        currentCity,
        destinationCity,
        locality: activeLocality,
        budgetMin: Number(budgetMin),
        budgetMax: Number(budgetMax),
        moveInDate,
        accommodationType,
        lookingForGender,
        lifestyle: {
          ...lifestyle,
          dietaryPreference,
          furnishing,
          foodInclusion,
        },
        photos: [photoUrl, ...initialProfile.photos.slice(1)],
        interests,
        dealBreakers,
        isVerified: true,
        isDemo: false,
      };
      onComplete(finalizedProfile);
    }
  };

  const addInterest = () => {
    if (interestInput.trim() && !interests.includes(interestInput.trim())) {
      setInterests([...interests, interestInput.trim()]);
      setInterestInput('');
    }
  };

  const addDealBreaker = () => {
    if (dealBreakerInput.trim() && !dealBreakers.includes(dealBreakerInput.trim())) {
      setDealBreakers([...dealBreakers, dealBreakerInput.trim()]);
      setDealBreakerInput('');
    }
  };

  const availableLocalities = POPULAR_LOCALITIES[destinationCity] || [];

  return (
    <div className="min-h-screen bg-[#111827] text-[#F9FAFB] py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#263548]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#C7F36B] flex items-center justify-center text-[#111827]">
              <Sparkles className="w-5 h-5 fill-[#111827]" />
            </div>
            <div>
              <h1 className="font-display font-black text-xl sm:text-2xl text-[#F9FAFB]">
                Complete Your Roomie Profile
              </h1>
              <p className="text-xs text-[#F4F4EC]/60">Step {currentStep} of {stepsTotal} • India Marketplace</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-xs text-[#F4F4EC]/60 hover:text-[#F9FAFB] px-3 py-1.5 rounded-lg hover:bg-[#263548] transition-colors"
          >
            Cancel
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-[#263548] h-2 rounded-full overflow-hidden mb-6">
          <div
            className="bg-[#C7F36B] h-full transition-all duration-300 rounded-full"
            style={{ width: `${(currentStep / stepsTotal) * 100}%` }}
          />
        </div>

        {validationError && (
          <div className="mb-6 p-3 rounded-xl bg-rose-500/10 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        <div className="bg-[#111827] border border-[#263548] rounded-3xl p-6 sm:p-8 shadow-2xl">
          {/* STEP 1: Personal Details */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-fadeIn">
              <div>
                <h2 className="font-display font-extrabold text-2xl text-[#F9FAFB]">Personal Details</h2>
                <p className="text-xs text-[#F4F4EC]/70 mt-1">
                  Introduce yourself to prospective flatmates across India.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#F4F4EC]/80 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rohit Sharma"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#263548]/50 border border-[#263548] text-xs sm:text-sm text-[#F9FAFB] focus:outline-none focus:border-[#C7F36B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#F4F4EC]/80 mb-1">
                    Gender Identity *
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => {
                      const g = e.target.value as UserProfile['gender'];
                      setGender(g);
                      if (g === 'male' || g === 'female') {
                        setLookingForGender(g); // maintain same-gender default
                      }
                    }}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#263548] border border-[#263548] text-xs sm:text-sm text-[#F9FAFB] focus:outline-none focus:border-[#C7F36B]"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="non_binary">Non-binary</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#F4F4EC]/80 mb-1">
                    Age * (Must be 18+)
                  </label>
                  <input
                    type="number"
                    min={18}
                    max={75}
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#263548]/50 border border-[#263548] text-xs sm:text-sm text-[#F9FAFB] focus:outline-none focus:border-[#C7F36B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#F4F4EC]/80 mb-1">
                    Mobile Number (India +91)
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#263548]/50 border border-[#263548] text-xs sm:text-sm text-[#F9FAFB] focus:outline-none focus:border-[#C7F36B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#F4F4EC]/80 mb-1">
                    Occupation / Role
                  </label>
                  <input
                    type="text"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    placeholder="e.g. Software Engineer / Consultant"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#263548]/50 border border-[#263548] text-xs sm:text-sm text-[#F9FAFB] focus:outline-none focus:border-[#C7F36B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#F4F4EC]/80 mb-1">
                    College or Workplace
                  </label>
                  <input
                    type="text"
                    value={collegeOrCompany}
                    onChange={(e) => setCollegeOrCompany(e.target.value)}
                    placeholder="e.g. CRED, Microsoft, IIT, DU"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#263548]/50 border border-[#263548] text-xs sm:text-sm text-[#F9FAFB] focus:outline-none focus:border-[#C7F36B]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Indian Location & Destination */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-fadeIn">
              <div>
                <h2 className="font-display font-extrabold text-2xl text-[#F9FAFB]">Indian Cities & Localities</h2>
                <p className="text-xs text-[#F4F4EC]/70 mt-1">
                  Specify where you currently stay and your target locality for flat hunting.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#F4F4EC]/80 mb-1">
                    Current City
                  </label>
                  <select
                    value={currentCity}
                    onChange={(e) => setCurrentCity(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#263548] border border-[#263548] text-xs sm:text-sm text-[#F9FAFB] focus:outline-none focus:border-[#C7F36B]"
                  >
                    {INDIAN_CITIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#F4F4EC]/80 mb-1">
                    Preferred Destination City
                  </label>
                  <select
                    value={destinationCity}
                    onChange={(e) => {
                      setDestinationCity(e.target.value);
                      const locs = POPULAR_LOCALITIES[e.target.value];
                      if (locs && locs.length > 0) setLocality(locs[0]);
                    }}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#263548] border border-[#263548] text-xs sm:text-sm text-[#F9FAFB] focus:outline-none focus:border-[#C7F36B]"
                  >
                    {INDIAN_CITIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#F4F4EC]/80 mb-1">
                    Popular Locality / Tech Hub in {destinationCity}
                  </label>
                  <select
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#263548] border border-[#263548] text-xs sm:text-sm text-[#F9FAFB] focus:outline-none focus:border-[#C7F36B]"
                  >
                    {availableLocalities.map((loc) => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                    <option value="other">Other / Custom Locality</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#F4F4EC]/80 mb-1">
                    Expected Moving Date (DD/MM/YYYY)
                  </label>
                  <input
                    type="text"
                    value={moveInDate}
                    onChange={(e) => setMoveInDate(e.target.value)}
                    placeholder="01/09/2026"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#263548]/50 border border-[#263548] text-xs sm:text-sm text-[#F9FAFB] focus:outline-none focus:border-[#C7F36B]"
                  />
                </div>

                {locality === 'other' && (
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#C7F36B] mb-1">
                      Enter Your Custom Locality / Sector Name
                    </label>
                    <input
                      type="text"
                      value={customLocality}
                      onChange={(e) => setCustomLocality(e.target.value)}
                      placeholder="e.g. Domlur, Marathahalli, Powai Lake"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#263548]/50 border border-[#C7F36B]/50 text-xs sm:text-sm text-[#F9FAFB] focus:outline-none focus:border-[#C7F36B]"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: Housing & Budget in INR (₹) */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-fadeIn">
              <div>
                <h2 className="font-display font-extrabold text-2xl text-[#F9FAFB]">Budget & Accommodation (₹ INR)</h2>
                <p className="text-xs text-[#F4F4EC]/70 mt-1">
                  Realistic monthly rent limits prevent uncomfortable rent discussions later.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#263548]/30 border border-[#263548] space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-[#C7F36B] uppercase">Monthly Rent Budget</span>
                  <span className="text-sm font-black text-[#F9FAFB]">
                    ₹{budgetMin.toLocaleString('en-IN')} – ₹{budgetMax.toLocaleString('en-IN')} / month
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-[#F4F4EC]/60">Min (₹)</span>
                    <input
                      type="number"
                      step={500}
                      value={budgetMin}
                      onChange={(e) => setBudgetMin(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-[#263548] border border-[#263548] text-xs text-[#F9FAFB]"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#F4F4EC]/60">Max (₹)</span>
                    <input
                      type="number"
                      step={500}
                      value={budgetMax}
                      onChange={(e) => setBudgetMax(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-[#263548] border border-[#263548] text-xs text-[#F9FAFB]"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#F4F4EC]/80 mb-1">
                    Accommodation Type
                  </label>
                  <select
                    value={accommodationType}
                    onChange={(e) => setAccommodationType(e.target.value as AccommodationType)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#263548] border border-[#263548] text-xs text-[#F9FAFB]"
                  >
                    <option value="private_room">Private Room in Shared Flat</option>
                    <option value="shared_flat">Shared Flat (Team up for 2BHK/3BHK)</option>
                    <option value="pg">Paying Guest (PG)</option>
                    <option value="shared_room">Shared Room (Double Sharing)</option>
                    <option value="hostel">Hostel Accommodation</option>
                    <option value="apartment_sharing">Apartment Sharing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#F4F4EC]/80 mb-1">
                    Furnishing Preference
                  </label>
                  <select
                    value={furnishing}
                    onChange={(e) => setFurnishing(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#263548] border border-[#263548] text-xs text-[#F9FAFB]"
                  >
                    <option value="furnished">Fully Furnished</option>
                    <option value="semi_furnished">Semi-Furnished</option>
                    <option value="unfurnished">Unfurnished</option>
                  </select>
                </div>
              </div>

              {/* Same-gender roommate restriction */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-[#C7F36B] uppercase mb-1.5">
                  Roommate Gender Filter (Hard Matching Rule)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'male', label: 'Men Only (Default)' },
                    { id: 'female', label: 'Women Only' },
                    { id: 'any', label: 'All Genders' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setLookingForGender(opt.id as any)}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                        lookingForGender === opt.id
                          ? 'bg-[#C7F36B] text-[#111827] border-[#C7F36B]'
                          : 'bg-[#263548]/40 text-[#F9FAFB] border-[#263548]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Lifestyle & Dietary Preferences */}
          {currentStep === 4 && (
            <div className="space-y-5 animate-fadeIn">
              <div>
                <h2 className="font-display font-extrabold text-2xl text-[#F9FAFB]">Lifestyle & Dietary DNA</h2>
                <p className="text-xs text-[#F4F4EC]/70 mt-1">
                  Food habits and household routines are essential for harmonious Indian flatshares.
                </p>
              </div>

              {/* Food & Dietary Habit */}
              <div className="p-4 rounded-2xl bg-[#263548]/40 border border-[#263548]">
                <label className="block text-xs font-bold text-[#C7F36B] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Utensils className="w-3.5 h-3.5" />
                  <span>Dietary Preference *</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'vegetarian', label: 'Pure Vegetarian' },
                    { id: 'non_vegetarian', label: 'Non-Vegetarian' },
                    { id: 'eggetarian', label: 'Eggetarian' },
                    { id: 'vegan', label: 'Vegan' },
                    { id: 'no_preference', label: 'No Preference' },
                  ].map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setDietaryPreference(d.id as DietaryPreference)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                        dietaryPreference === d.id
                          ? 'bg-[#C7F36B] text-[#111827] border-[#C7F36B]'
                          : 'bg-[#263548]/60 text-[#F9FAFB] border-[#263548]'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Sleep Schedule */}
                <div className="p-4 rounded-2xl bg-[#263548]/30 border border-[#263548]">
                  <label className="block text-xs font-bold text-[#C7F36B] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Sleep Routine</span>
                  </label>
                  <div className="space-y-1.5">
                    {[
                      { id: 'early_bird', label: 'Early Bird (Up before 7 AM)' },
                      { id: 'night_owl', label: 'Night Owl (Awake past midnight)' },
                      { id: 'flexible', label: 'Flexible / Shift Worker' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setLifestyle({ ...lifestyle, sleepSchedule: opt.id as any })}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                          lifestyle.sleepSchedule === opt.id
                            ? 'bg-[#C7F36B] text-[#111827] font-bold'
                            : 'bg-[#263548]/60 text-[#F9FAFB]'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cleanliness */}
                <div className="p-4 rounded-2xl bg-[#263548]/30 border border-[#263548]">
                  <label className="block text-xs font-bold text-[#C7F36B] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Sparkle className="w-3.5 h-3.5" />
                    <span>Cleanliness Level</span>
                  </label>
                  <div className="space-y-1.5">
                    {[
                      { id: 'tidy_freak', label: 'Tidy & Clean (Dishes done immediately)' },
                      { id: 'moderate', label: 'Moderate (Weekly cleaning schedule)' },
                      { id: 'relaxed', label: 'Relaxed (Casual & easygoing)' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setLifestyle({ ...lifestyle, cleanliness: opt.id as any })}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                          lifestyle.cleanliness === opt.id
                            ? 'bg-[#C7F36B] text-[#111827] font-bold'
                            : 'bg-[#263548]/60 text-[#F9FAFB]'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Smoking */}
                <div className="p-4 rounded-2xl bg-[#263548]/30 border border-[#263548]">
                  <label className="block text-xs font-bold text-[#C7F36B] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Cigarette className="w-3.5 h-3.5" />
                    <span>Smoking Policy</span>
                  </label>
                  <div className="space-y-1.5">
                    {[
                      { id: 'non_smoker', label: 'Strict Non-Smoker' },
                      { id: 'social_smoker', label: 'Balcony / Social Only' },
                      { id: 'smoker', label: 'Regular Smoker' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setLifestyle({ ...lifestyle, smoking: opt.id as any })}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                          lifestyle.smoking === opt.id
                            ? 'bg-[#C7F36B] text-[#111827] font-bold'
                            : 'bg-[#263548]/60 text-[#F9FAFB]'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Guests */}
                <div className="p-4 rounded-2xl bg-[#263548]/30 border border-[#263548]">
                  <label className="block text-xs font-bold text-[#C7F36B] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <HeartHandshake className="w-3.5 h-3.5" />
                    <span>Guests & Friends</span>
                  </label>
                  <div className="space-y-1.5">
                    {[
                      { id: 'rarely', label: 'Rarely / Quiet sanctuary' },
                      { id: 'weekends_only', label: 'Friends on weekends with heads-up' },
                      { id: 'open', label: 'Open door / Sociable home' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setLifestyle({ ...lifestyle, guestPolicy: opt.id as any })}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                          lifestyle.guestPolicy === opt.id
                            ? 'bg-[#C7F36B] text-[#111827] font-bold'
                            : 'bg-[#263548]/60 text-[#F9FAFB]'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Visuals, Bio, Interests & Dealbreakers */}
          {currentStep === 5 && (
            <div className="space-y-5 animate-fadeIn">
              <div>
                <h2 className="font-display font-extrabold text-2xl text-[#F9FAFB]">Bio, Interests & Non-Negotiables</h2>
                <p className="text-xs text-[#F4F4EC]/70 mt-1">
                  Help potential flatmates get a genuine sense of your living style.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-[#F4F4EC]/80">
                    Profile Avatar
                  </label>
                  <button
                    type="button"
                    onClick={() => setPhotoModalOpen(true)}
                    className="flex items-center gap-1 text-[11px] font-bold text-[#C7F36B] hover:underline"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Upload or Take Custom Photo</span>
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {[
                    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=80',
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80',
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=900&q=80',
                    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=900&q=80',
                  ].map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPhotoUrl(url)}
                      className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                        photoUrl === url ? 'border-[#C7F36B] scale-95 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={url} alt="portrait option" className="w-full h-full object-cover" />
                      {photoUrl === url && (
                        <div className="absolute top-1 right-1 bg-[#C7F36B] text-[#111827] rounded-full p-0.5">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                {photoUrl.startsWith('data:image/') && (
                  <div className="p-2.5 rounded-xl bg-[#263548]/40 border border-[#C7F36B]/40 flex items-center gap-3">
                    <img src={photoUrl} alt="Custom uploaded avatar" className="w-10 h-10 rounded-full object-cover border border-[#C7F36B]" />
                    <span className="text-xs text-[#C7F36B] font-semibold">Custom profile photo active!</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#F4F4EC]/80 mb-1">
                  About You (Bio)
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share a bit about your work, college, cooking habits, and weekend routines..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#263548]/50 border border-[#263548] text-xs sm:text-sm text-[#F9FAFB] focus:outline-none focus:border-[#C7F36B]"
                />
              </div>

              {/* Interests */}
              <div>
                <label className="block text-xs font-semibold text-[#F4F4EC]/80 mb-1">
                  Interests & Hobbies
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={interestInput}
                    onChange={(e) => setInterestInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addInterest(); } }}
                    placeholder="Add interest (e.g. Filter Coffee, Cricket, Badminton)"
                    className="flex-1 px-4 py-2 rounded-xl bg-[#263548]/50 border border-[#263548] text-xs text-[#F9FAFB]"
                  />
                  <button
                    type="button"
                    onClick={addInterest}
                    className="px-4 py-2 rounded-xl bg-[#263548] text-xs font-semibold text-[#C7F36B]"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {interests.map((item) => (
                    <span key={item} className="px-2.5 py-1 rounded-lg bg-[#263548] text-xs text-[#F9FAFB] flex items-center gap-1">
                      {item}
                      <button type="button" onClick={() => setInterests(interests.filter(i => i !== item))}>×</button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Strict Dealbreakers */}
              <div>
                <label className="block text-xs font-semibold text-rose-300 mb-1 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Strict Deal-Breakers</span>
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={dealBreakerInput}
                    onChange={(e) => setDealBreakerInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addDealBreaker(); } }}
                    placeholder="e.g. No indoor smoking, Clean kitchen sink overnight"
                    className="flex-1 px-4 py-2 rounded-xl bg-[#263548]/50 border border-rose-500/30 text-xs text-[#F9FAFB]"
                  />
                  <button
                    type="button"
                    onClick={addDealBreaker}
                    className="px-4 py-2 rounded-xl bg-rose-500/20 text-xs font-semibold text-rose-300"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {dealBreakers.map((item) => (
                    <span key={item} className="px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-200 flex items-center gap-1">
                      ✕ {item}
                      <button type="button" onClick={() => setDealBreakers(dealBreakers.filter(d => d !== item))}>×</button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="mt-8 pt-5 border-t border-[#263548] flex items-center justify-between">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-5 py-2.5 rounded-xl bg-[#263548] hover:bg-[#263548]/80 text-[#F9FAFB] text-xs font-semibold flex items-center gap-2 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl bg-[#C7F36B] hover:bg-[#b8e859] text-[#111827] text-xs font-display font-bold flex items-center gap-2 transition-all shadow-md shadow-[#C7F36B]/20"
            >
              <span>{currentStep === stepsTotal ? 'Save Profile to Firestore & Start Discovery' : 'Next Step'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <PhotoUploadModal
        isOpen={photoModalOpen}
        onClose={() => setPhotoModalOpen(false)}
        currentPhotoUrl={photoUrl}
        onPhotoSaved={(newUrl) => setPhotoUrl(newUrl)}
      />
    </div>
  );
};
