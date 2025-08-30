export interface PriceRange {
  startingFrom?: number;
  currency?: string;
}

export interface Place {
  id: string;
  name: string;
  city: string;
  state: string;
  description?: string;
  imageUrl?: string;
  rating?: number;
  reviewCount?: number;
  category?: string;
  duration?: string;
  bestTime?: string;
  price?: PriceRange;
  images?: string[];
  coordinates?: {
    lat: number;
    lng: number;
  };
  tags?: string[];
  // Add other place properties as needed
}

export interface DataContextType {
  places: Place[];
  loading: boolean;
  error: Error | null;
  searchCities?: (query: string) => Promise<Place[]>;
  // Add other context methods as needed
}
