import { useState, useEffect } from 'react';
import { 
  MapPin, 
  Star, 
  ArrowRight,
  Clock,
  Search,
  Filter,
  Heart,
  Share,
  Map,
  Phone,
  Globe,
  IndianRupee,
  Sun,
  Accessibility,
  Users,
  Calendar,
  Car,
  Loader2
} from 'lucide-react';
import { supabase } from "../../lib/supabase";

interface Place {
  id: string;
  name: string;
  description: string | null;
  location: string;
  state: string | null;
  rating: number | null;
  category: string | null;
  images: string[] | null;
  features: string[] | null;
  opening_hours: any;
  entry_fee: number | null;
  duration: string | null;
  contact_info: any;
}

const TravelDestinationUI = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('Attractions');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [places, setPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const toggleFavorite = (id) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(id)) {
      newFavorites.delete(id);
    } else {
      newFavorites.add(id);
    }
    setFavorites(newFavorites);
  };

  // Fetch places from Supabase
  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const { data, error: fetchError } = await supabase
          .from('places')
          .select('*')
          .eq('state', 'Madhya Pradesh')
          .eq('city', 'Alirajpur')
          .order('rating', { ascending: false });

        if (fetchError) {
          throw fetchError;
        }

        setPlaces(data || []);
      } catch (err) {
        console.error('Error fetching places:', err);
        setError('Failed to load places. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlaces();
  }, []);

  // Get top attractions (first 3 places)
  const topAttractions = places.slice(0, 3);
  // Get popular attractions for grid view (first 4 places)
  const popularAttractions = places.slice(0, 4);

  // Nearby destinations
  const nearbyDestinations = [
    { 
      id: 1, 
      name: 'Pune', 
      distance: '149 km', 
      image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&h=400&fit=crop',
      time: '3 hours drive'
    },
    { 
      id: 2, 
      name: 'Lonavala', 
      distance: '83 km', 
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop',
      time: '2 hours drive'
    },
    { 
      id: 3, 
      name: 'Alibaug', 
      distance: '95 km', 
      image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&h=400&fit=crop',
      time: '2.5 hours drive'
    }
  ];

  // Best time to visit
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

  const quickStats = [
    { label: 'Attractions', value: '2', icon: MapPin },
    { label: 'Local Specialties', value: '2', icon: Users },
    { label: 'Annual Events', value: '1', icon: Calendar },
    { label: 'Transport Options', value: '2', icon: Car }
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="relative h-96 overflow-hidden">
        <img 
          src="https://i.ibb.co/twG7RTzm/Chat-GPT-Image-Sep-2-2025-12-16-17-AM.png" 
          alt="Alirajpur" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="absolute inset-0 flex flex-col justify-center items-start text-white p-8">
          <button className="flex items-center text-white mb-4 hover:text-orange-300 transition-colors">
            <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
            Back to destinations
          </button>
          <h1 className="text-6xl font-bold mb-2">Alirajpur</h1>
          <div className="flex items-center text-lg">
            <MapPin className="h-5 w-5 mr-2" />
            <span>Madhya Pradesh</span>
            <Star className="h-5 w-5 ml-4 mr-1 text-yellow-400 fill-current" />
            <span>4.5 (1,234 reviews)</span>
          </div>
          <button className="absolute top-8 right-8 bg-white bg-opacity-20 p-3 rounded-full hover:bg-opacity-30 transition-all">
            <Share className="h-6 w-6 text-white" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            <section className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-bold mb-4">About Alirajpur</h2>
              <p className="text-gray-600 mb-6">
                Alirajpur is a city and a municipality in Alirajpur District in the Indian state of Madhya Pradesh. It is the administrative headquarters of Alirajpur District.
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
                          ? 'border-orange-500 text-orange-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <span className="mr-2">{tab.icon}</span>
                      {tab.name}
                    </button>
                  ))}
                </nav>
              </div>
            </section>

            {/* Top Attractions */}
            <section className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-bold mb-6">Top Attractions</h2>
              
              <div className="space-y-6">
                {topAttractions.map((attraction) => (
                  <div key={attraction.id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                    <div className="md:flex">
                      <div className="md:flex-shrink-0 md:w-1/3">
                        <img 
                          src={attraction.image} 
                          alt={attraction.name} 
                          className="w-full h-64 md:h-full object-cover"
                        />
                      </div>
                      <div className="p-6 flex-1">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-xl font-bold text-gray-800">{attraction.name}</h3>
                            <span className="inline-block bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded-full mt-1">
                              {attraction.category}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center bg-yellow-50 text-yellow-700 px-2 py-1 rounded">
                              <Star className="h-4 w-4 mr-1 fill-current" />
                              <span className="font-medium">{attraction.rating}</span>
                            </div>
                            <button 
                              onClick={() => toggleFavorite(attraction.id)}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <Heart className={`h-5 w-5 ${favorites.has(attraction.id) ? 'fill-current text-red-500' : ''}`} />
                            </button>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 mb-4">{attraction.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="flex items-center text-sm">
                            <span className="text-gray-400 mr-2">💰</span>
                            <div>
                              <p className="text-gray-500">Entry Fee</p>
                              <p className="font-medium">{attraction.entryFee}</p>
                            </div>
                          </div>
                          <div className="flex items-center text-sm">
                            <Clock className="h-4 w-4 text-gray-400 mr-2" />
                            <div>
                              <p className="text-gray-500">Duration</p>
                              <p className="font-medium">{attraction.duration}</p>
                            </div>
                          </div>
                          <div className="flex items-center text-sm">
                            <span className="text-gray-400 mr-2">⏰</span>
                            <div>
                              <p className="text-gray-500">Timing</p>
                              <p className="font-medium">{attraction.time}</p>
                            </div>
                          </div>
                          <div className="flex items-center text-sm">
                            {attraction.accessibility && (
                              <>
                                <Accessibility className="h-4 w-4 text-green-500 mr-2" />
                                <div>
                                  <p className="text-gray-500">Access</p>
                                  <p className="font-medium text-green-600">Accessible</p>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-3">
                          <button className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-blue-700 transition-colors">
                            <Map className="h-4 w-4 mr-2" />
                            View on map
                          </button>
                          <button className="border border-blue-600 text-blue-600 px-4 py-2 rounded-md flex items-center hover:bg-blue-50 transition-colors">
                            <Phone className="h-4 w-4 mr-2" />
                            Call
                          </button>
                          <button className="border border-blue-600 text-blue-600 px-4 py-2 rounded-md flex items-center hover:bg-blue-50 transition-colors">
                            <Globe className="h-4 w-4 mr-2" />
                            Website
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Nearby Destinations */}
            <section className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-bold mb-6">Nearby Destinations</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {nearbyDestinations.map((destination) => (
                  <div key={destination.id} className="relative rounded-xl overflow-hidden h-48 group cursor-pointer">
                    <img 
                      src={destination.image} 
                      alt={destination.name}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4">
                      <h3 className="text-white text-xl font-bold">{destination.name}</h3>
                      <p className="text-gray-200">{destination.distance} from Alirajpur</p>
                      <p className="text-gray-300 text-sm">{destination.time}</p>
                    </div>
                  </div>
                ))}
              </div>
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
              <p className="text-gray-600 text-sm">Coordinates: 19.076, 72.8777</p>
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
                      <stat.icon className="h-5 w-5 text-gray-400" />
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

export default TravelDestinationUI;