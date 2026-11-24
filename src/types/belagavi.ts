export type LanguageCode = 'EN' | 'KN' | 'MR';

export type DestinationCategory =
  | 'Forts & Heritage'
  | 'Waterfalls & Nature'
  | 'Spiritual & Landmarks';

export interface Destination {
  id: string;
  name: string;
  category: DestinationCategory;
  tags: DestinationCategory[];
  lat: number;
  lng: number;
  distanceKm: number;
  bestSeason: string;
  rating: number;
  image: string;
  description: string;
  highlights: string;
}

export type StayCategory =
  | 'Luxury & Business Hotels'
  | 'Heritage & Boutique Stays'
  | 'Nature & Forest Resorts';

export interface Stay {
  id: string;
  name: string;
  category: StayCategory;
  area: string;
  lat: number;
  lng: number;
  distanceKm: number;
  rating: number;
  starRating: number;
  pricePerNight: number;
  roomTypes: string[];
  defaultRoomType: string;
  amenities: string[];
  image: string;
  description: string;
}

export type CultureTab = 'food' | 'art' | 'activities';

export interface CultureItem {
  id: string;
  tab: CultureTab;
  title: string;
  metaPrimary: string;
  metaSecondary: string;
  image: string;
  description: string;
}

export interface FoodSpot {
  id: string;
  name: string;
  specialty: string;
  area: string;
  lat: number;
  lng: number;
  distanceKm: number;
  rating: number;
  image: string;
}

export type GalleryCategory = 'Destinations' | 'Stays' | 'Food' | 'Culture';

export interface GalleryPhoto {
  id: string;
  title: string;
  category: GalleryCategory;
  location: string;
  image: string;
  createdAt: string;
}

export interface VisitorReview {
  id: string;
  name: string;
  location: string;
  rating: number;
  visitedSeason: string;
  comment: string;
  createdAt: string;
}

export type TripDuration = '1 Day' | '2 Days / 1 Night' | '3 Days / 2 Nights';
export type BudgetTier = 'Budget' | 'Standard' | 'Premium';
export type TripStatus = 'Pending' | 'Confirmed' | 'Completed';

export interface TripFormInput {
  destinationIds: string[];
  stayId: string;
  roomType: string;
  rooms: number;
  experiences: string[];
  bookmarkedCultureIds: string[];
  fullName: string;
  email: string;
  phone: string;
  travelDate: string;
  duration: TripDuration;
  adults: number;
  children: number;
  budgetTier: BudgetTier;
  notes: string;
}

export interface DayPlan {
  day: number;
  title: string;
  stops: string[];
  eveningNote: string;
}

export interface TripEstimate {
  nights: number;
  stayCost: number;
  sightseeingCost: number;
  totalCost: number;
  totalRouteKm: number;
  estimatedDriveMinutes: number;
  formattedDriveTime: string;
  dayPlans: DayPlan[];
}

export interface TripRequest extends TripFormInput {
  id: string;
  bookingId: string;
  status: TripStatus;
  stayName: string;
  destinationNames: string[];
  bookmarkedCultureNames: string[];
  estimatedBudget: number;
  routeDistanceKm: number;
  estimatedDriveTime: string;
  createdAt: string;
}

export interface ContentPayload {
  destinations: Destination[];
  stays: Stay[];
  cultureItems: CultureItem[];
  foodSpots: FoodSpot[];
  gallery: GalleryPhoto[];
  reviews: VisitorReview[];
}
