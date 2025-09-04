import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  MapPinIcon, 
  StarIcon, 
  CalendarIcon, 
  HeartIcon,
  ShareIcon,
  ArrowLeftIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

// Define the attraction type based on the data structure
interface Attraction {
  id: string;
  name: string;
  category: string;
  images: string[];
  rating: number;
  description: string;
  entryFee: string;
  openingHours: string;
  accessibility?: string;
}

// Type for the city data structure
interface CityData {
  id: string;
  name: string;
  state: string;
  description: string;
  bestTimeToVisit: string;
  climate: string;
  featuredImage: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  attractions: Attraction[];
  localSpecialties?: any[];
  specialties?: any[];
  events?: any[];
  transport?: any[];
  transportation?: any[];
  // Add other properties that might be used in the component
  [key: string]: any; // For any additional dynamic properties
}

const CityPage: React.FC = () => {
  const { cityId } = useParams<{ cityId: string }>();
  const { getCityById } = useData();
  const { user, addToFavorites, removeFromFavorites, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'attractions' | 'specialties' | 'events' | 'transport'>('attractions');

  const city = (cityId ? getCityById(cityId) : null) as CityData | null;
  const isFavorite = user?.favoriteDestinations.includes(cityId || '') || false;


  useEffect(() => {
    window.scrollTo(0, 0);
  }, [cityId]);

  if (!city) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-6">
          <h1 className="text-2xl font-bold text-gray-900">City not found</h1>
          <p className="mt-2 text-gray-600">The requested city could not be loaded.</p>
          <Link to="/" className="mt-4 inline-block text-orange-700 hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const handleFavoriteToggle = () => {
    if (!user || loading || !city) return;
    
    if (isFavorite) {
      removeFromFavorites(city.id);
    } else {
      addToFavorites(city.id);
    }
  };

  // Define types for city data
  interface LocalSpecialty {
    id: string;
    name: string;
    image: string;
    type: string;
    description: string;
  }

  interface Transport {
    id: string;
    type: string;
    name: string;
    description: string;
    routes?: string[];
    approximateCost?: string;
    bookingInfo?: string;
  }

  interface CityEvent {
    id: string;
    name: string;
    image: string;
    dateRange: string;
    description: string;
    specialAttractions: string[];
  }

  // Safely access optional arrays with proper typing and fallback to empty array
  const localSpecialties = useMemo<LocalSpecialty[]>(
    () => city?.localSpecialties || [],
    [city?.localSpecialties]
  );
  
  const transportation = useMemo<Transport[]>(
    () => city?.transportation || city?.transport || [],
    [city?.transportation, city?.transport]
  );
  
  const events = useMemo<CityEvent[]>(
    () => city?.events || [],
    [city?.events]
  );

  // Handle tab changes
  const handleTabChange = (tab: 'attractions' | 'specialties' | 'events' | 'transport') => {
    setActiveTab(tab);
  };

  const viewOnMap = () => {
    if (city?.coordinates) {
      const { lat, lng } = city.coordinates;
      window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-96 overflow-hidden">
        <img
          src={city.featuredImage || 'https://via.placeholder.com/1200x500?text=City+Image'}
          alt={city.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://via.placeholder.com/1200x500?text=Image+Not+Available';
          }}
        />
        <div className="absolute inset-0 bg-black bg-opacity-40" />
        
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-8">
            <div className="flex items-center justify-between">
              <div className="text-white">
                <Link
                  to="/"
                  className="inline-flex items-center text-white hover:text-orange-300 mb-4 transition-colors duration-200"
                >
                  <ArrowLeftIcon className="h-5 w-5 mr-2" />
                  Back to destinations
                </Link>
                <h1 className="text-4xl md:text-5xl font-bold mb-2">{city.name}</h1>
                <div className="flex items-center space-x-4 text-lg">
                  <div className="flex items-center">
                    <MapPinIcon className="h-5 w-5 mr-1" />
                    {city.state}
                  </div>
                  <div className="flex items-center">
                    <StarIcon className="h-5 w-5 mr-1 fill-current text-yellow-400" />
                    4.5 (1,234 reviews)
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button className="bg-white bg-opacity-20 backdrop-blur-sm p-3 rounded-full hover:bg-opacity-30 transition-all duration-200">
                  <ShareIcon className="h-6 w-6 text-white" />
                </button>
                {user && !loading && (
                  <button
                    onClick={handleFavoriteToggle}
                    className="bg-white bg-opacity-20 backdrop-blur-sm p-3 rounded-full hover:bg-opacity-30 transition-all duration-200"
                  >
                    {isFavorite ? (
                      <HeartSolidIcon className="h-6 w-6 text-red-500" />
                    ) : (
                      <HeartIcon className="h-6 w-6 text-white" />
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* City Info */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">About {city.name}</h2>
                <p className="text-gray-600 text-lg leading-relaxed mb-6">{city.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {city?.bestTimeToVisit && (
                    <div className="flex items-start space-x-3">
                      <CalendarIcon className="h-6 w-6 text-orange-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-gray-900">Best Time to Visit</p>
                        <p className="text-gray-600">{city.bestTimeToVisit}</p>
                      </div>
                    </div>
                  )}
                  {city?.climate && (
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl mt-0.5 flex-shrink-0">🌡️</span>
                      <div>
                        <p className="font-semibold text-gray-900">Climate</p>
                        <p className="text-gray-600">{city.climate}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Tabs */}
              <div>
                <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
                  {[
                    { key: 'attractions' as const, label: 'Attractions', icon: '🏛️' },
                    { key: 'specialties' as const, label: 'Local Specialties', icon: '🍛' },
                    { key: 'events' as const, label: 'Events', icon: '🎪' },
                    { key: 'transport' as const, label: 'Transport', icon: '🚌' },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => handleTabChange(tab.key)}
                      className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                        activeTab === tab.key
                          ? 'bg-white text-orange-600 shadow-sm'
                          : 'text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <span className="mr-2">{tab.icon}</span>
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  {activeTab === 'attractions' && (
                    <div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-900">Top Attractions</h3>
                        <div className="relative mt-3 sm:mt-0">
                          <button
                            className="flex items-center text-sm text-gray-600 hover:text-gray-900"
                          >
                            <FunnelIcon className="h-4 w-4 mr-1" />
                            <span>Filter by Category</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'transport' && (
                    <div className="space-y-6">
                      {transportation.map((transport) => (
                        <div
                          key={transport.id}
                          className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 p-6"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {transport.name}
                              </h3>
                              <p className="mt-1 text-sm text-gray-500">
                                {transport.type}
                              </p>
                            </div>
                            {transport.routes && transport.routes.length > 0 && (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {transport.routes.length} routes
                              </span>
                            )}
                          </div>
                          <p className="mt-3 text-gray-600">
                            {transport.description}
                          </p>
                          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500">Approximate Cost</p>
                              <p className="font-medium text-gray-900">
                                {transport.approximateCost || 'Varies'}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500">Booking</p>
                              <p className="font-medium text-gray-900">
                                {transport.bookingInfo || 'Available on request'}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Map Placeholder */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Location</h3>
                <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center">
                  <div className="text-center text-gray-600">
                    <MapPinIcon className="h-12 w-12 mx-auto mb-2" />
                    <p>Interactive map will be displayed here</p>
                    <p className="text-sm">Google Maps integration</p>
                  </div>
                </div>
                {city.coordinates && (
                  <div className="mt-4 text-sm text-gray-600">
                    <p>Coordinates: {city.coordinates.lat}, {city.coordinates.lng}</p>
                    <button 
                      onClick={viewOnMap}
                      className="mt-2 text-orange-600 hover:text-orange-800 text-sm font-medium"
                    >
                      View on Google Maps
                    </button>
                  </div>
                )}
              </div>

              {/* Weather Widget */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Weather</h3>
                <div className="text-center">
                  <div className="text-4xl mb-2">☀️</div>
                  <p className="text-2xl font-bold text-gray-900">28°C</p>
                  <p className="text-gray-600">Sunny</p>
                  <p className="text-sm text-gray-500 mt-2">Perfect weather for sightseeing!</p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Quick Stats
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Attractions</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {city.attractions?.length || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Local Specialties</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {localSpecialties.length}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Upcoming Events</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {events.length}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Transport Options</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {transportation.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CityPage;