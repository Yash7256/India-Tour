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

interface LocalSpecialty extends BaseItem {
  price_range?: string;
  category?: string;
}

interface TransportOption extends BaseItem {
  type?: string;
  operating_hours?: string;
  price_range?: string;
}

interface Event extends BaseItem {
  start_date: string;
  end_date: string;
  location: string;
  ticket_price?: string;
  category?: string;
}

const JabalpurPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<string>('Attractions');
  
  // State for different data types
  const [places, setPlaces] = useState<Place[]>([]);
  const [localSpecialties, setLocalSpecialties] = useState<LocalSpecialty[]>([]);
  const [transportOptions, setTransportOptions] = useState<TransportOption[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to render a place card
  const renderPlaceCard = (item: Place | LocalSpecialty | TransportOption | Event, index: number) => {
    const imageUrl = (item as any).image || (item as any).main_image_url || '/placeholder-image.jpg';
    const rating = typeof item.rating === 'number' ? item.rating.toFixed(1) : item.rating;

    return (
      <div key={`${item.id}-${index}`} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
        <img 
          src={imageUrl} 
          alt={item.name}
          className="w-full h-48 object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder-image.jpg';
          }}
        />
        <div className="p-4">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-lg">{item.name}</h3>
            {item.rating !== undefined && (
              <div className="flex items-center bg-yellow-100 text-yellow-800 text-sm font-medium px-2.5 py-0.5 rounded">
                <Star className="w-4 h-4 mr-1" />
                {rating}
              </div>
            )}
          </div>
          
          {item.description && (
            <p className="mt-2 text-gray-600 text-sm line-clamp-2">
              {item.description}
            </p>
          )}

          {('location' in item) && (
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <MapPin className="w-4 h-4 mr-1" />
              {(item as Event).location}
            </div>
          )}

          {('start_date' in item) && (
            <div className="mt-2 text-sm text-gray-500">
              {new Date((item as Event).start_date).toLocaleDateString()} - {new Date((item as Event).end_date).toLocaleDateString()}
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
      
      const commonFilters = {
        state: 'Madhya Pradesh',
        city: 'Jabalpur'
      };

      let response;
      
      switch (selectedTab) {
        case 'Attractions':
          response = await supabase
            .from('places')
            .select('*')
            .eq('state', commonFilters.state)
            .eq('city', commonFilters.city)
            .order('rating', { ascending: false });
          if (response.data) setPlaces(response.data);
          break;
          
        case 'Local Specialties':
          response = await supabase
            .from('local_specialities')
            .select('*')
            .eq('city_id', 'jabalpur-city-id') // You'll need to replace with actual city_id
            .order('name', { ascending: true });
          if (response.data) setLocalSpecialties(response.data);
          break;
          
        case 'Transport':
          response = await supabase
            .from('transport_options')
            .select('*')
            .eq('city_id', 'jabalpur-city-id') // You'll need to replace with actual city_id
            .order('name', { ascending: true });
          if (response.data) setTransportOptions(response.data);
          break;
          
        case 'Events':
          const today = new Date().toISOString();
          response = await supabase
            .from('events')
            .select('*')
            .eq('city_id', 'jabalpur-city-id') // You'll need to replace with actual city_id
            .gte('end_date', today)
            .order('start_date', { ascending: true });
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

  // Fetch data when tab changes
  useEffect(() => {
    fetchData();
  }, [selectedTab]);

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
            </div>
          </div>
        </div>
      );
    }

    if (currentData.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500">No {selectedTab.toLowerCase()} found for Jabalpur.</p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentData.map((item, index) => renderPlaceCard(item, index))}
            </div>
          </div>
        );
    }
  };

  const quickStats = [
    { icon: <MapPin className="h-5 w-5" />, label: 'Best Time', value: 'Oct-Mar' },
    { icon: <Sun className="h-5 w-5" />, label: 'Climate', value: 'Tropical' },
    { icon: <Users className="h-5 w-5" />, label: 'Population', value: '1.5M' },
  ] as const;

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