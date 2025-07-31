import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  MapPinIcon, 
  StarIcon, 
  CalendarIcon, 
  ClockIcon, 
  CurrencyDollarIcon,
  HeartIcon,
  ShareIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

const CityPage: React.FC = () => {
  const { cityId } = useParams<{ cityId: string }>();
  const { getCityById } = useData();
  const { user, addToFavorites, removeFromFavorites, loading } = useAuth();
  const [selectedAttraction, setSelectedAttraction] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'attractions' | 'specialties' | 'events' | 'transport'>('attractions');

  const city = cityId ? getCityById(cityId) : null;
  const isFavorite = user?.favoriteDestinations.includes(cityId || '') || false;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [cityId]);

  if (!city) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">City not found</h2>
          <Link to="/" className="text-orange-600 hover:text-orange-700">
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const handleFavoriteToggle = () => {
    if (!user || loading) return;
    
    if (isFavorite) {
      removeFromFavorites(city.id);
    } else {
      addToFavorites(city.id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-96 overflow-hidden">
        <img
          src={city.featuredImage}
          alt={city.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        
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
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex items-center space-x-3">
                    <CalendarIcon className="h-6 w-6 text-orange-500" />
                    <div>
                      <p className="font-semibold text-gray-900">Best Time to Visit</p>
                      <p className="text-gray-600">{city.bestTimeToVisit}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🌡️</span>
                    <div>
                      <p className="font-semibold text-gray-900">Climate</p>
                      <p className="text-gray-600">{city.climate}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div>
                <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
                  {[
                    { key: 'attractions', label: 'Attractions', icon: '🏛️' },
                    { key: 'specialties', label: 'Local Specialties', icon: '🍛' },
                    { key: 'events', label: 'Events', icon: '🎭' },
                    { key: 'transport', label: 'Transport', icon: '🚗' }
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key as any)}
                      className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                        activeTab === tab.key
                          ? 'bg-white text-orange-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <span>{tab.icon}</span>
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  {activeTab === 'attractions' && (
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-6">Top Attractions</h3>
                      <div className="space-y-6">
                        {city.attractions.map((attraction) => (
                          <div
                            key={attraction.id}
                            className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow duration-200"
                          >
                            <div className="flex flex-col md:flex-row gap-6">
                              <img
                                src={attraction.images[0]}
                                alt={attraction.name}
                                className="w-full md:w-48 h-32 object-cover rounded-lg"
                              />
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-2">
                                  <h4 className="text-lg font-bold text-gray-900">{attraction.name}</h4>
                                  <div className="flex items-center text-yellow-500">
                                    <StarIcon className="h-4 w-4 fill-current" />
                                    <span className="text-sm text-gray-600 ml-1">{attraction.rating}</span>
                                  </div>
                                </div>
                                <p className="text-sm text-orange-600 mb-2">{attraction.category}</p>
                                <p className="text-gray-600 mb-4">{attraction.description}</p>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                                  <div className="flex items-center text-gray-600">
                                    <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                                    {attraction.entryFee}
                                  </div>
                                  <div className="flex items-center text-gray-600">
                                    <ClockIcon className="h-4 w-4 mr-1" />
                                    {attraction.openingHours}
                                  </div>
                                  <div className="flex items-center text-gray-600">
                                    <span className="mr-1">♿</span>
                                    {attraction.accessibility}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'specialties' && (
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-6">Local Specialties</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {city.localSpecialties.map((specialty) => (
                          <div key={specialty.id} className="border border-gray-200 rounded-xl overflow-hidden">
                            <img
                              src={specialty.image}
                              alt={specialty.name}
                              className="w-full h-48 object-cover"
                            />
                            <div className="p-6">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-lg font-bold text-gray-900">{specialty.name}</h4>
                                <span className="px-3 py-1 bg-orange-100 text-orange-800 text-sm rounded-full capitalize">
                                  {specialty.type}
                                </span>
                              </div>
                              <p className="text-gray-600">{specialty.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'events' && (
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-6">Events & Festivals</h3>
                      <div className="space-y-6">
                        {city.events.map((event) => (
                          <div key={event.id} className="border border-gray-200 rounded-xl p-6">
                            <div className="flex flex-col md:flex-row gap-6">
                              <img
                                src={event.image}
                                alt={event.name}
                                className="w-full md:w-48 h-32 object-cover rounded-lg"
                              />
                              <div className="flex-1">
                                <h4 className="text-lg font-bold text-gray-900 mb-2">{event.name}</h4>
                                <p className="text-orange-600 font-semibold mb-2">{event.dateRange}</p>
                                <p className="text-gray-600 mb-4">{event.description}</p>
                                <div className="mb-4">
                                  <h5 className="font-semibold text-gray-900 mb-2">Special Attractions:</h5>
                                  <div className="flex flex-wrap gap-2">
                                    {event.specialAttractions.map((attraction, index) => (
                                      <span
                                        key={index}
                                        className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                                      >
                                        {attraction}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'transport' && (
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-6">Transportation Options</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {city.transportation.map((transport) => (
                          <div key={transport.id} className="border border-gray-200 rounded-xl p-6">
                            <div className="flex items-center mb-4">
                              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                                <span className="text-lg">
                                  {transport.type === 'bus' && '🚌'}
                                  {transport.type === 'train' && '🚆'}
                                  {transport.type === 'auto' && '🛺'}
                                  {transport.type === 'taxi' && '🚕'}
                                  {transport.type === 'metro' && '🚇'}
                                </span>
                              </div>
                              <h4 className="text-lg font-bold text-gray-900 capitalize">{transport.type}</h4>
                            </div>
                            <div className="space-y-3">
                              <div>
                                <p className="font-semibold text-gray-900">Routes:</p>
                                <p className="text-gray-600">{transport.routes.join(', ')}</p>
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">Cost:</p>
                                <p className="text-gray-600">{transport.approximateCost}</p>
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">Booking:</p>
                                <p className="text-gray-600">{transport.bookingInfo}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Map Placeholder */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Location</h3>
                <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center">
                  <div className="text-center text-gray-600">
                    <MapPinIcon className="h-12 w-12 mx-auto mb-2" />
                    <p>Interactive map will be displayed here</p>
                    <p className="text-sm">Google Maps integration</p>
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  <p>Coordinates: {city.coordinates.lat}, {city.coordinates.lng}</p>
                </div>
              </div>

              {/* Weather Widget */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Current Weather</h3>
                <div className="text-center">
                  <div className="text-4xl mb-2">☀️</div>
                  <p className="text-2xl font-bold text-gray-900">28°C</p>
                  <p className="text-gray-600">Sunny</p>
                  <p className="text-sm text-gray-500 mt-2">Perfect weather for sightseeing!</p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Stats</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Attractions</span>
                    <span className="font-semibold">{city.attractions.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Local Specialties</span>
                    <span className="font-semibold">{city.localSpecialties.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Annual Events</span>
                    <span className="font-semibold">{city.events.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transport Options</span>
                    <span className="font-semibold">{city.transportation.length}</span>
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