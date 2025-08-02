// context/DataContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import placesService, { Place, PlaceReview } from '../lib/services/placesService';

interface DataContextType {
  // Places data
  places: Place[];
  featuredPlaces: Place[];
  loading: boolean;
  error: string | null;
  
  // Filters and search
  selectedState: string | null;
  selectedCategory: string | null;
  searchQuery: string;
  
  // Available options
  states: string[];
  categories: string[];
  
  // Statistics
  placesStats: {
    totalPlaces: number;
    featuredPlaces: number;
    topRatedPlaces: Place[];
  };
  
  // Actions
  fetchPlaces: (filters?: any) => Promise<void>;
  fetchFeaturedPlaces: () => Promise<void>;
  fetchPlacesByState: (state: string) => Promise<Place[]>;
  fetchPlacesByCategory: (category: string) => Promise<Place[]>;
  searchPlaces: (query: string) => Promise<Place[]>;
  getPlaceById: (id: string) => Promise<{ place: Place; reviews: PlaceReview[]; amenities: any[] } | null>;
  
  // Filters
  setSelectedState: (state: string | null) => void;
  setSelectedCategory: (category: string | null) => void;
  setSearchQuery: (query: string) => void;
  clearFilters: () => void;
  
  // Admin functions (if needed)
  createPlace: (placeData: any) => Promise<Place | null>;
  updatePlace: (placeData: any) => Promise<Place | null>;
  deletePlace: (id: string) => Promise<boolean>;
  addReview: (placeId: string, reviewData: any) => Promise<boolean>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  // State management
  const [places, setPlaces] = useState<Place[]>([]);
  const [featuredPlaces, setFeaturedPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Options
  const [states, setStates] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  
  // Statistics
  const [placesStats, setPlacesStats] = useState({
    totalPlaces: 0,
    featuredPlaces: 0,
    topRatedPlaces: [] as Place[]
  });

  // Initialize data on mount
  useEffect(() => {
    initializeData();
  }, []);

  // Fetch data when filters change
  useEffect(() => {
    if (!loading) {
      fetchPlaces({
        state: selectedState,
        category: selectedCategory,
        search: searchQuery
      });
    }
  }, [selectedState, selectedCategory, searchQuery]);

  const initializeData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch initial data in parallel
      const [
        placesData,
        featuredData,
        statesData,
        categoriesData,
        statsData
      ] = await Promise.all([
        placesService.getAllPlaces({ limit: 50 }),
        placesService.getFeaturedPlaces(),
        placesService.getStates(),
        placesService.getCategories(),
        placesService.getPlacesStats()
      ]);
      
      setPlaces(placesData);
      setFeaturedPlaces(featuredData);
      setStates(statesData);
      setCategories(categoriesData);
      setPlacesStats(statsData);
      
    } catch (err) {
      console.error('Error initializing data:', err);
      setError('Failed to load places data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPlaces = async (filters?: {
    state?: string | null;
    category?: string | null;
    search?: string;
    limit?: number;
    offset?: number;
  }) => {
    try {
      setError(null);
      const data = await placesService.getAllPlaces({
        state: filters?.state || undefined,
        category: filters?.category || undefined,
        search: filters?.search || undefined,
        limit: filters?.limit,
        offset: filters?.offset
      });
      setPlaces(data);
    } catch (err) {
      console.error('Error fetching places:', err);
      setError('Failed to fetch places');
    }
  };

  const fetchFeaturedPlaces = async () => {
    try {
      const data = await placesService.getFeaturedPlaces();
      setFeaturedPlaces(data);
    } catch (err) {
      console.error('Error fetching featured places:', err);
    }
  };

  const fetchPlacesByState = async (state: string): Promise<Place[]> => {
    try {
      return await placesService.getPlacesByState(state);
    } catch (err) {
      console.error('Error fetching places by state:', err);
      return [];
    }
  };

  const fetchPlacesByCategory = async (category: string): Promise<Place[]> => {
    try {
      return await placesService.getPlacesByCategory(category);
    } catch (err) {
      console.error('Error fetching places by category:', err);
      return [];
    }
  };

  const searchPlaces = async (query: string): Promise<Place[]> => {
    try {
      return await placesService.searchPlaces(query, {
        state: selectedState || undefined,
        category: selectedCategory || undefined
      });
    } catch (err) {
      console.error('Error searching places:', err);
      return [];
    }
  };

  const getPlaceById = async (id: string) => {
    try {
      return await placesService.getPlaceById(id);
    } catch (err) {
      console.error('Error fetching place by ID:', err);
      return null;
    }
  };

  const clearFilters = () => {
    setSelectedState(null);
    setSelectedCategory(null);
    setSearchQuery('');
  };

  // Admin functions
  const createPlace = async (placeData: any): Promise<Place | null> => {
    try {
      const newPlace = await placesService.createPlace(placeData);
      setPlaces(prev => [newPlace, ...prev]);
      
      // Refresh featured places if the new place is featured
      if (newPlace.is_featured) {
        await fetchFeaturedPlaces();
      }
      
      return newPlace;
    } catch (err) {
      console.error('Error creating place:', err);
      setError('Failed to create place');
      return null;
    }
  };

  const updatePlace = async (placeData: any): Promise<Place | null> => {
    try {
      const updatedPlace = await placesService.updatePlace(placeData);
      
      setPlaces(prev => prev.map(place => 
        place.id === updatedPlace.id ? updatedPlace : place
      ));
      
      setFeaturedPlaces(prev => prev.map(place => 
        place.id === updatedPlace.id ? updatedPlace : place
      ));
      
      return updatedPlace;
    } catch (err) {
      console.error('Error updating place:', err);
      setError('Failed to update place');
      return null;
    }
  };

  const deletePlace = async (id: string): Promise<boolean> => {
    try {
      await placesService.deletePlace(id);
      
      setPlaces(prev => prev.filter(place => place.id !== id));
      setFeaturedPlaces(prev => prev.filter(place => place.id !== id));
      
      return true;
    } catch (err) {
      console.error('Error deleting place:', err);
      setError('Failed to delete place');
      return false;
    }
  };

  const addReview = async (placeId: string, reviewData: any): Promise<boolean> => {
    try {
      await placesService.addReview(placeId, reviewData);
      
      // Refresh the place data to get updated rating
      const filters = {
        state: selectedState,
        category: selectedCategory,
        search: searchQuery
      };
      await fetchPlaces(filters);
      
      return true;
    } catch (err) {
      console.error('Error adding review:', err);
      setError('Failed to add review');
      return false;
    }
  };

  const contextValue: DataContextType = {
    // Data
    places,
    featuredPlaces,
    loading,
    error,
    
    // Filters
    selectedState,
    selectedCategory,
    searchQuery,
    
    // Options
    states,
    categories,
    
    // Statistics
    placesStats,
    
    // Actions
    fetchPlaces,
    fetchFeaturedPlaces,
    fetchPlacesByState,
    fetchPlacesByCategory,
    searchPlaces,
    getPlaceById,
    
    // Filter actions
    setSelectedState,
    setSelectedCategory,
    setSearchQuery,
    clearFilters,
    
    // Admin actions
    createPlace,
    updatePlace,
    deletePlace,
    addReview
  };

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}

export default DataContext;