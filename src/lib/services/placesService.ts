// lib/services/placesService.ts
import { supabase } from '../supabase';

export interface Place {
  id: string;
  name: string;
  description: string;
  location: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  category: string;
  rating: number;
  price_range: string;
  best_time_to_visit: string;
  duration: string;
  image_url: string;
  images: string[];
  features: string[];
  contact_info: {
    phone?: string;
    email?: string;
    website?: string;
  };
  opening_hours: {
    [key: string]: string;
  };
  entry_fee: number;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PlaceReview {
  id: string;
  place_id: string;
  user_name: string;
  rating: number;
  review_text: string;
  visit_date: string;
  created_at: string;
}

export interface PlaceAmenity {
  id: string;
  place_id: string;
  amenity_name: string;
  amenity_type: string;
  is_available: boolean;
}

export interface CreatePlaceData {
  name: string;
  description: string;
  location: string;
  state: string;
  category: string;
  latitude?: number;
  longitude?: number;
  rating?: number;
  price_range?: string;
  best_time_to_visit?: string;
  duration?: string;
  image_url?: string;
  images?: string[];
  features?: string[];
  contact_info?: object;
  opening_hours?: object;
  entry_fee?: number;
  is_featured?: boolean;
}

export interface UpdatePlaceData extends Partial<CreatePlaceData> {
  id: string;
}

class PlacesService {
  // Fetch all places with optional filters
  async getAllPlaces(filters?: {
    state?: string;
    category?: string;
    featured?: boolean;
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    try {
      let query = supabase
        .from('places')
        .select('*')
        .eq('is_active', true)
        .order('is_featured', { ascending: false })
        .order('rating', { ascending: false });

      if (filters?.state) {
        query = query.eq('state', filters.state);
      }

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.featured) {
        query = query.eq('is_featured', true);
      }

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,location.ilike.%${filters.search}%`);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Place[];
    } catch (error) {
      console.error('Error fetching places:', error);
      throw error;
    }
  }

  // Fetch featured places
  async getFeaturedPlaces(limit: number = 6) {
    try {
      const { data, error } = await supabase
        .from('places')
        .select('*')
        .eq('is_featured', true)
        .eq('is_active', true)
        .order('rating', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as Place[];
    } catch (error) {
      console.error('Error fetching featured places:', error);
      throw error;
    }
  }

  // Fetch places by category
  async getPlacesByCategory(category: string, limit?: number) {
    try {
      let query = supabase
        .from('places')
        .select('*')
        .eq('category', category)
        .eq('is_active', true)
        .order('rating', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Place[];
    } catch (error) {
      console.error('Error fetching places by category:', error);
      throw error;
    }
  }

  // Fetch places by state
  async getPlacesByState(state: string, limit?: number) {
    try {
      let query = supabase
        .from('places')
        .select('*')
        .eq('state', state)
        .eq('is_active', true)
        .order('rating', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Place[];
    } catch (error) {
      console.error('Error fetching places by state:', error);
      throw error;
    }
  }

  // Fetch single place by ID with reviews
  async getPlaceById(id: string) {
    try {
      const { data: place, error: placeError } = await supabase
        .from('places')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (placeError) throw placeError;

      // Fetch reviews for this place
      const { data: reviews, error: reviewsError } = await supabase
        .from('places_reviews')
        .select('*')
        .eq('place_id', id)
        .order('created_at', { ascending: false });

      if (reviewsError) throw reviewsError;

      // Fetch amenities for this place
      const { data: amenities, error: amenitiesError } = await supabase
        .from('places_amenities')
        .select('*')
        .eq('place_id', id)
        .eq('is_available', true);

      if (amenitiesError) throw amenitiesError;

      return {
        place: place as Place,
        reviews: reviews as PlaceReview[],
        amenities: amenities as PlaceAmenity[]
      };
    } catch (error) {
      console.error('Error fetching place by ID:', error);
      throw error;
    }
  }

  // Search places
  async searchPlaces(searchTerm: string, filters?: {
    state?: string;
    category?: string;
    limit?: number;
  }) {
    try {
      let query = supabase
        .from('places')
        .select('*')
        .eq('is_active', true)
        .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`)
        .order('rating', { ascending: false });

      if (filters?.state) {
        query = query.eq('state', filters.state);
      }

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Place[];
    } catch (error) {
      console.error('Error searching places:', error);
      throw error;
    }
  }

  // Create new place
  async createPlace(placeData: CreatePlaceData) {
    try {
      const { data, error } = await supabase
        .from('places')
        .insert([placeData])
        .select()
        .single();

      if (error) throw error;
      return data as Place;
    } catch (error) {
      console.error('Error creating place:', error);
      throw error;
    }
  }

  // Update place
  async updatePlace(placeData: UpdatePlaceData) {
    try {
      const { id, ...updateData } = placeData;
      
      const { data, error } = await supabase
        .from('places')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Place;
    } catch (error) {
      console.error('Error updating place:', error);
      throw error;
    }
  }

  // Delete place (soft delete)
  async deletePlace(id: string) {
    try {
      const { data, error } = await supabase
        .from('places')
        .update({ is_active: false })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Place;
    } catch (error) {
      console.error('Error deleting place:', error);
      throw error;
    }
  }

  // Add review to place
  async addReview(placeId: string, reviewData: {
    user_name: string;
    rating: number;
    review_text: string;
    visit_date?: string;
  }) {
    try {
      const { data, error } = await supabase
        .from('places_reviews')
        .insert([{
          place_id: placeId,
          ...reviewData,
          visit_date: reviewData.visit_date || new Date().toISOString().split('T')[0]
        }])
        .select()
        .single();

      if (error) throw error;

      // Update place rating
      await this.updatePlaceRating(placeId);
      
      return data as PlaceReview;
    } catch (error) {
      console.error('Error adding review:', error);
      throw error;
    }
  }

  // Update place rating based on reviews
  private async updatePlaceRating(placeId: string) {
    try {
      const { data: reviews, error } = await supabase
        .from('places_reviews')
        .select('rating')
        .eq('place_id', placeId);

      if (error) throw error;

      if (reviews && reviews.length > 0) {
        const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
        
        await supabase
          .from('places')
          .update({ rating: Math.round(averageRating * 10) / 10 })
          .eq('id', placeId);
      }
    } catch (error) {
      console.error('Error updating place rating:', error);
    }
  }

  // Get unique states
  async getStates() {
    try {
      const { data, error } = await supabase
        .from('places')
        .select('state')
        .eq('is_active', true)
        .order('state');

      if (error) throw error;

      const uniqueStates = [...new Set(data.map(item => item.state))];
      return uniqueStates;
    } catch (error) {
      console.error('Error fetching states:', error);
      throw error;
    }
  }

  // Get unique categories
  async getCategories() {
    try {
      const { data, error } = await supabase
        .from('places')
        .select('category')
        .eq('is_active', true)
        .order('category');

      if (error) throw error;

      const uniqueCategories = [...new Set(data.map(item => item.category))];
      return uniqueCategories;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  // Get places statistics
  async getPlacesStats() {
    try {
      const { count: totalPlaces, error: totalError } = await supabase
        .from('places')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      const { count: featuredPlaces, error: featuredError } = await supabase
        .from('places')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .eq('is_featured', true);

      const { data: topRatedPlaces, error: topRatedError } = await supabase
        .from('places')
        .select('*')
        .eq('is_active', true)
        .order('rating', { ascending: false })
        .limit(5);

      if (totalError || featuredError || topRatedError) {
        throw totalError || featuredError || topRatedError;
      }

      return {
        totalPlaces: totalPlaces || 0,
        featuredPlaces: featuredPlaces || 0,
        topRatedPlaces: topRatedPlaces || []
      };
    } catch (error) {
      console.error('Error fetching places stats:', error);
      throw error;
    }
  }
}

export const placesService = new PlacesService();
export default placesService;