import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { 
  DataContextType, 
  Place, 
  City, 
  State,
  Review, 
  PlaceCategory, 
  SpecialtyType, 
  TransportType,
  LocalSpecialty,
  Event,
  TransportOption
} from '../types';

// Combined state interface for better state management
interface DataState {
  places: Place[];
  cities: City[];
  states: State[];
  placesLoading: boolean;
  citiesLoading: boolean;
  statesLoading: boolean;
  placesError: Error | null;
  citiesError: Error | null;
  statesError: Error | null;
  selectedState: State | null;
  stateDetails: State | null;
  stateDetailsLoading: boolean;
  stateDetailsError: Error | null;
}

const initialState: DataState = {
  places: [],
  cities: [],
  states: [],
  placesLoading: false,
  citiesLoading: false,
  statesLoading: false,
  placesError: null,
  citiesError: null,
  statesError: null,
  selectedState: null,
  stateDetails: null,
  stateDetailsLoading: false,
  stateDetailsError: null,
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<DataState>(initialState);

  // Loading and error states are now calculated in the render method

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    await Promise.all([
      fetchPlaces(),
      fetchCities(),
      fetchStates()
    ]);
  };

  const fetchStates = async (): Promise<void> => {
    try {
      setState(prev => ({ ...prev, statesLoading: true, statesError: null }));
      
      // Fetch states from the states table with all necessary fields
      const { data: states, error } = await supabase
        .from('states')
        .select(`
          *,
          cities (
            id,
            name
          )
        `)
        .order('name', { ascending: true });
      
      if (error) throw error;
      
      console.log('Fetched states with cities:', states);
      
      setState(prev => ({
        ...prev,
        states: states || [],
        statesLoading: false
      }));
      
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch states');
      console.error('Error fetching states:', {
        error,
        message: error.message,
        stack: error.stack
      });
      setState(prev => ({
        ...prev,
        statesError: error,
        statesLoading: false
      }));
    }
  };
  
  const selectState = async (stateId: string | null) => {
    try {
      if (!stateId) {
        setState(prev => ({
          ...prev,
          selectedState: null,
          stateDetails: null,
          places: [],
          placesLoading: false
        }));
        return;
      }

      setState(prev => ({
        ...prev,
        placesLoading: true,
        placesError: null,
        stateDetailsLoading: true,
        stateDetailsError: null
      }));

      // Fetch state details
      const { data: stateData, error: stateError } = await supabase
        .from('states')
        .select('*')
        .eq('id', stateId)
        .single();

      if (stateError) throw stateError;
      if (!stateData) throw new Error('State not found');

      // Fetch places for the selected state
      const { data: places, error: placesError } = await supabase
        .from('places')
        .select('*, city:cities(*)')
        .eq('city.state_id', stateId)
        .order('name', { ascending: true });

      if (placesError) throw placesError;

      setState(prev => ({
        ...prev,
        selectedState: stateData,
        stateDetails: stateData,
        places: places || [],
        placesLoading: false,
        stateDetailsLoading: false
      }));
    } catch (err) {
      console.error('Error selecting state:', err);
      setState(prev => ({
        ...prev,
        placesError: err instanceof Error ? err : new Error('Failed to load state data'),
        stateDetailsError: err instanceof Error ? err : new Error('Failed to load state details'),
        placesLoading: false,
        stateDetailsLoading: false
      }));
    }
  };

  const getStateById = useCallback(async (id: string): Promise<State | null> => {
    try {
      const { data, error } = await supabase
        .from('states')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error fetching state:', err);
      return null;
    }
  }, []);

  const searchStates = async (query: string): Promise<State[]> => {
    try {
      const { data, error } = await supabase
        .rpc('search_states', { query });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error searching states:', err);
      return [];
    }
  };

  const fetchPlaces = async (): Promise<void> => {
    try {
      setState(prev => ({ ...prev, placesLoading: true, placesError: null }));
      
      // We'll get states through the cities join
      // Get all places with their city and state information
      const { data: places, error } = await supabase
        .from('places')
        .select(`
          *,
          city:cities (
            *,
            state:states!inner(*)
          )
        `)
        .order('name', { ascending: true });
  
      if (error) throw error;
  
      console.log('Places with city and state data:', places);
      
      // Transform the data to match our expected format
      const processedPlaces = (places || []).map(place => {
        // Get state from the city's state relation or fallback to city.state
        const stateName = place.city?.state?.name || place.city?.state || 'Unknown State';
        
        return {
          ...place,
          state: stateName,
          city: place.city ? {
            ...place.city,
            state: stateName
          } : null
        };
      });
      
      console.log('Processed places with states:', processedPlaces);
      
      setState(prev => ({ 
        ...prev, 
        places: processedPlaces, 
        placesLoading: false 
      }));
  
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch places');
      setState(prev => ({ 
        ...prev, 
        placesError: error, 
        placesLoading: false 
      }));
      console.error('Error details:', {
        error,
        message: error.message,
        stack: error.stack
      });
    }
  };

  const fetchCities = async (): Promise<void> => {
    try {
      setState(prev => ({ ...prev, citiesLoading: true, citiesError: null }));
      
      const { data: cities, error } = await supabase
        .from('cities')
        .select(`
          *,
          places(*),
          local_specialties(*),
          events(*),
          transport_options(*)
        `)
        .order('name', { ascending: true });

      if (error) throw error;

      setState(prev => ({ 
        ...prev, 
        cities: cities || [], 
        citiesLoading: false 
      }));
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch cities');
      setState(prev => ({ 
        ...prev, 
        citiesError: error, 
        citiesLoading: false 
      }));
      console.error('Error fetching cities:', error);
    }
  };

  const getCityById = (id: string): City | undefined => {
    return state.cities.find(city => city.id === id);
  };

  const getPlaceById = (id: string): Place | undefined => {
    return state.places.find(place => place.id === id);
  };

  const getCitiesByState = (stateName: string): City[] => {
    return state.cities.filter(city => 
      city.state.toLowerCase().includes(stateName.toLowerCase())
    );
  };

  const searchPlaces = async (query: string): Promise<Place[]> => {
    if (!query.trim()) return state.places;
    
    const lowercaseQuery = query.toLowerCase().trim();
    
    // First search in local state
    const localResults = state.places.filter(place => 
      place.name.toLowerCase().includes(lowercaseQuery) ||
      (place.description && place.description.toLowerCase().includes(lowercaseQuery)) ||
      (place.tags && place.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))) ||
      (place.city && place.city.name.toLowerCase().includes(lowercaseQuery))
    );

    if (localResults.length > 0) {
      return localResults;
    }

    // If no local results, search database
    try {
      setState(prev => ({ ...prev, placesLoading: true }));
      
      const { data, error } = await supabase
        .from('places')
        .select(`
          *,
          city:cities(*),
          reviews(*),
          events(*)
        `)
        .eq('state', 'Madhya Pradesh')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .order('name', { ascending: true });
      
      if (error) throw error;
      
      return data || [];
    } catch (err) {
      console.error('Error searching places:', err);
      return [];
    } finally {
      setState(prev => ({ ...prev, placesLoading: false }));
    }
  };

  const searchCities = async (query: string): Promise<City[]> => {
    if (!query.trim()) return [];
    
    const lowercaseQuery = query.toLowerCase().trim();
    
    // First search local state
    const localResults = (state.cities || []).filter((city: City) => {
      if (!city) return false;
      return (
        city.name?.toLowerCase().includes(lowercaseQuery) ||
        (city.description && city.description.toLowerCase().includes(lowercaseQuery)) ||
        (city.famous_for && city.famous_for.some(
          item => item && typeof item === 'string' && item.toLowerCase().includes(lowercaseQuery)
        ))
      );
    });

    if (localResults.length > 0) {
      return localResults;
    }

    // If no local results, search database
    try {
      setState(prev => ({ ...prev, citiesLoading: true }));
      
      const { data: cities, error } = await supabase
        .from('cities')
        .select(`
          *,
          places(*),
          local_specialties(*),
          events(*),
          transport_options(*)
        `)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .order('name', { ascending: true });
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      // Ensure we return properly typed City objects
      return (cities as City[]) || [];
    } catch (err) {
      console.error('Error searching cities:', err);
      return [];
    } finally {
      setState(prev => ({ ...prev, citiesLoading: false }));
    }
  };

  const filterPlacesByCategory = (category: PlaceCategory): Place[] => {
    return state.places.filter(place => place.category === category);
  };

  const filterPlacesByCity = (cityId: string): Place[] => {
    return state.places.filter(place => place.city_id === cityId);
  };

  const filterPlacesByState = (stateName: string): Place[] => {
    return state.places.filter(place => 
      place.state.toLowerCase().includes(stateName.toLowerCase())
    );
  };

  const getReviewsByPlace = (placeId: string): Review[] => {
    const place = getPlaceById(placeId);
    return place?.reviews || [];
  };

  const addReview = async (review: Omit<Review, 'id' | 'created_at' | 'updated_at'>): Promise<Review> => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .insert([{
          ...review,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setState(prev => ({
        ...prev,
        places: prev.places.map(place => 
          place.id === review.place_id 
            ? { ...place, reviews: [...(place.reviews || []), data] }
            : place
        )
      }));

      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to add review');
      console.error('Error adding review:', error);
      throw error;
    }
  };

  const getSpecialtiesByCity = (cityId: string): LocalSpecialty[] => {
    const city = getCityById(cityId);
    return city?.local_specialties || [];
  };

  const getSpecialtiesByType = (type: SpecialtyType): LocalSpecialty[] => {
    return state.cities.flatMap(city => 
      (city.local_specialties || []).filter(specialty => specialty.type === type)
    );
  };

  const getEventsByCity = (cityId: string): Event[] => {
    const city = getCityById(cityId);
    return city?.events || [];
  };

  const getEventsByPlace = (placeId: string): Event[] => {
    const place = getPlaceById(placeId);
    return place?.events || [];
  };

  const getUpcomingEvents = (): Event[] => {
    const now = new Date();
    return state.cities.flatMap(city => 
      (city.events || []).filter(event => new Date(event.start_date) >= now)
    ).sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
  };

  const getTransportByCity = (cityId: string): TransportOption[] => {
    const city = getCityById(cityId);
    return city?.transport_options || [];
  };

  const getTransportByType = (type: TransportType): TransportOption[] => {
    return state.cities.flatMap(city => 
      (city.transport_options || []).filter(transport => transport.type === type)
    );
  };

  // Calculate loading and error states
  const currentLoading = state.placesLoading || state.citiesLoading || state.statesLoading || state.stateDetailsLoading;
  const currentError = state.placesError || state.citiesError || state.statesError || state.stateDetailsError;

  return (
    <DataContext.Provider value={{
      // Data
      places: state.places,
      cities: state.cities,
      states: state.states,
      selectedState: state.selectedState,
      stateDetails: state.stateDetails,
      
      // Loading states
      loading: currentLoading,
      placesLoading: state.placesLoading,
      citiesLoading: state.citiesLoading,
      statesLoading: state.statesLoading,
      stateDetailsLoading: state.stateDetailsLoading,
      
      // Error states
      error: currentError,
      placesError: state.placesError,
      citiesError: state.citiesError,
      statesError: state.statesError,
      stateDetailsError: state.stateDetailsError,
      
      // State methods
      fetchStates,
      selectState,
      getStateById,
      searchStates,
      
      // Search methods
      searchPlaces,
      searchCities,
      
      // Filter methods
      filterPlacesByState,
      filterPlacesByCity,
      filterPlacesByCategory,
      
      // Getter methods
      getCityById,
      getCitiesByState,
      getEventsByPlace,
      getUpcomingEvents,
      getTransportByCity,
      getTransportByType,
      getReviewsByPlace,
      getSpecialtiesByCity,
      getSpecialtiesByType,
      getEventsByCity,
      
      // Mutation methods
      addReview,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export default DataProvider;