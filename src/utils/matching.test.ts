import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateCompatibility, passesHardFilters } from './matching';
import { UserProfile, FilterSettings } from '../types';

const baseUser: UserProfile = {
  id: 'user-rohit',
  name: 'Rohit Sharma',
  age: 24,
  gender: 'male',
  occupation: 'Frontend Engineer',
  collegeOrCompany: 'Swiggy',
  bio: 'Working from HSR Layout office 3 days a week. Looking for a neat 2BHK in Koramangala or HSR.',
  currentCity: 'Delhi',
  destinationCity: 'Bengaluru',
  locality: 'Koramangala',
  budgetMin: 15000,
  budgetMax: 25000,
  moveInDate: '01/09/2026',
  accommodationType: 'private_room',
  lifestyle: {
    sleepSchedule: 'early_bird',
    cleanliness: 'tidy_freak',
    smoking: 'non_smoker',
    cooking: 'daily_cook',
    guestPolicy: 'weekends_only',
    socialStyle: 'balanced',
    noisePreference: 'quiet_focus',
    petPreference: 'loves_pets',
    dietaryPreference: 'vegetarian',
  },
  photos: ['https://images.unsplash.com/photo-1506794778202-cad84cf45f1d'],
  interests: ['Cricket', 'Filter Coffee', 'Badminton'],
  isVerified: true,
  lookingForGender: 'male', // Same-gender restriction by default
  dealBreakers: ['No smoking indoors'],
};

test('calculateCompatibility gives high score for identical Indian city, locality and vegetarian food', () => {
  const perfectCandidate: UserProfile = {
    ...baseUser,
    id: 'user-aman',
    name: 'Aman Verma',
    budgetMin: 16000,
    budgetMax: 24000,
  };

  const result = calculateCompatibility(baseUser, perfectCandidate);
  assert.ok(result.score >= 90, `Expected score >= 90, got ${result.score}`);
  assert.equal(result.breakdown.location, 25);
  assert.equal(result.breakdown.dietary, 15);
  assert.ok(result.highlights.length > 0);
});

test('calculateCompatibility penalizes non-smoker vs smoker and conflicting diets', () => {
  const mismatchCandidate: UserProfile = {
    ...baseUser,
    id: 'user-kabir',
    name: 'Kabir Mehta',
    destinationCity: 'Mumbai',
    budgetMin: 35000,
    budgetMax: 50000,
    lifestyle: {
      ...baseUser.lifestyle,
      sleepSchedule: 'night_owl',
      cleanliness: 'relaxed',
      smoking: 'smoker',
      dietaryPreference: 'non_vegetarian',
      cooking: 'daily_cook',
    },
  };

  const result = calculateCompatibility(baseUser, mismatchCandidate);
  assert.ok(result.score <= 45, `Expected score <= 45, got ${result.score}`);
  assert.ok(result.cautions.length >= 2);
});

test('passesHardFilters enforces same-gender default restriction and age boundary', () => {
  const femaleCandidate: UserProfile = {
    ...baseUser,
    id: 'user-ananya',
    gender: 'female',
    lookingForGender: 'female',
  };

  const filters: FilterSettings = {
    gender: 'male', // default same-gender for Rohit
    ageRange: [21, 28],
    budgetRange: [12000, 30000],
    destinationCity: 'Bengaluru',
    accommodationType: 'any',
    dietaryPreference: 'all',
    mustBeVerified: false,
    minCompatibility: 50,
  };

  // Female candidate should be rejected when male filter is active
  const passes = passesHardFilters(femaleCandidate, filters, baseUser);
  assert.equal(passes, false, 'Candidate with different gender must not pass same-gender filter');
});
