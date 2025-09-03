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
  Clock
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
  // Optional fields that might be present in some records
  country?: string;
  rating?: string | number | null;
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

const JabalpurPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('Attractions');
  const [places, setPlaces] = useState<Place[]>([]);
  const [localSpecialties, setLocalSpecialties] = useState<LocalSpecialty[]>([]);
  const [transportOptions, setTransportOptions] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cityId, setCityId] = useState<string>('jabalpur-mp'); 

  // Helper function to get city ID
  const getCityId = async () => {
    try {
      const { data, error } = await supabase
        .from('cities')
        .select('id')
        .eq('name', 'Jabalpur')
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

  // Initialize city ID on component mount
  useEffect(() => {
    const initializeCityId = async () => {
      const id = await getCityId();
      setCityId(id);
    };
    initializeCityId();
  }, []);

  // Helper function to render a place card
  const renderPlaceCard = (item: Place | LocalSpecialty | TransportOption | Event, index: number) => {
    let imageUrl = 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop&crop=center';
    
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
    
    return (
      <div key={`${item.id}-${index}`} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
        <img 
          src={imageUrl}
          alt={item.name}
          className="w-full h-48 object-cover"
          onError={(e) => {
            // Fallback to placeholder if image fails to load
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop&crop=center';
          }}
        />
        <div className="p-4">
          <h3 className="text-lg font-semibold">{item.name}</h3>
          {item.description && (
            <p className="text-gray-600 text-sm mt-1 line-clamp-2">{item.description}</p>
          )}
          {'rating' in item && item.rating && (
            <div className="mt-3 flex items-center">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="ml-1 text-sm">{item.rating}</span>
            </div>
          )}
          {'category' in item && item.category && (
            <span className="inline-block bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full mt-2">
              {item.category}
            </span>
          )}
          {'price_range' in item && item.price_range && (
            <div className="mt-2">
              <span className="text-xs text-gray-500">Price: </span>
              <span className="text-xs font-medium text-green-600">{item.price_range}</span>
            </div>
          )}
          {'start_date' in item && item.start_date && (
            <div className="mt-2">
              <span className="text-xs text-gray-500">Date: </span>
              <span className="text-xs font-medium">{new Date(item.start_date).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Fetch data based on selected tab
  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      let response: any = { data: null };
      
      switch (selectedTab) {
        case 'Attractions':
          response = await supabase
            .from('places')
            .select('*')
            .eq('state', 'Madhya Pradesh')
            .eq('city', 'Jabalpur')
            .order('rating', { ascending: false });
          if (response.data) setPlaces(response.data);
          break;
          
        case 'Local Specialties':
          try {
            setIsLoading(true);
            setError(null);
            
            console.log('Fetching local specialties for Jabalpur...');
            
            // First try exact match with city and state
            const { data: specialties, error } = await supabase
              .from('local_specialties')
              .select('id, name, description, city, state, image_url, category, created_at, updated_at, city_id')
              .eq('city', 'Jabalpur')
              .eq('state', 'Madhya Pradesh')
              .order('name', { ascending: true });
            
            if (error) {
              console.error('Error fetching specialties:', error);
              setError('Failed to load local specialties.');
              return;
            }
            
            if (specialties && specialties.length > 0) {
              console.log(`Found ${specialties.length} local specialties`);
              setLocalSpecialties(specialties);
            } else {
              console.log('No local specialties found with exact match, trying case-insensitive search...');
              
              // Fallback to case-insensitive search
              const { data: caseInsensitiveResults } = await supabase
                .from('local_specialties')
                .select('id, name, description, city, state, image_url, category, created_at, updated_at, city_id')
                .or('city.ilike.%jabalpur%,state.ilike.%madhya pradesh%')
                .order('name', { ascending: true });
                
              if (caseInsensitiveResults && caseInsensitiveResults.length > 0) {
                console.log(`Found ${caseInsensitiveResults.length} local specialties with case-insensitive search`);
                setLocalSpecialties(caseInsensitiveResults);
              } else {
                console.log('No local specialties found');
                setError('No local specialties found for this location.');
              }
            }
          } catch (err) {
            console.error('Error in Local Specialties fetch:', err);
            setError('An error occurred while loading local specialties.');
            setLocalSpecialties([]);
          } finally {
            setIsLoading(false);
          }
          break;
          
        case 'Transport':
          if (!cityId) {
            // Try different approaches similar to local specialties
            response = await supabase
              .from('transport_options')
              .select('*')
              .eq('city', 'Jabalpur')
              .eq('state', 'Madhya Pradesh')
              .order('name', { ascending: true });
              
            if ((!response.data || response.data.length === 0) && cityId) {
              response = await supabase
                .from('transport_options')
                .select('*')
                .eq('city_id', cityId)
                .order('name', { ascending: true });
            }
            
            if (!response.data || response.data.length === 0) {
              response = await supabase
                .from('transport_options')
                .select('*')
                .order('name', { ascending: true });
                
              if (response.data) {
                response.data = response.data.filter((item: TransportOption) => 
                  item.city?.toLowerCase().includes('jabalpur') ||
                  item.name?.toLowerCase().includes('jabalpur') ||
                  item.description?.toLowerCase().includes('jabalpur')
                );
              }
            }
          } else {
            response = await supabase
              .from('transport_options')
              .select('*')
              .eq('city_id', cityId)
              .order('name', { ascending: true });
          }
          if (response.data) setTransportOptions(response.data);
          break;
          
        case 'Events':
          const today = new Date().toISOString();
          
          if (!cityId) {
            // Try different approaches for events
            response = await supabase
              .from('events')
              .select('*')
              .eq('city', 'Jabalpur')
              .eq('state', 'Madhya Pradesh')
              .gte('end_date', today)
              .order('start_date', { ascending: true });
              
            if ((!response.data || response.data.length === 0) && cityId) {
              response = await supabase
                .from('events')
                .select('*')
                .eq('city_id', cityId)
                .gte('end_date', today)
                .order('start_date', { ascending: true });
            }
            
            if (!response.data || response.data.length === 0) {
              response = await supabase
                .from('events')
                .select('*')
                .gte('end_date', today)
                .order('start_date', { ascending: true });
                
              if (response.data) {
                response.data = response.data.filter((item: Event) => 
                  item.city?.toLowerCase().includes('jabalpur') ||
                  item.location?.toLowerCase().includes('jabalpur') ||
                  item.name?.toLowerCase().includes('jabalpur')
                );
              }
            }
          } else {
            response = await supabase
              .from('events')
              .select('*')
              .eq('city_id', cityId)
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
          <p className="text-gray-500">No {selectedTab.toLowerCase()} found for Jabalpur.</p>
          <p className="text-sm text-gray-400 mt-2">Data might be available under a different city name or not yet added to the database.</p>
        </div>
      );
    }

    switch (selectedTab) {
      case 'Attractions':
        return (
          <div className="space-y-8">
            {currentData.length > 3 && (
              <section>
                <h2 className="text-2xl font-bold mb-4">Top Attractions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {currentData.slice(0, 3).map((item, index) => renderPlaceCard(item, index))}
                </div>
              </section>
            )}
            <section>
              <h2 className="text-2xl font-bold mb-4">
                {currentData.length > 3 ? 'All Attractions' : 'Attractions'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentData.map((item, index) => renderPlaceCard(item, index))}
              </div>
            </section>
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
      description: 'Pleasant weather, ideal for sightseeing',
      icon: '🌤️',
      temp: '20-30°C'
    },
    { 
      month: 'Mar - May', 
      description: 'Hot weather, early mornings and evenings are better',
      icon: '☀️',
      temp: '25-35°C'
    },
    { 
      month: 'Jun - Sep', 
      description: 'Monsoon season, lush green surroundings',
      icon: '🌧️',
      temp: '24-32°C'
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
          src="https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1920&h=1080&fit=crop"
          alt="Jabalpur"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-5xl font-bold mb-4">Jabalpur</h1>
            <p className="text-xl">The Marble City of India</p>
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
              <h2 className="text-2xl font-bold mb-4">About Jabalpur</h2>
              <p className="text-gray-600 mb-6">
                Jabalpur, known as the "Marble City," is a major city in Madhya Pradesh famous for its stunning marble rocks at Bhedaghat, the thundering Dhuandhar Falls, and rich cultural heritage. The city serves as a gateway to several national parks and wildlife sanctuaries.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="flex items-center space-x-3">
                  <div className="bg-orange-100 p-3 rounded-lg">
                    <Calendar className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Best Time to Visit</h3>
                    <p className="text-gray-600">October to February</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Sun className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Climate</h3>
                    <p className="text-gray-600">Tropical</p>
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
              <div className="bg-gray-200 rounded-lg h-48 flex items-center justify-center mb-4">
                <div className="text-center text-gray-500">
                  <MapPin className="h-12 w-12 mx-auto mb-2" />
                  <p>Interactive map will be displayed here</p>
                  <p className="text-sm">Google Maps integration</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm">Coordinates: 23.1815° N, 79.9864° E</p>
            </div>

            {/* Current Weather */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-bold mb-4">Current Weather</h3>
              <div className="text-center">
                <div className="text-6xl mb-2">☀️</div>
                <div className="text-3xl font-bold text-gray-800">28°C</div>
                <p className="text-gray-600">Sunny</p>
                <p className="text-sm text-gray-500 mt-2">Perfect weather for sightseeing!</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-bold mb-4">Quick Stats</h3>
              <div className="space-y-4">
                {quickStats.map((stat, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {stat.icon}
                      <span className="text-gray-700">{stat.label}</span>
                    </div>
                    <span className="font-bold text-blue-600">{stat.value}</span>
                  </div>
                ))}
              </div>
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

export default JabalpurPage;