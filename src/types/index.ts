export type SleepSchedule = 'early_bird' | 'night_owl' | 'flexible';
export type Cleanliness = 'tidy_freak' | 'moderate' | 'relaxed';
export type SmokingPolicy = 'non_smoker' | 'social_smoker' | 'smoker';
export type CookingHabit = 'daily_cook' | 'occasional' | 'takeout_only';
export type GuestPolicy = 'rarely' | 'weekends_only' | 'open';
export type SocialStyle = 'quiet_introvert' | 'balanced' | 'social_butterfly';
export type NoisePreference = 'quiet_focus' | 'moderate' | 'lively_music';
export type PetPreference = 'loves_pets' | 'no_pets' | 'allergic';

export type DietaryPreference = 'vegetarian' | 'non_vegetarian' | 'eggetarian' | 'vegan' | 'no_preference';
export type AccommodationType = 'pg' | 'shared_flat' | 'private_room' | 'shared_room' | 'hostel' | 'apartment_sharing' | 'any';
export type FurnishingType = 'furnished' | 'semi_furnished' | 'unfurnished' | 'any';
export type FoodInclusion = 'included' | 'excluded' | 'flexible';

export interface UserLifestyle {
  sleepSchedule: SleepSchedule;
  cleanliness: Cleanliness;
  smoking: SmokingPolicy;
  cooking: CookingHabit;
  guestPolicy: GuestPolicy;
  socialStyle: SocialStyle;
  noisePreference: NoisePreference;
  petPreference: PetPreference;
  dietaryPreference: DietaryPreference;
  furnishing?: FurnishingType;
  foodInclusion?: FoodInclusion;
}

export interface UserProfile {
  id: string; // matches Firebase Auth UID
  userId?: string;
  name: string;
  age: number; // 18+
  gender: 'male' | 'female' | 'non_binary' | 'prefer_not_to_say';
  phone?: string; // +91 format
  occupation: string;
  collegeOrCompany: string;
  companyOrCollege?: string;
  bio: string;
  currentCity: string;
  destinationCity: string;
  locality?: string;
  budgetMin: number; // in INR (₹)
  budgetMax: number; // in INR (₹)
  moveInDate: string; // DD/MM/YYYY
  accommodationType: AccommodationType;
  lifestyle: UserLifestyle;
  photos: string[];
  interests: string[];
  isVerified: boolean;
  verificationMethod?: 'selfie_id' | 'work_email' | 'student_id';
  lookingForGender: 'any' | 'male' | 'female';
  dealBreakers: string[];
  isDemo?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CompatibilityResult {
  score: number;
  breakdown: {
    budget: number;
    location: number;
    dietary: number;
    lifestyle: number;
    habits: number;
  };
  highlights: string[];
  cautions: string[];
}

export interface MatchItem {
  id: string;
  userId: string;
  user: UserProfile;
  matchedAt: string;
  compatibilityScore: number;
  breakdown: CompatibilityResult['breakdown'];
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
}

export interface ChatMessage {
  id: string;
  matchId: string;
  senderId: string;
  recipientId: string;
  content: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
}

export interface FilterSettings {
  gender: 'any' | 'male' | 'female';
  ageRange: [number, number];
  budgetRange: [number, number]; // in INR (₹)
  destinationCity: string;
  locality?: string;
  accommodationType: string;
  dietaryPreference: string;
  mustBeVerified: boolean;
  minCompatibility: number;
}

export interface AccommodationListing {
  id: string;
  title: string;
  locality: string;
  city: string;
  rentPerPerson: number; // in INR (₹)
  totalBedrooms: number;
  availableBedrooms: number;
  bathrooms: number;
  moveInDate: string;
  accommodationType: AccommodationType;
  furnishing: FurnishingType;
  foodIncluded: boolean;
  images: string[];
  amenities: string[];
  tags: string[];
  hostName: string;
  hostAvatar: string;
  hostOccupation: string;
  description: string;
}

export const INDIAN_CITIES = [
  'Bengaluru',
  'Delhi',
  'Gurugram',
  'Noida',
  'Mumbai',
  'Pune',
  'Hyderabad',
  'Chennai',
  'Chandigarh',
  'Ludhiana',
  'Jaipur',
  'Kolkata',
  'Ahmedabad',
] as const;

export const POPULAR_LOCALITIES: Record<string, string[]> = {
  'Bengaluru': ['Koramangala', 'HSR Layout', 'Indiranagar', 'Whitefield', 'Bellandur', 'BTM Layout', 'Jayanagar', 'Electronic City'],
  'Delhi': ['Hauz Khas', 'Saket', 'Lajpat Nagar', 'South Extension', 'Greater Kailash', 'Dwarka', 'Rohini', 'North Campus / DU'],
  'Gurugram': ['DLF Phase 1-5', 'Cyber City', 'Sector 56', 'Golf Course Road', 'Sohna Road', 'Sector 48', 'MG Road'],
  'Noida': ['Sector 62', 'Sector 18', 'Sector 137', 'Sector 50', 'Sector 76', 'Sector 128'],
  'Mumbai': ['Bandra West', 'Andheri East', 'Andheri West', 'Powai', 'Lower Parel', 'Juhu', 'Dadar', 'Malad'],
  'Pune': ['Hinjewadi', 'Viman Nagar', 'Koregaon Park', 'Baner', 'Aundh', 'Wakad', 'Kharadi', 'Magarpatta'],
  'Hyderabad': ['Gachibowli', 'Hitec City', 'Madhapur', 'Kondapur', 'Jubilee Hills', 'Banjara Hills', 'Kukatpally'],
  'Chennai': ['OMR / Thoraipakkam', 'Adyar', 'Velachery', 'Besant Nagar', 'T. Nagar', 'Anna Nagar'],
  'Chandigarh': ['Sector 17', 'Sector 35', 'Sector 22', 'Sector 43', 'Mohali Phase 7', 'Panchkula Sector 20'],
  'Ludhiana': ['Sarabha Nagar', 'Model Town', 'Civil Lines', 'BRS Nagar', 'Pakhowal Road'],
  'Jaipur': ['Malviya Nagar', 'Vaishali Nagar', 'C-Scheme', 'Mansarovar', 'Raja Park', 'Tonk Road'],
  'Kolkata': ['Salt Lake (Bidhannagar)', 'New Town', 'Park Street', 'Ballygunge', 'South City / Jadavpur'],
  'Ahmedabad': ['Bodakdev', 'Satellite', 'Vastrapur', 'Prahlad Nagar', 'Navrangpura', 'SG Highway'],
};
