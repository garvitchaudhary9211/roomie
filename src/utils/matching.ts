import { UserProfile, CompatibilityResult, FilterSettings } from '../types';

export function calculateCompatibility(user: UserProfile, candidate: UserProfile): CompatibilityResult {
  const highlights: string[] = [];
  const cautions: string[] = [];

  // 1. Location Score (max 25)
  let locationScore = 0;
  if (user.destinationCity.toLowerCase().trim() === candidate.destinationCity.toLowerCase().trim()) {
    locationScore = 20;
    highlights.push(`Both moving to ${candidate.destinationCity}`);
    if (user.locality && candidate.locality && user.locality.toLowerCase().trim() === candidate.locality.toLowerCase().trim()) {
      locationScore = 25;
      highlights.push(`Targeting same locality (${candidate.locality})`);
    } else {
      locationScore = 22;
    }
  } else {
    locationScore = 5;
    cautions.push(`Different destination cities (${user.destinationCity} vs ${candidate.destinationCity})`);
  }

  // 2. Budget Score in INR (max 25)
  let budgetScore = 0;
  const userAvg = (user.budgetMin + user.budgetMax) / 2;
  const candAvg = (candidate.budgetMin + candidate.budgetMax) / 2;
  const hasOverlap = candidate.budgetMin <= user.budgetMax && candidate.budgetMax >= user.budgetMin;

  if (hasOverlap) {
    const overlapMin = Math.max(user.budgetMin, candidate.budgetMin);
    const overlapMax = Math.min(user.budgetMax, candidate.budgetMax);
    const diff = Math.abs(userAvg - candAvg);

    if (diff <= 2500) {
      budgetScore = 25;
      highlights.push(`Perfect rent overlap (₹${overlapMin.toLocaleString('en-IN')}–₹${overlapMax.toLocaleString('en-IN')}/mo)`);
    } else if (diff <= 5000) {
      budgetScore = 21;
      highlights.push(`Compatible budget range (₹${overlapMin.toLocaleString('en-IN')}–₹${overlapMax.toLocaleString('en-IN')}/mo)`);
    } else {
      budgetScore = 17;
    }
  } else {
    const gap = Math.min(
      Math.abs(user.budgetMin - candidate.budgetMax),
      Math.abs(candidate.budgetMin - user.budgetMax)
    );
    if (gap <= 3000) {
      budgetScore = 10;
      cautions.push(`Slight budget difference (~₹${gap.toLocaleString('en-IN')}/mo gap)`);
    } else {
      budgetScore = 4;
      cautions.push(`Significant budget gap (~₹${gap.toLocaleString('en-IN')}/mo)`);
    }
  }

  // 3. Dietary & Food Habits (max 15)
  let dietaryScore = 0;
  const uDiet = user.lifestyle?.dietaryPreference || 'no_preference';
  const cDiet = candidate.lifestyle?.dietaryPreference || 'no_preference';

  if (uDiet === cDiet) {
    dietaryScore = 15;
    if (uDiet === 'vegetarian') highlights.push('Both strictly pure vegetarian');
    else if (uDiet === 'non_vegetarian') highlights.push('Both open to non-veg meals');
  } else if (
    (uDiet === 'vegetarian' && cDiet === 'non_vegetarian') ||
    (uDiet === 'non_vegetarian' && cDiet === 'vegetarian')
  ) {
    // Check cooking habit
    if (candidate.lifestyle?.cooking === 'daily_cook' && uDiet === 'vegetarian') {
      dietaryScore = 3;
      cautions.push('Dietary mismatch: Pure vegetarian vs daily non-veg cooking');
    } else {
      dietaryScore = 7;
    }
  } else {
    dietaryScore = 12;
  }

  // 4. Sleep & Cleanliness (max 20)
  let lifestyleScore = 0;
  const uSleep = user.lifestyle?.sleepSchedule;
  const cSleep = candidate.lifestyle?.sleepSchedule;
  const uClean = user.lifestyle?.cleanliness;
  const cClean = candidate.lifestyle?.cleanliness;

  // Sleep schedule (up to 10 points)
  if (uSleep === cSleep) {
    lifestyleScore += 10;
    const label = uSleep === 'early_bird' ? 'Early risers' : uSleep === 'night_owl' ? 'Night owls' : 'Flexible sleep routines';
    highlights.push(`Matching schedule (${label})`);
  } else if (uSleep === 'flexible' || cSleep === 'flexible') {
    lifestyleScore += 7;
  } else {
    lifestyleScore += 2;
    cautions.push('Opposite sleep schedules (Early bird vs Night owl)');
  }

  // Cleanliness (up to 10 points)
  if (uClean === cClean) {
    lifestyleScore += 10;
    highlights.push('Matching cleanliness expectations');
  } else if (
    (uClean === 'moderate' && cClean !== 'moderate') ||
    (cClean === 'moderate' && uClean !== 'moderate')
  ) {
    lifestyleScore += 7;
  } else {
    lifestyleScore += 2;
    cautions.push('Different cleanliness standards');
  }

  // 5. Habits & House Rules: Smoking, Guests, Pets (max 15)
  let habitsScore = 0;
  const uSmoke = user.lifestyle?.smoking;
  const cSmoke = candidate.lifestyle?.smoking;
  const uGuest = user.lifestyle?.guestPolicy;
  const cGuest = candidate.lifestyle?.guestPolicy;
  const uPet = user.lifestyle?.petPreference;
  const cPet = candidate.lifestyle?.petPreference;

  // Smoking (up to 7)
  if (uSmoke === cSmoke) {
    habitsScore += 7;
    if (uSmoke === 'non_smoker') highlights.push('Both non-smokers');
  } else if (
    (uSmoke === 'non_smoker' && cSmoke === 'smoker') ||
    (uSmoke === 'smoker' && cSmoke === 'non_smoker')
  ) {
    habitsScore += 0;
    cautions.push('Smoking preference conflict (Non-smoker & Smoker)');
  } else {
    habitsScore += 4;
  }

  // Guests (up to 5)
  if (uGuest === cGuest) {
    habitsScore += 5;
  } else if (uGuest === 'weekends_only' || cGuest === 'weekends_only') {
    habitsScore += 3;
  } else {
    habitsScore += 1;
  }

  // Pets (up to 3)
  if (
    (uPet === 'allergic' && cPet === 'loves_pets') ||
    (uPet === 'loves_pets' && cPet === 'allergic')
  ) {
    habitsScore += 0;
    cautions.push('Pet allergy conflict');
  } else {
    habitsScore += 3;
  }

  const rawTotal = locationScore + budgetScore + dietaryScore + lifestyleScore + habitsScore;
  const totalScore = Math.min(100, Math.max(15, rawTotal));

  return {
    score: Math.round(totalScore),
    breakdown: {
      location: locationScore,
      budget: budgetScore,
      dietary: dietaryScore,
      lifestyle: lifestyleScore,
      habits: habitsScore,
    },
    highlights: highlights.slice(0, 4),
    cautions: cautions.slice(0, 3),
  };
}

export function passesHardFilters(
  candidate: UserProfile,
  filters: FilterSettings,
  currentUser: UserProfile
): boolean {
  // 1. Same-gender roommate restriction by default (enforce strictly unless set to 'any')
  if (filters.gender !== 'any' && candidate.gender !== filters.gender) {
    return false;
  }

  // Candidate's own lookingForGender preference check
  if (candidate.lookingForGender !== 'any' && candidate.lookingForGender !== currentUser.gender) {
    return false;
  }

  // 2. Age restrictions hard filter (18+)
  if (candidate.age < filters.ageRange[0] || candidate.age > filters.ageRange[1]) {
    return false;
  }

  // 3. Destination City filter
  if (
    filters.destinationCity &&
    filters.destinationCity !== 'all' &&
    candidate.destinationCity.toLowerCase() !== filters.destinationCity.toLowerCase()
  ) {
    return false;
  }

  // 4. Budget overlap filter in INR
  const hasBudgetOverlap =
    candidate.budgetMin <= filters.budgetRange[1] && candidate.budgetMax >= filters.budgetRange[0];
  if (!hasBudgetOverlap) {
    return false;
  }

  // 5. Must be verified filter
  if (filters.mustBeVerified && !candidate.isVerified) {
    return false;
  }

  // 6. Dietary filter
  if (filters.dietaryPreference && filters.dietaryPreference !== 'all') {
    if (filters.dietaryPreference === 'vegetarian' && candidate.lifestyle?.dietaryPreference !== 'vegetarian') {
      return false;
    }
  }

  // 7. Minimum compatibility threshold
  const { score } = calculateCompatibility(currentUser, candidate);
  if (score < filters.minCompatibility) {
    return false;
  }

  return true;
}
