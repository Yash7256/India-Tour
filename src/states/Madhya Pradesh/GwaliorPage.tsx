/**
 * SQL Debugging Queries for Local Specialties
 * 
 * 1. Check table structure:
 *    SELECT column_name, data_type, is_nullable
 *    FROM information_schema.columns 
 *    WHERE table_name = 'local_specialties'
 *    ORDER BY ordinal_position;
 *
 * 2. Check RLS policies:
 *    SELECT * FROM pg_policies WHERE tablename = 'local_specialties';
 *
 * 3. Check sample data:
 *    SELECT id, name, city, state, city_id, rating, COUNT(*) OVER() as total_count
 *    FROM local_specialties 
 *    WHERE city ILIKE '%jabalpur%' OR state ILIKE '%madhya%pradesh%'
 *    ORDER BY name
 *    LIMIT 10;
 *
 * 4. Check city reference:
 *    SELECT id, name, state, country 
 *    FROM cities 
 *    WHERE name ILIKE '%jabalpur%' 
 *    AND state ILIKE '%madhya%pradesh%';
 *
 * 5. Check for missing city_id references:
 *    SELECT DISTINCT city, state, city_id
 *    FROM local_specialties
 *    WHERE (city_id IS NULL OR city_id = '') 
 *    AND (city ILIKE '%jabalpur%' OR state ILIKE '%madhya%pradesh%');
 */

import { useState, useEffect } from 'react';
import { 
  Star,
  Loader2,
  MapPin,
  Users,
  Sun,
  Calendar,
  Droplets,
  Wind,
  Eye,
  Thermometer,
  Search,
  X,
  Clock,
  Heart,
  Share2,
  Navigation
} from 'lucide-react';
import { supabase } from "../../lib/supabase";

// Base interface for common fields
interface BaseItem {
  id: string;
  name: string;
  description?: string;
  city: string;
  state: string;
  rating: string | number;
  created_at: string;
  updated_at: string;
  main_image_url?: string;
  image?: string;
  features?: string[];
  duration?: string;
}

interface Place extends BaseItem {
  country: string;
  latitude: string;
  longitude: string;
  best_time_to_visit?: string;
  category?: string;
  entryFee?: string;
  time?: string;
  accessibility?: boolean;
  featured?: boolean;
  distance?: number;
}

interface WeatherData {
  temperature: number;
  description: string;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  visibility: string;
  icon: string;
  lastUpdated: string;
}

interface LocalSpecialty {
  id: string;
  name: string;
  description: string | null;
  city: string;
  state: string;
  image_url: string | null;
  category: string | null;
  created_at: string;
  updated_at: string;
  city_id: string | null;
  country?: string;
  rating?: string | number | null;
  lastUpdated?: string; // Made optional with ?
}

interface TransportOption extends BaseItem {
  type?: string;
  operating_hours?: string;
  price_range?: string;
  city_id?: string;
}

interface Event extends BaseItem {
  start_date: string;
  end_date: string;
  location?: string;
  venue?: string;
  ticket_price?: string;
  category?: string;
  city_id?: string;
  img_url?: string;
}

// Define filter and sort types
type Category = 'All' | 'Historical' | 'Natural' | 'Religious' | 'Adventure' | 'Cultural';
type SortOption = 'featured' | 'name-asc' | 'name-desc' | 'rating-desc' | 'rating-asc';

const GwaliorPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('Attractions');
  const [places, setPlaces] = useState<Place[]>([]);
  const [localSpecialties, setLocalSpecialties] = useState<LocalSpecialty[]>([]);
  const [transportOptions, setTransportOptions] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cityId, setCityId] = useState<string>('gwalior-mp');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState<boolean>(false);
  const [selectedCategories, setSelectedCategories] = useState<Category[]>(['All']);
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Helper function to get city ID
  const getCityId = async () => {
    try {
      const { data, error } = await supabase
        .from('cities')
        .select('id')
        .ilike('name', 'Gwalior')
        .eq('state', 'Madhya Pradesh')
        .single();

      if (error) {
        console.error('Error fetching city ID:', error);
        return null;
      }

      return data?.id || null;
    } catch (err) {
      console.error('Error in getCityId:', err);
      return null;
    }
  };

  // Fetch weather data from OpenWeather API
  const fetchWeather = async (forceRefresh = false) => {
    try {
      setWeatherLoading(true);
      setError(null); // Clear any previous errors
      
      // If we have weather data and not forcing a refresh, keep the current data
      if (weather && !forceRefresh) {
        return;
      }
      
      // Coordinates for Gwalior
      const lat = 26.2183;
      const lon = 78.1828;
      const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
      
      if (!apiKey) {
        throw new Error('OpenWeather API key is missing');
      }
      
      // Add cache-busting parameter to prevent caching
      const timestamp = new Date().getTime();
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&_=${timestamp}`
      );
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data?.weather?.[0] || !data?.main) {
        throw new Error('Invalid weather data received');
      }
      
      // Map OpenWeather API response to our weather state
      const newWeather: WeatherData = {
        temperature: Math.round(data.main.temp),
        description: data.weather[0].description || 'Unknown',
        feelsLike: Math.round(data.main.feels_like),
        humidity: data.main.humidity,
        windSpeed: Math.round((data.wind?.speed || 0) * 3.6), // Convert m/s to km/h
        visibility: data.visibility ? (data.visibility / 1000).toFixed(1) : 'N/A',
        icon: getWeatherIcon(data.weather[0].icon || '02d'),
        lastUpdated: new Date().toISOString()
      };
      
      setWeather(newWeather);
      
    } catch (error) {
      console.error('Error fetching weather:', error);
      // Only show error if we don't have any weather data
      if (!weather) {
        setError('Failed to load weather data. Please try again.');
      } else {
        // If we have previous weather data, keep showing it but indicate the refresh failed
        setError('Failed to update weather. Showing last available data.');
      }
    } finally {
      setWeatherLoading(false);
    }
  };
  
  // Helper function to map OpenWeather icons to emojis
  const getWeatherIcon = (iconCode: string) => {
    const iconMap: Record<string, string> = {
      '01d': '☀️', // clear sky (day)
      '01n': '🌙', // clear sky (night)
      '02d': '⛅', // few clouds (day)
      '02n': '☁️', // few clouds (night)
      '03d': '☁️', // scattered clouds
      '03n': '☁️',
      '04d': '☁️', // broken clouds
      '04n': '☁️',
      '09d': '🌧️', // shower rain
      '09n': '🌧️',
      '10d': '🌦️', // rain (day)
      '10n': '🌧️', // rain (night)
      '11d': '⛈️', // thunderstorm
      '11n': '⛈️',
      '13d': '❄️', // snow
      '13n': '❄️',
      '50d': '🌫️', // mist
      '50n': '🌫️',
    };
    
    return iconMap[iconCode] || '🌡️';
  };

  // Initialize city ID and fetch weather on component mount
  useEffect(() => {
    const initializeCityId = async () => {
      const id = await getCityId();
      setCityId(id);
    };
    initializeCityId();
    fetchWeather();
  }, []);

  // Helper function to toggle favorite
  const toggleFavorite = (id: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(id)) {
      newFavorites.delete(id);
    } else {
      newFavorites.add(id);
    }
    setFavorites(newFavorites);
    // Save to localStorage for persistence
    localStorage.setItem('favorites', JSON.stringify(Array.from(newFavorites)));
  };

  // Helper function to render a place card
  const renderPlaceCard = (item: Place | LocalSpecialty | TransportOption | Event, index: number) => {
    let imageUrl = 'https://i.ibb.co/39z5Qz0r/Madhya-Pradesh-tour.jpg';
    
    // Check for image sources in order of preference
    if ('img_url' in item && item.img_url) {
      imageUrl = item.img_url;
    } else if ('image_url' in item && typeof (item as any).image_url === 'string') {
      imageUrl = (item as any).image_url;
    } else if ('main_image_url' in item && item.main_image_url) {
      imageUrl = item.main_image_url;
    } else if ('image' in item && item.image) {
      imageUrl = item.image;
    }
    const isFavorite = favorites.has(item.id);
    
    // Get category or use a default
    const category = ('category' in item && item.category) || 'Attraction';
    const rating = 'rating' in item ? Number(item.rating) : null;
    
    return (
      <div key={`${item.id}-${index}`} className="group bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 relative">
        {/* Featured Ribbon */}
        {index < 3 && selectedTab === 'Attractions' && (
          <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded z-10">
            Featured
          </div>
        )}
        
        {/* Favorite Button */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(item.id);
          }}
          className="absolute top-2 right-2 p-2 bg-white/80 rounded-full z-10 hover:bg-white transition-colors"
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Star 
            className={`h-5 w-5 ${isFavorite ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
          />
        </button>
        
        {/* Image */}
        <div className="relative overflow-hidden h-48">
          <img 
            src={imageUrl}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop&crop=center';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
            <button className="text-white text-sm font-medium bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-full transition-colors">
              View Details
            </button>
          </div>
        </div>
        
        {/* Card Content */}
        <div className="p-4">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{item.name}</h3>
            {rating !== null && (
              <div className="flex items-center bg-blue-50 text-blue-700 text-xs font-medium px-2 py-1 rounded-full">
                <Star className="h-3 w-3 fill-current mr-1" />
                {rating.toFixed(1)}
              </div>
            )}
          </div>
          
          {/* Category Tags */}
          <div className="mt-2 flex flex-wrap gap-1">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {category}
            </span>
            {'entryFee' in item && item.entryFee && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {item.entryFee === '0' || item.entryFee?.toLowerCase() === 'free' ? 'Free Entry' : `Entry: ${item.entryFee}`}
              </span>
            )}
          </div>
          
          {/* Description */}
          {item.description && (
            <p className="mt-2 text-sm text-gray-600 line-clamp-2">{item.description}</p>
          )}
          
          {/* Additional Info */}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs text-gray-500">
              {'time' in item && item.time && (
                <span className="flex items-center">
                  <Clock className="h-3.5 w-3.5 mr-1" />
                  {item.time}
                </span>
              )}
              {'distance' in item && item.distance && (
                <span className="flex items-center">
                  <MapPin className="h-3.5 w-3.5 mr-1" />
                  {item.distance} km away
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Fetch data based on selected tab
  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      let response: any = { data: null, error: null };
      
      switch (selectedTab) {
        case 'Attractions':
          response = await supabase
            .from('places')
            .select('*')
            .eq('state', 'Madhya Pradesh')
            .ilike('city', 'Gwalior')
            .order('rating', { ascending: false });
          if (response.data) setPlaces(response.data);
          break;
          
        case 'Local Specialties':
          response = await supabase
            .from('local_specialties')
            .select('id, name, description, city, state, image_url, category, created_at, updated_at, city_id')
            .ilike('city', 'Gwalior')
            .eq('state', 'Madhya Pradesh')
            .order('name', { ascending: true });
          
          if (response.data) {
            setLocalSpecialties(response.data);
          }
          break;
          
        case 'Transport':
          if (cityId) {
            response = await supabase
              .from('transport_options')
              .select('*')
              .eq('city_id', cityId)
              .order('name', { ascending: true });
          }
          // Fallback if no data with cityId or no cityId
          if (!cityId || !response.data || response.data.length === 0) {
            response = await supabase
              .from('transport_options')
              .select('*')
              .ilike('city', 'Gwalior')
              .eq('state', 'Madhya Pradesh')
              .order('name', { ascending: true });
          }
          if (response.data) setTransportOptions(response.data);
          break;
          
        case 'Events':
          const today = new Date().toISOString();
          if (cityId) {
            response = await supabase
              .from('events')
              .select('*')
              .eq('city_id', cityId)
              .gte('end_date', today)
              .order('start_date', { ascending: true });
          }
          // Fallback if no data with cityId or no cityId
          if (!cityId || !response.data || response.data.length === 0) {
            response = await supabase
              .from('events')
              .select('*')
              .ilike('city', 'Gwalior')
              .eq('state', 'Madhya Pradesh')
              .gte('end_date', today)
              .order('start_date', { ascending: true });
          }
          if (response.data) setEvents(response.data);
          break;
      }

      if (response?.error) {
        throw response.error;
      }

    } catch (err) {
      console.error(`Error fetching ${selectedTab}:`, err);
      setError(`Failed to load ${selectedTab}. Please try again later.`);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data when tab changes or cityId is available
  useEffect(() => {
    if (selectedTab === 'Attractions' || cityId !== null) {
      fetchData();
    }
  }, [selectedTab, cityId]);

  // Load favorites from localStorage on component mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      setFavorites(new Set(JSON.parse(savedFavorites)));
    }
  }, []);

  // Get current data based on selected tab
  const getCurrentData = () => {
    switch (selectedTab) {
      case 'Attractions':
        return places;
      case 'Local Specialties':
        return localSpecialties;
      case 'Transport':
        return transportOptions;
      case 'Events':
        return events;
      default:
        return [];
    }
  };

  const currentData = getCurrentData();

  // Filter and sort attractions
  const getFilteredAndSortedAttractions = () => {
    let filtered = [...places];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(place => 
        place.name.toLowerCase().includes(query) ||
        (place.description?.toLowerCase().includes(query) ?? false) ||
        (place.category?.toLowerCase().includes(query) ?? false)
      );
    }
    
    // Apply category filter
    if (!selectedCategories.includes('All')) {
      filtered = filtered.filter(place => 
        selectedCategories.some(cat => 
          place.category?.toLowerCase() === cat.toLowerCase()
        )
      );
    }
    
    // Apply sorting
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'rating-desc':
          return (Number(b.rating) || 0) - (Number(a.rating) || 0);
        case 'rating-asc':
          return (Number(a.rating) || 0) - (Number(b.rating) || 0);
        case 'featured':
        default:
          // Featured items first, then by rating
          const aFeatured = a.featured ? 1 : 0;
          const bFeatured = b.featured ? 1 : 0;
          if (aFeatured !== bFeatured) return bFeatured - aFeatured;
          return (Number(b.rating) || 0) - (Number(a.rating) || 0);
      }
    });
  };

  // Get unique categories from places
  const getAvailableCategories = () => {
    const categories = new Set<string>();
    places.forEach(place => {
      if (place.category) {
        categories.add(place.category);
      }
    });
    return Array.from(categories).sort();
  };

  // Toggle category selection
  const toggleCategory = (category: Category) => {
    if (category === 'All') {
      setSelectedCategories(['All']);
    } else {
      setSelectedCategories(prev => {
        const newSelection = prev.includes('All') 
          ? [category]
          : prev.includes(category)
            ? prev.filter(c => c !== category)
            : [...prev, category];
        return newSelection.length === 0 ? ['All'] : newSelection;
      });
    }
  };

  // Render content based on selected tab
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-2">Loading {selectedTab.toLowerCase()}...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
              <button 
                onClick={fetchData}
                className="mt-2 text-sm bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (currentData.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500">No {selectedTab.toLowerCase()} found for Gwalior.</p>
          <p className="text-sm text-gray-400 mt-2">Data might be available under a different city name or not yet added to the database.</p>
        </div>
      );
    }

    switch (selectedTab) {
      case 'Attractions':
        const filteredAttractions = getFilteredAndSortedAttractions();
        const availableCategories = getAvailableCategories();
        
        return (
          <div className="space-y-6">
            {/* Search and Filter Bar */}
            <div className="bg-white rounded-xl shadow-sm p-4 sticky top-4 z-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Search Input */}
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Search attractions by name, type, or keyword..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    </button>
                  )}
                </div>
                
                {/* Sort Dropdown */}
                <div className="w-full md:w-auto">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="w-full md:w-auto block px-4 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="featured">Featured First</option>
                    <option value="name-asc">Name (A-Z)</option>
                    <option value="name-desc">Name (Z-A)</option>
                    <option value="rating-desc">Highest Rated</option>
                    <option value="rating-asc">Lowest Rated</option>
                  </select>
                </div>
              </div>
              
              {/* Category Filters */}
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  key="all"
                  onClick={() => toggleCategory('All')}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    selectedCategories.includes('All')
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                {availableCategories.map(category => (
                  <button
                    key={category}
                    onClick={() => toggleCategory(category as Category)}
                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                      selectedCategories.includes(category as Category) || selectedCategories.includes('All')
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Attractions Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredAttractions.map((item, index) => renderPlaceCard(item, index))}
            </div>
          </div>
        );
      default:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">{selectedTab}</h2>
            <div className={`gap-6 ${selectedTab === 'Events' ? 'space-y-4' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
              {currentData.map((item, index) => renderPlaceCard(item, index))}
            </div>
          </div>
        );
    }
  };

  // Mock data for UI elements
  const quickStats = [
    { icon: <MapPin className="h-5 w-5" />, label: 'Best Time', value: 'Oct-Mar' },
    { icon: <Sun className="h-5 w-5" />, label: 'Climate', value: 'Tropical' },
    { icon: <Users className="h-5 w-5" />, label: 'Population', value: '1.5M' },
  ];

  const bestTimeToVisit = [
    { 
      month: 'Oct - Feb', 
      description: 'Best for sightseeing, wildlife safaris, boating at Bhedaghat, and outdoor activities',
      icon: '🌤️',
      temp: '20-30°C'
    },
    { 
      month: 'April - June', 
      description: 'Hot weather, Not recommended',
      icon: '☀️',
      temp: '35°C +'
    },
    { 
      month: 'July - Sep', 
      description: 'Monsoon season, lush green surroundings',
      icon: '🌧️',
      temp: '21-32°C'
    }
  ];

  const tabs = [
    { name: 'Attractions', icon: '🏛️' },
    { name: 'Local Specialties', icon: '🍽️' },
    { name: 'Events', icon: '🎉' },
    { name: 'Transport', icon: '🚗' }
  ];

  const popularAttractions = [
    { 
      id: '1', 
      name: 'Dhuandhar Falls', 
      rating: '4.5',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop'
    },
    { 
      id: '2', 
      name: 'Marble Rocks', 
      rating: '4.7',
      image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop'
    },
    { 
      id: '3', 
      name: 'Madan Mahal Fort', 
      rating: '4.2',
      image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=400&h=300&fit=crop'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
     {/* Hero Section */}
     <div className="relative h-96 overflow-hidden">
        <img
          src="https://i.ibb.co/39z5Qz0r/Madhya-Pradesh-tour.jpg"
          alt="GWALIOR"
          className="w-full h-full object-cover blur-sm"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/70"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white max-w-4xl px-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <h1 className="text-6xl md:text-7xl font-bold mb-4 tracking-wide drop-shadow-2xl">
                GWALIOR
              </h1>
              <div className="w-24 h-1 bg-orange-400 mx-auto mb-4 rounded-full"></div>
              <p className="text-xl md:text-2xl font-light tracking-wider opacity-90">
                Cultural Clown Of India
              </p>
              <p className="text-sm md:text-base mt-2 opacity-75 font-medium">
                Heritage City of Madhya Pradesh
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            <section className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-bold mb-4">About GWALIOR</h2>
              <p className="text-gray-600 mb-6">
              Gwalior, the historical city of Madhya Pradesh, renowned for its majestic forts, classical music heritage, and rich cultural legacy
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="flex items-center space-x-3">
                  <div className="bg-orange-100 p-3 rounded-lg">
                    <Calendar className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Best Time to Visit</h3>
                    <p className="text-gray-600">October to March</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Sun className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Climate</h3>
                    <p className="text-gray-600">Sub-Tropical</p>
                  </div>
                </div>
              </div>


              {/* Tabs */}
              <div className="border-b border-gray-200 mb-6">
                <nav className="flex space-x-8">
                  {tabs.map((tab) => (
                    <button
                      key={tab.name}
                      onClick={() => setSelectedTab(tab.name)}
                      className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                        selectedTab === tab.name
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <span className="mr-2">{tab.icon}</span>
                      {tab.name}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              {renderContent()}
            </section>

            {/* Best Time to Visit */}
            <section className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-bold mb-6">Best Time to Visit</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {bestTimeToVisit.map((time, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="text-3xl mb-3">{time.icon}</div>
                    <h3 className="font-semibold text-lg mb-2">{time.month}</h3>
                    <p className="text-gray-600 text-sm mb-2">{time.description}</p>
                    <p className="text-blue-600 font-medium text-sm">{time.temp}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Location Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-bold mb-4">Location</h3>
              <div className="bg-gray-100 rounded-lg h-48 relative overflow-hidden mb-4">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d59058.759873408246!2d75.8154384!3d22.7195687!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3962fd1d1b7d47cf%3A0x3b9e5d4a1fbb5b2c!2sIndore%2C%20Madhya%20Pradesh!5e0!3m2!1sen!2sin!4v1634567890123!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Gwalior Map"
                  className="rounded-lg"
                ></iframe>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Coordinates:</strong> 23.1815° N, 79.9864° E</p>
                <p><strong>State:</strong> Madhya Pradesh, India</p>
                <p><strong>Elevation:</strong> 411 meters (1,348 ft)</p>
              </div>
            </div>

            {/* Current Weather */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Current Weather</h3>
                <button
                  onClick={() => fetchWeather(true)}
                  disabled={weatherLoading}
                  className={`p-2 rounded-full ${weatherLoading ? 'text-gray-400' : 'text-gray-600 hover:bg-gray-100'}`}
                  aria-label="Refresh weather data"
                >
                  {weatherLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  )}
                </button>
              </div>

              {weather ? (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <div className="text-5xl font-bold text-gray-800">
                        {weather.temperature}°
                        {weatherLoading && (
                          <span className="ml-2 inline-block">
                            <Loader2 className="h-5 w-5 animate-spin text-blue-500 inline" />
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 capitalize">{weather.description}</p>
                      <p className="text-sm text-gray-500">Feels like {weather.feelsLike}°</p>
                    </div>
                    <div className="text-6xl">{weather.icon}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Droplets className="h-5 w-5 text-blue-500" />
                        <span>Humidity</span>
                      </div>
                      <p className="text-lg font-semibold mt-1">{weather.humidity}%</p>
                    </div>
                    
                    <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Wind className="h-5 w-5 text-green-500" />
                        <span>Wind</span>
                      </div>
                      <p className="text-lg font-semibold mt-1">{weather.windSpeed} km/h</p>
                    </div>
                    
                    <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Eye className="h-5 w-5 text-purple-500" />
                        <span>Visibility</span>
                      </div>
                      <p className="text-lg font-semibold mt-1">{weather.visibility} km</p>
                    </div>
                    
                    <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Thermometer className="h-5 w-5 text-orange-500" />
                        <span>Feels Like</span>
                      </div>
                      <p className="text-lg font-semibold mt-1">{weather.feelsLike}°</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 text-center">
                    <p className="text-xs text-gray-500">
                      {weather.lastUpdated ? (
                        `Last updated: ${new Date(weather.lastUpdated).toLocaleTimeString()}`
                      ) : (
                        'Loading weather data...'
                      )}
                    </p>
                    {error && (
                      <p className="text-xs text-red-500 mt-1">{error}</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 bg-white/50 rounded-xl">
                  <div className="text-4xl mb-2">🌤️</div>
                  <p className="text-gray-600 mb-3">Weather data unavailable</p>
                  <button 
                    onClick={() => fetchWeather(true)}
                    className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center mx-auto"
                  >
                    <svg 
                      className="h-4 w-4 mr-2" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                      />
                    </svg>
                    Refresh
                  </button>
                </div>
              )}
            </div>

            {/* Popular This Week */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-bold mb-4">Popular This Week</h3>
              <div className="space-y-4">
                {popularAttractions.slice(0, 3).map((attraction) => (
                  <div key={attraction.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                    <img 
                      src={attraction.image} 
                      alt={attraction.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">{attraction.name}</h4>
                      <div className="flex items-center text-sm text-gray-500">
                        <Star className="h-3 w-3 mr-1 text-yellow-400 fill-current" />
                        <span>{attraction.rating}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GwaliorPage;
