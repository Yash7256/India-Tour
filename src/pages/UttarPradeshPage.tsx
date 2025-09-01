import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Place } from '../types';
import { 
  MapPinIcon, 
  StarIcon, 
  ArrowRightIcon,
  BuildingOffice2Icon,
  UserGroupIcon,
  CurrencyRupeeIcon,
  CalendarIcon,
  ClockIcon
} from '@heroicons/react/24/solid';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const UttarPradeshPage = () => {
  const { places, loading, error } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPlaces, setFilteredPlaces] = useState<Place[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>('All Cities');

  // Filter places for Uttar Pradesh
  useEffect(() => {
    if (places) {
      let upPlaces = places.filter(place => {
        const state = place.state?.toLowerCase() || '';
        return state === 'uttar pradesh' || state === 'up';
      });
      
      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        upPlaces = upPlaces.filter(place => {
          const name = place.name?.toLowerCase() || '';
          const cityName = typeof place.city === 'object' ? place.city.name.toLowerCase() : '';
          const description = place.description?.toLowerCase() || '';
          
          return name.includes(query) || 
                 cityName.includes(query) || 
                 description.includes(query);
        });
      }
      
      // Apply city filter
      if (selectedCity !== 'All Cities') {
        upPlaces = upPlaces.filter(place => {
          const cityName = typeof place.city === 'object' 
            ? place.city.name 
            : place.city || '';
          return cityName.toLowerCase() === selectedCity.toLowerCase();
        });
      }
      
      setFilteredPlaces(upPlaces);
    }
  }, [places, searchQuery, selectedCity]);

  // Get unique cities for filter
  const cities = ['All Cities', ...new Set(
    places
      ?.filter(place => {
        const state = place.state?.toLowerCase() || '';
        return state === 'uttar pradesh' || state === 'up';
      })
      .map(place => {
        if (typeof place.city === 'object') {
          return place.city.name;
        }
        return place.city || '';
      })
      .filter(Boolean)
  )].sort();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-12 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-4">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Destinations</h2>
          <p className="text-gray-600 mb-4">We're having trouble loading the destinations. Please try again later.</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Hero Section with Cover Photo */}
      <div className="relative h-96 w-full overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1564507592333-c60657eea523?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80')`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/70"></div>
        <div className="relative h-full flex items-center justify-center">
          <div className="text-center text-white px-4 max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 drop-shadow-2xl animate-fade-in">
              Uttar Pradesh
            </h1>
            <p className="text-xl md:text-2xl text-gray-100 font-medium drop-shadow-lg animate-fade-in-delay">
              Explore the cultural and spiritual heartland of India
            </p>
          </div>
        </div>
        {/* Decorative overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-200 to-transparent"></div>
      </div>
      
      {/* Content Section */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Search and Filter */}
        <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search destinations in Uttar Pradesh..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              className="block w-full md:w-64 pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-orange-500 focus:border-orange-500 rounded-md"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
            >
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Destinations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPlaces.length > 0 ? (
            filteredPlaces.map((place) => (
              <div key={place.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                {place.imageUrl || (place.images && place.images.length > 0) ? (
                  <img 
                    src={place.imageUrl || place.images?.[0] || ''} 
                    alt={place.name || 'Destination image'} 
                    className="w-full h-56 object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Available';
                    }}
                  />
                ) : (
                  <div className="w-full h-56 bg-gray-200 flex items-center justify-center">
                    <BuildingOffice2Icon className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{place.name}</h3>
                    {place.rating && (
                      <div className="flex items-center bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-sm">
                        <StarIcon className="h-4 w-4 mr-1" />
                        {place.rating.toFixed(1)}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center text-gray-600 text-sm mb-3">
                    <MapPinIcon className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span className="truncate">
                      {typeof place.city === 'object' ? place.city.name : place.city || 'Unknown City'}
                      {place.state ? `, ${place.state}` : ''}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {place.description || 'No description available.'}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {place.category && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {place.category}
                      </span>
                    )}
                    {place.bestTime && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CalendarIcon className="h-3 w-3 mr-1" />
                        {place.bestTime}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center mt-4">
                    <div className="text-sm text-gray-500">
                      {place.entry_fee && (
                        <span className="flex items-center">
                          <CurrencyRupeeIcon className="h-4 w-4 mr-1" />
                          {place.entry_fee.startingFrom === 0 || !place.entry_fee.startingFrom 
                            ? 'Free' 
                            : `From ₹${place.entry_fee.startingFrom}${place.entry_fee.currency ? ` ${place.entry_fee.currency}` : ''}`}
                        </span>
                      )}
                    </div>
                    <Link 
                      to={`/city/${place.id}`}
                      className="inline-flex items-center text-orange-600 hover:text-orange-800 font-medium text-sm"
                    >
                      View Details
                      <ArrowRightIcon className="ml-1 h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            /* Enhanced "Destinations Listing Soon" Message */
            <div className="col-span-full">
              <div className="relative bg-gradient-to-br from-orange-50 via-white to-orange-50 rounded-2xl border border-orange-100 shadow-lg overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f97316' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    backgroundSize: '60px 60px'
                  }}></div>
                </div>
                
                <div className="relative text-center py-16 px-8">
                  {/* Icon */}
                  <div className="mx-auto mb-6 w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
                    <ClockIcon className="h-10 w-10 text-white" />
                  </div>
                  
                  {/* Main Message */}
                  <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                    <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                      Destinations Listing Soon
                    </span>
                  </h3>
                  
                  <p className="text-lg text-gray-600 max-w-md mx-auto mb-8 leading-relaxed">
                    We're curating the most amazing destinations in Uttar Pradesh for you. 
                    Stay tuned for incredible places to explore!
                  </p>
                  
                  {/* Features Preview */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto mb-8">
                    <div className="flex flex-col items-center p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-orange-100">
                      <BuildingOffice2Icon className="h-8 w-8 text-orange-500 mb-2" />
                      <span className="text-sm font-medium text-gray-700">Historic Sites</span>
                    </div>
                    <div className="flex flex-col items-center p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-orange-100">
                      <UserGroupIcon className="h-8 w-8 text-orange-500 mb-2" />
                      <span className="text-sm font-medium text-gray-700">Cultural Hubs</span>
                    </div>
                    <div className="flex flex-col items-center p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-orange-100">
                      <MapPinIcon className="h-8 w-8 text-orange-500 mb-2" />
                      <span className="text-sm font-medium text-gray-700">Sacred Places</span>
                    </div>
                  </div>
                  
                  {/* Call to Action */}
                  <div className="space-y-4">
                    {searchQuery || selectedCity !== 'All Cities' ? (
                      <p className="text-sm text-gray-500 bg-white/50 px-4 py-2 rounded-lg inline-block">
                        Try adjusting your search or filter criteria, or check back soon for new destinations!
                      </p>
                    ) : null}
                    
                    <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                      <Link 
                        to="/destinations"
                        className="inline-flex items-center px-6 py-3 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors duration-200 shadow-md hover:shadow-lg"
                      >
                        Explore Other States
                        <ArrowRightIcon className="ml-2 h-4 w-4" />
                      </Link>
                      <span className="text-sm text-gray-500 bg-white/70 px-4 py-2 rounded-lg">
                        Coming Soon: Amazing UP Destinations
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* About Uttar Pradesh Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-orange-600 font-semibold tracking-wide uppercase">About Uttar Pradesh</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              The Heart of India
            </p>
            <p className="mt-4 max-w-4xl text-xl text-gray-500 lg:mx-auto">
              Uttar Pradesh, often referred to as UP, is India's most populous state and the heart of the country's cultural and spiritual heritage. 
              It is home to some of the most sacred pilgrimage sites, magnificent Mughal architecture, and vibrant cultural traditions.
            </p>
          </div>

          <div className="mt-20">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-3 lg:gap-8">
              <div className="space-y-5">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-orange-500 text-white">
                  <BuildingOffice2Icon className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Historical Significance</h3>
                  <p className="text-gray-500">
                    Home to three UNESCO World Heritage Sites including the iconic Taj Mahal, Agra Fort, and Fatehpur Sikri.
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-orange-500 text-white">
                  <UserGroupIcon className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Cultural Hub</h3>
                  <p className="text-gray-500">
                    Birthplace of many classical dance forms, music, and the ancient language of Sanskrit.
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-orange-500 text-white">
                  <MapPinIcon className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Spiritual Center</h3>
                  <p className="text-gray-500">
                    Houses some of the holiest Hindu pilgrimage sites including Varanasi, Allahabad, and Mathura.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        
        .animate-fade-in-delay {
          animation: fade-in 0.8s ease-out 0.2s both;
        }
      `}</style>
    </div>
  );
};

export default UttarPradeshPage;