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

interface DataContextType {
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
  fetchPlaces: () => Promise<void>;
  fetchCities: () => Promise<void>;
  fetchStates: () => Promise<void>;
  fetchCitiesByState: (stateName: string) => Promise<City[]>;
  searchPlaces: (query: string) => Promise<Place[]>;
  searchCities: (query: string) => Promise<City[]>;
  searchStates: (query: string) => Promise<State[]>;
  selectState: (stateId: string | null) => Promise<void>;
  getStateById: (stateId: string) => Promise<State | null>;
  getCityById: (cityId: string) => City | null;
  getPlaceById: (placeId: string) => Place | null;
  addReview: (review: Omit<Review, 'id' | 'created_at' | 'updated_at'>) => Promise<Review>;
  // Filter methods
  filterPlacesByCategory: (category: PlaceCategory) => Place[];
  filterPlacesByCity: (cityId: string) => Place[];
  filterPlacesByState: (stateName: string) => Place[];
  getCitiesByState: (stateName: string) => City[];
  // Event methods
  getEventsByCity: (cityId: string) => Event[];
  getEventsByPlace: (placeId: string) => Event[];
  getUpcomingEvents: () => Event[];
  // Transport methods
  getTransportByCity: (cityId: string) => TransportOption[];
  getTransportByType: (type: TransportType) => TransportOption[];
  // Review methods
  getReviewsByPlace: (placeId: string) => Review[];
  // Specialty methods
  getSpecialtiesByCity: (cityId: string) => LocalSpecialty[];
  getSpecialtiesByType: (type: SpecialtyType) => LocalSpecialty[];
}

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

  const fetchStates = useCallback(async (): Promise<void> => {
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
  }, []);
  
  const selectState = useCallback(async (stateId: string | null) => {
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
  }, []);

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

  const searchStates = useCallback(async (query: string): Promise<State[]> => {
    try {
      const { data, error } = await supabase
        .rpc('search_states', { query });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error searching states:', err);
      return [];
    }
  }, []);

  const fetchPlaces = useCallback(async (): Promise<void> => {
    try {
      setState(prev => ({ ...prev, placesLoading: true, placesError: null }));
      
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
  }, []);

  const fetchCities = useCallback(async (): Promise<void> => {
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
  }, []);

  const getCityById = useCallback((id: string): City | null => {
    return state.cities.find(city => city.id === id) || null;
  }, [state.cities]);

  const getPlaceById = useCallback((id: string): Place | null => {
    return state.places.find(place => place.id === id) || null;
  }, [state.places]);

  const getCitiesByState = useCallback((stateName: string): City[] => {
    return state.cities.filter(city => 
      city.state.toLowerCase().includes(stateName.toLowerCase())
    );
  }, [state.cities]);

  const searchPlaces = useCallback(async (query: string): Promise<Place[]> => {
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
  }, [state.places]);

  const searchCities = useCallback(async (query: string): Promise<City[]> => {
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
  }, [state.cities]);

  const filterPlacesByCategory = useCallback((category: PlaceCategory): Place[] => {
    return state.places.filter(place => place.category === category);
  }, [state.places]);

  const filterPlacesByCity = useCallback((cityId: string): Place[] => {
    return state.places.filter(place => place.city_id === cityId);
  }, [state.places]);

  const filterPlacesByState = useCallback((stateName: string): Place[] => {
    return state.places.filter(place => 
      place.state.toLowerCase().includes(stateName.toLowerCase())
    );
  }, [state.places]);

  const getReviewsByPlace = useCallback((placeId: string): Review[] => {
    const place = getPlaceById(placeId);
    return place?.reviews || [];
  }, [getPlaceById]);

  const addReview = useCallback(async (review: Omit<Review, 'id' | 'created_at' | 'updated_at'>): Promise<Review> => {
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
  }, []);

  const getSpecialtiesByCity = useCallback((cityId: string): LocalSpecialty[] => {
    const city = getCityById(cityId);
    return city?.local_specialties || [];
  }, [getCityById]);

  const getSpecialtiesByType = useCallback((type: SpecialtyType): LocalSpecialty[] => {
    return state.cities.flatMap(city => 
      (city.local_specialties || []).filter(specialty => specialty.type === type)
    );
  }, [state.cities]);

  const getEventsByCity = useCallback((cityId: string): Event[] => {
    const city = getCityById(cityId);
    return city?.events || [];
  }, [getCityById]);

  const getEventsByPlace = useCallback((placeId: string): Event[] => {
    const place = getPlaceById(placeId);
    return place?.events || [];
  }, [getPlaceById]);

  const getUpcomingEvents = useCallback((): Event[] => {
    const now = new Date();
    return state.cities.flatMap(city => 
      (city.events || []).filter(event => new Date(event.start_date) >= now)
    ).sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
  }, [state.cities]);

  const getTransportByCity = useCallback((cityId: string): TransportOption[] => {
    const city = getCityById(cityId);
    return city?.transport_options || [];
  }, [getCityById]);

  const getTransportByType = useCallback((type: TransportType): TransportOption[] => {
    return state.cities.flatMap(city => 
      (city.transport_options || []).filter(transport => transport.type === type)
    );
  }, [state.cities]);

  // Function to fetch cities by state name
  const fetchCitiesByState = useCallback(async (stateName: string): Promise<City[]> => {
    try {
      setState(prev => ({ ...prev, citiesLoading: true, citiesError: null }));
      
      const { data: cities, error } = await supabase
        .from('cities')
        .select(`
          *,
          state:states!inner(*)
        `)
        .eq('state.name', stateName)
        .not('name', 'in', '("Vidisha","Satna")')
        .order('name', { ascending: true });

      if (error) throw error;

      // Transform the data to match our City interface
      const processedCities = (cities || []).map(city => ({
        ...city,
        state: city.state?.name || 'Unknown State',
      }));

      return processedCities;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch cities by state');
      console.error('Error fetching cities by state:', error);
      setState(prev => ({ ...prev, citiesError: error }));
      throw error;
    } finally {
      setState(prev => ({ ...prev, citiesLoading: false }));
    }
  }, []);

  const contextValue: DataContextType = {
    // State values
    ...state,
    
    // Data fetching methods
    fetchPlaces,
    fetchCities,
    fetchStates,
    fetchCitiesByState,
    
    // Search methods
    searchPlaces,
    searchCities,
    searchStates,
    
    // State management methods
    selectState,
    getStateById,
    
    // Getter methods
    getCityById,
    getPlaceById,
    getCitiesByState,
    
    // Filter methods
    filterPlacesByState,
    filterPlacesByCity,
    filterPlacesByCategory,
    
    // Event methods
    getEventsByPlace,
    getEventsByCity,
    getUpcomingEvents,
    
    // Transport methods
    getTransportByCity,
    getTransportByType,
    
    // Review methods
    getReviewsByPlace,
    addReview,
    
    // Specialty methods
    getSpecialtiesByCity,
    getSpecialtiesByType,
  };

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
};

export default DataProvider;