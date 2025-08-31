// Enums
export enum PlaceCategory {
  HISTORICAL = 'historical',
  BEACH = 'beach',
  HILL_STATION = 'hill_station',
  WILDLIFE = 'wildlife',
  PILGRIMAGE = 'pilgrimage',
  ADVENTURE = 'adventure',
  CULTURAL = 'cultural'
}

export enum SpecialtyType {
  FOOD = 'food',
  CRAFT = 'craft',
  CULTURE = 'culture'
}

export enum TransportType {
  BUS = 'bus',
  TRAIN = 'train',
  FLIGHT = 'flight',
  TAXI = 'taxi',
  METRO = 'metro'
}

// Base Entity
export interface BaseEntity {
  id: string;
  created_at: Date;
  updated_at: Date;
}

export interface PriceRange {
  startingFrom?: number;
  currency?: string;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

// State Interface
export interface State extends BaseEntity {
  name: string;
  code: string;
  description?: string;
  capital?: string;
  region?: string;
  population?: number;
  area_km2?: number;
  languages?: string[];
  best_time_to_visit?: string;
  image_url?: string;
}

// City Interface
export interface City extends BaseEntity {
  name: string;
  state: string;
  state_id?: string;
  state_details?: State;
  description?: string;
  coordinates: Coordinates;
  population?: number;
  area?: number; // in sq km
  climate?: string;
  best_time_to_visit?: string;
  famous_for?: string[];
  images?: string[];
  places?: Place[]; // Relations
  local_specialties?: LocalSpecialty[]; // Relations
  events?: Event[]; // Relations
  transport_options?: TransportOption[]; // Relations
}

// Enhanced Place Interface
export interface Place extends BaseEntity {
  name: string;
  city_id: string;
  city?: City; // Relation
  state: string;
  description?: string;
  imageUrl?: string;
  images?: string[];
  rating?: number;
  reviewCount?: number;
  category: PlaceCategory;
  duration?: string;
  bestTime?: string;
  price?: PriceRange;
  coordinates?: Coordinates;
  tags?: string[];
  opening_hours?: string;
  entry_fee?: PriceRange;
  accessibility_features?: string[];
  facilities?: string[];
  nearby_places?: string[]; // Array of place IDs
  reviews?: Review[]; // Relations
  events?: Event[]; // Relations
}

// Review Interface
export interface Review extends BaseEntity {
  place_id: string;
  place?: Place; // Relation
  user_name: string;
  user_email?: string;
  rating: number;
  title?: string;
  content: string;
  images?: string[];
  helpful_count?: number;
  verified_visit?: boolean;
  visit_date?: Date;
}

// Local Specialty Interface
export interface LocalSpecialty extends BaseEntity {
  name: string;
  city_id: string;
  city?: City; // Relation
  type: SpecialtyType;
  description: string;
  image?: string;
  where_to_find?: string;
  price_range?: PriceRange;
  best_season?: string;
  popularity_rating?: number;
}

// Event Interface
export interface Event extends BaseEntity {
  name: string;
  city_id?: string;
  place_id?: string;
  city?: City; // Relation
  place?: Place; // Relation
  description: string;
  start_date: Date;
  end_date: Date;
  event_type: string;
  location: string;
  coordinates?: Coordinates;
  ticket_price?: PriceRange;
  capacity?: number;
  organizer?: string;
  contact_info?: string;
  images?: string[];
  tags?: string[];
}

// Transport Option Interface
export interface TransportOption extends BaseEntity {
  city_id: string;
  city?: City; // Relation
  type: TransportType;
  name: string;
  description?: string;
  routes?: string[];
  frequency?: string;
  operating_hours?: string;
  price_range?: PriceRange;
  booking_info?: string;
  contact_details?: string;
}

// Enhanced Data Context Type
export interface DataContextType {
  // Data
  places: Place[];
  cities: City[];
  states: State[];
  selectedState: State | null;
  stateDetails: State | null;
  
  // Loading states
  loading: boolean;
  placesLoading: boolean;
  citiesLoading: boolean;
  statesLoading: boolean;
  stateDetailsLoading: boolean;
  
  // Error states
  error: Error | null;
  placesError: Error | null;
  citiesError: Error | null;
  statesError: Error | null;
  stateDetailsError: Error | null;
  
  // State methods
  fetchStates: () => Promise<void>;
  selectState: (stateId: string | null) => Promise<void>;
  getStateById: (id: string) => Promise<State | null>;
  searchStates: (query: string) => Promise<State[]>;
  
  // Search methods
  searchPlaces?: (query: string) => Promise<Place[]>;
  searchCities?: (query: string) => Promise<City[]>;
  
  // Filter methods
  filterPlacesByCategory?: (category: PlaceCategory) => Place[];
  filterPlacesByCity?: (cityId: string) => Place[];
  filterPlacesByState?: (state: string) => Place[];
  
  // Get methods
  getPlaceById?: (id: string) => Place | undefined;
  getCityById?: (id: string) => City | undefined;
  getCitiesByState?: (state: string) => City[];
  
  // Reviews
  getReviewsByPlace?: (placeId: string) => Review[];
  addReview?: (review: Omit<Review, keyof BaseEntity>) => Promise<Review>;
  
  // Local Specialties
  getSpecialtiesByCity?: (cityId: string) => LocalSpecialty[];
  getSpecialtiesByType?: (type: SpecialtyType) => LocalSpecialty[];
  
  // Events
  getEventsByCity?: (cityId: string) => Event[];
  getEventsByPlace?: (placeId: string) => Event[];
  getUpcomingEvents?: () => Event[];
  
  // Transport Options
  getTransportByCity?: (cityId: string) => TransportOption[];
  getTransportByType?: (type: TransportType) => TransportOption[];
}

// Utility Types
export type PlaceWithCity = Place & {
  city: City;
};

export type CityWithPlaces = City & {
  places: Place[];
};

export type PlaceFilter = {
  category?: PlaceCategory;
  state?: string;
  cityId?: string;
  minRating?: number;
  maxPrice?: number;
  tags?: string[];
};

export type CityFilter = {
  state?: string;
  minPopulation?: number;
  maxPopulation?: number;
  hasPlaces?: boolean;
};

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
  total?: number;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Form Types
export interface CreatePlaceForm {
  name: string;
  city_id: string;
  description?: string;
  category: PlaceCategory;
  coordinates?: Coordinates;
  tags?: string[];
  images?: File[];
}

export interface CreateReviewForm {
  place_id: string;
  user_name: string;
  user_email?: string;
  rating: number;
  title?: string;
  content: string;
  images?: File[];
  visit_date?: Date;
}

export interface UpdatePlaceForm extends Partial<CreatePlaceForm> {
  id: string;
}