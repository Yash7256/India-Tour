import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import InteractiveMap from '../components/InteractiveMap';
import OptimizedImage from '../components/OptimizedImage';
import { DestinationCardSkeleton } from '../components/SkeletonLoader';
import { ErrorFallback } from '../components/ErrorBoundary';
import { MapPinIcon, StarIcon, CalendarIcon, FunnelIcon, ViewColumnsIcon, MapIcon } from '@heroicons/react/24/outline';
import { useData } from '../context/DataContext';
import { useToast } from '../components/Toast';

interface SearchFilters {
  states?: string[];
  rating?: number;
  type?: string[];
  sortBy?: 'name' | 'rating' | 'popularity';
  priceRange?: [number, number];
  bestTime?: string[];
}

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { places: cities } = useData();
  const { success, error } = useToast();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState(cities);
  

  // Search suggestions based on available data
  const searchSuggestions = [
    ...cities.map(city => ({
      id: city.id,
      name: city.name,
      type: 'city' as const,
      state: city.state,
      rating: 4.5
    })),
    // Add some sample attractions and states
    { id: 'taj-mahal', name: 'Taj Mahal', type: 'attraction' as const, state: 'Uttar Pradesh', rating: 4.8 },
    { id: 'golden-temple', name: 'Golden Temple', type: 'attraction' as const, state: 'Punjab', rating: 4.7 },
    { id: 'kerala-backwaters', name: 'Kerala Backwaters', type: 'attraction' as const, state: 'Kerala', rating: 4.6 },
    { id: 'rajasthan', name: 'Rajasthan', type: 'state' as const, rating: 4.5 },
    { id: 'goa', name: 'Goa', type: 'state' as const, rating: 4.4 }
  ];

  // Map locations for the map view
  const mapLocations = searchResults.map((city, index) => ({
    id: city.id,
    name: city.name,
    latitude: 20 + (index * 2), // Simulated coordinates
    longitude: 77 + (index * 3),
    type: 'city' as const,
    rating: 4.5,
    description: city.description
  }));

  useEffect(() => {
    const searchQuery = searchParams.get('q');
    if (searchQuery) {
      setQuery(searchQuery);
      performSearch(searchQuery, filters);
    }
  }, [searchParams]);

  const performSearch = async (searchQuery: string, searchFilters: SearchFilters) => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let results = cities;

      // Filter by search query
      if (searchQuery.trim()) {
        results = results.filter(city =>
          city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          city.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
          city.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      // Apply filters
      if (searchFilters.states && searchFilters.states.length > 0) {
        results = results.filter(city => searchFilters.states!.includes(city.state));
      }

      if (searchFilters.rating) {
        results = results.filter(city => city.rating >= searchFilters.rating!);
      }

      // Sort results
      if (searchFilters.sortBy) {
        results.sort((a, b) => {
          switch (searchFilters.sortBy) {
            case 'name':
              return a.name.localeCompare(b.name);
            case 'rating':
              return 4.5 - 4.5; // All have same rating in demo
            case 'popularity':
              return Math.random() - 0.5; // Random for demo
            default:
              return 0;
          }
        });
      }

      setSearchResults(results);
      
      if (searchQuery && results.length > 0) {
        success('Search Complete', `Found ${results.length} destinations`);
      } else if (searchQuery && results.length === 0) {
        error('No Results', 'Try adjusting your search terms or filters');
      }
      
    } catch {
      error('Search Error', 'Unable to perform search. Please try again.');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (searchQuery: string, searchFilters?: SearchFilters) => {
    const newFilters = { ...filters, ...searchFilters };
    setQuery(searchQuery);
    setFilters(newFilters);
    
    // Update URL
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    setSearchParams(params);
    
    performSearch(searchQuery, newFilters);
  };

  const handleLocationClick = (location: any) => {
    navigate(`/city/${location.id}`);
  };

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {isLoading ? (
        Array.from({ length: 6 }).map((_, index) => (
          <DestinationCardSkeleton key={index} />
        ))
      ) : (
        searchResults.map((city) => (
          <div
            key={city.id}
            onClick={() => navigate(`/city/${city.id}`)}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer group"
          >
            <OptimizedImage
              src={city.images[0]}
              alt={city.name}
              className="w-full h-48"
              aspectRatio="photo"
              loading="lazy"
            />
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-orange-600 transition-colors duration-200">
                  {city.name}
                </h3>
                <div className="flex items-center text-yellow-500">
                  <StarIcon className="w-4 h-4 fill-current" />
                  <span className="text-sm text-gray-600 ml-1">4.5</span>
                </div>
              </div>
              
              <div className="flex items-center text-gray-600 mb-2">
                <MapPinIcon className="w-4 h-4 mr-1" />
                <span className="text-sm">{city.state}</span>
              </div>
              
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {city.description}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-500">
                  <CalendarIcon className="w-4 h-4 mr-1" />
                  <span>{city.best_time_to_visit}</span>
                </div>
                <span className="text-orange-600 font-medium text-sm">
                  Explore →
                </span>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderListView = () => (
    <div className="space-y-4">
      {isLoading ? (
        Array.from({ length: 4 }).map((_, index) => (
          <DestinationCardSkeleton key={index} />
        ))
      ) : (
        searchResults.map((city) => (
          <div
            key={city.id}
            onClick={() => navigate(`/city/${city.id}`)}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer group"
          >
            <div className="flex">
              <OptimizedImage
                src={city.images[0]}
                alt={city.name}
                className="w-48 h-32 flex-shrink-0"
                aspectRatio="photo"
                loading="lazy"
              />
              <div className="flex-1 p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-semibold text-gray-900 group-hover:text-orange-600 transition-colors duration-200">
                    {city.name}
                  </h3>
                  <div className="flex items-center text-yellow-500">
                    <StarIcon className="w-5 h-5 fill-current" />
                    <span className="text-sm text-gray-600 ml-1">4.5</span>
                  </div>
                </div>
                
                <div className="flex items-center text-gray-600 mb-3">
                  <MapPinIcon className="w-4 h-4 mr-1" />
                  <span className="text-sm">{city.state}</span>
                </div>
                
                <p className="text-gray-600 mb-3 line-clamp-2">
                  {city.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500">
                    <CalendarIcon className="w-4 h-4 mr-1" />
                    <span>{city.best_time_to_visit}</span>
                  </div>
                  <span className="text-orange-600 font-medium">
                    Explore →
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderMapView = () => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <InteractiveMap
        locations={mapLocations}
        height="600px"
        onLocationClick={handleLocationClick}
        showControls={true}
        className="w-full"
      />
    </div>
  );

  if (searchResults.length === 0 && !isLoading && query) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SearchBar
            onSearch={handleSearch}
            suggestions={searchSuggestions}
            showFilters={true}
            className="mb-8"
          />
          <ErrorFallback 
            error="No destinations found for your search" 
            onRetry={() => handleSearch('')}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {query ? `Search Results for "${query}"` : 'Discover Destinations'}
          </h1>
          
          <SearchBar
            onSearch={handleSearch}
            suggestions={searchSuggestions}
            showFilters={true}
            className="mb-6"
          />
        </div>

        {/* Results Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="mb-4 sm:mb-0">
            <p className="text-gray-600">
              {isLoading ? 'Searching...' : `${searchResults.length} destinations found`}
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                viewMode === 'grid' ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ViewColumnsIcon className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                viewMode === 'list' ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FunnelIcon className="h-4 w-4" />
            </button>
            
            <button
              onClick={() => setViewMode('map')}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                viewMode === 'map' ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <MapIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Results */}
        <div className="mb-8">
          {viewMode === 'grid' && renderGridView()}
          {viewMode === 'list' && renderListView()}
          {viewMode === 'map' && renderMapView()}
        </div>

        {/* Load More Button */}
        {searchResults.length > 0 && !isLoading && (
          <div className="text-center">
            <button className="bg-orange-500 text-white px-8 py-3 rounded-lg hover:bg-orange-600 transition-colors duration-200">
              Load More Destinations
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
