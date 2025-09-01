import React, { useEffect, useState, useCallback } from 'react';
import { 
  MapPinIcon, 
  StarIcon, 
  ClockIcon, 
  ArrowRightIcon,
  BuildingOffice2Icon,
  UserGroupIcon,
  SparklesIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/solid';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useData } from '../context/DataContext';
import { City } from '../types';

interface CityWithDetails extends City {
  image_url?: string;
  rating?: number;
  places_count?: number;
}

const CityCard: React.FC<{ city: CityWithDetails }> = ({ city }) => (
  <div className="group bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-gray-100">
    <div className="relative h-64 overflow-hidden">
      <img
        src={city.image_url || `https://images.unsplash.com/photo-1571115764595-644a1f56a55c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80`}
        alt={city.name}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
      
      {city.rating && (
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center">
          <StarIcon className="h-4 w-4 text-yellow-500 mr-1" />
          <span className="text-sm font-bold text-gray-800">{city.rating.toFixed(1)}</span>
        </div>
      )}
      
      <div className="absolute bottom-0 left-0 p-6 w-full">
        <h3 className="text-2xl font-bold text-white mb-2">{city.name}</h3>
        <div className="flex items-center text-blue-200 text-sm">
          <MapPinIcon className="h-4 w-4 mr-2" />
          <span>Madhya Pradesh, India</span>
        </div>
      </div>
    </div>
    
    <div className="p-6">
      <p className="text-gray-600 text-base leading-relaxed mb-6 line-clamp-3">
        {city.description || `Discover the enchanting city of ${city.name} with its rich cultural heritage, stunning architecture, and vibrant local traditions.`}
      </p>
      
      <div className="flex items-center justify-between">
        {city.places_count && (
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {city.places_count} places
          </span>
        )}
        <button className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors duration-200 group">
          Explore {city.name}
          <ArrowRightIcon className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  </div>
);

const MadhyaPradeshPage: React.FC = () => {
  const { citiesLoading, citiesError, getCitiesByState } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCities, setFilteredCities] = useState<CityWithDetails[]>([]);

  const filterCities = useCallback(() => {
    try {
      const mpCities = getCitiesByState('Madhya Pradesh');
      if (!searchQuery.trim()) {
        return mpCities;
      }
      const query = searchQuery.toLowerCase();
      return mpCities.filter(city => 
        city.name.toLowerCase().includes(query) ||
        (city.description && city.description.toLowerCase().includes(query))
      );
    } catch (err) {
      console.error('Error filtering cities:', err);
      return [];
    }
  }, [searchQuery, getCitiesByState]);

  useEffect(() => {
    const filtered = filterCities();
    setFilteredCities(filtered as CityWithDetails[]);
  }, [filterCities]);

  if (citiesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (citiesError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-6 max-w-md mx-auto bg-red-50 rounded-lg">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-700 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">We couldn't load the cities data. Please try again later.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Enhanced Hero Section with Parallax Effect */}
      <div className="relative h-[500px] w-full overflow-hidden">
        {/* Multiple background layers for depth */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transform scale-110 transition-transform duration-1000"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`
          }}
        />
        
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 via-indigo-900/60 to-purple-900/80"></div>
        
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-2 h-2 bg-blue-300 rounded-full opacity-60 animate-float-1"></div>
          <div className="absolute top-40 right-20 w-3 h-3 bg-indigo-300 rounded-full opacity-50 animate-float-2"></div>
          <div className="absolute bottom-40 left-32 w-2 h-2 bg-purple-300 rounded-full opacity-70 animate-float-3"></div>
          <div className="absolute top-60 left-1/2 w-1 h-1 bg-blue-200 rounded-full opacity-80 animate-float-4"></div>
        </div>
        
        {/* Main content */}
        <div className="relative h-full flex items-center justify-center">
          <div className="text-center text-white px-6 max-w-5xl mx-auto">
            <div className="mb-6 animate-fade-in">
              <SparklesIcon className="h-16 w-16 text-blue-300 mx-auto mb-4 animate-pulse-gentle" />
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black mb-8 leading-tight animate-fade-in-up">
              <span className="bg-gradient-to-r from-white via-blue-100 to-indigo-100 bg-clip-text text-transparent drop-shadow-2xl">
                Madhya Pradesh
              </span>
            </h1>
            
            <p className="text-2xl md:text-3xl text-blue-100 font-semibold drop-shadow-xl animate-fade-in-up-delay mb-8">
              The Heart of Incredible India
            </p>
            
            <div className="flex justify-center animate-fade-in-up-delay-2">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-6 py-3">
                <p className="text-blue-100 text-lg font-medium">
                  Rich Heritage • Wildlife Sanctuaries • Ancient Temples
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Modern wave overlay */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" className="w-full h-20 text-gray-50">
            <path fill="currentColor" d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,64C960,75,1056,85,1152,80C1248,75,1344,53,1392,42.7L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"></path>
          </svg>
        </div>
      </div>
      
      {/* Content Section */}
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        {/* Enhanced Search Section */}
        <div className="mb-12 relative">
          <div className="bg-white/80 backdrop-blur-lg p-8 rounded-3xl shadow-xl border border-white/50">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Discover Cities</h2>
              <p className="text-gray-600">Search and explore the beautiful cities of Madhya Pradesh</p>
            </div>
            
            <div className="relative max-w-2xl mx-auto">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-6 w-6 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search cities in Madhya Pradesh..."
                className="block w-full pl-12 pr-4 py-4 text-lg border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/90 backdrop-blur-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Cities Grid or Coming Soon Message */}
        {filteredCities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCities.map((city) => (
              <CityCard key={city.id} city={city} />
            ))}
          </div>
        ) : (
          /* Enhanced "Cities Listing Soon" Message */
          <div className="relative">
            <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-3xl border border-blue-200/50 shadow-2xl overflow-hidden backdrop-blur-sm">
              {/* Animated background elements */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-4 -left-4 w-24 h-24 bg-blue-400/10 rounded-full animate-pulse-slow"></div>
                <div className="absolute top-1/3 -right-8 w-32 h-32 bg-indigo-400/10 rounded-full animate-pulse-slow" style={{animationDelay: '1s'}}></div>
                <div className="absolute -bottom-6 left-1/3 w-20 h-20 bg-purple-400/10 rounded-full animate-pulse-slow" style={{animationDelay: '2s'}}></div>
              </div>
              
              {/* Subtle pattern overlay */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%232563eb' fill-opacity='0.6'%3E%3Ccircle cx='40' cy='40' r='3'/%3E%3Ccircle cx='20' cy='20' r='2'/%3E%3Ccircle cx='60' cy='20' r='2'/%3E%3Ccircle cx='20' cy='60' r='2'/%3E%3Ccircle cx='60' cy='60' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                  backgroundSize: '80px 80px'
                }}></div>
              </div>
              
              <div className="relative text-center py-20 px-8">
                {/* Animated icon with glow effect */}
                <div className="mx-auto mb-8 relative">
                  <div className="w-28 h-28 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-full flex items-center justify-center shadow-2xl animate-pulse-gentle">
                    <ClockIcon className="h-14 w-14 text-white drop-shadow-lg" />
                  </div>
                  <div className="absolute inset-0 w-28 h-28 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full animate-ping opacity-20"></div>
                </div>
                
                {/* Main heading with enhanced typography */}
                <h3 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
                  <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Cities Listing Soon
                  </span>
                </h3>
                
                {/* Enhanced description */}
                <p className="text-xl text-gray-700 max-w-lg mx-auto mb-10 leading-relaxed font-medium">
                  We're carefully curating the most spectacular cities and hidden gems of 
                  <span className="text-indigo-600 font-bold"> Madhya Pradesh</span> for you
                </p>
                
                {/* Feature preview cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-12">
                  {[
                    { icon: BuildingOffice2Icon, title: "Historic Cities", desc: "Ancient temples & palaces", color: "from-amber-400 to-orange-500" },
                    { icon: UserGroupIcon, title: "Cultural Hubs", desc: "Tribal art & traditions", color: "from-emerald-400 to-teal-500" },
                    { icon: MapPinIcon, title: "Sacred Sites", desc: "Spiritual destinations", color: "from-purple-400 to-indigo-500" }
                  ].map((feature, index) => (
                    <div 
                      key={feature.title}
                      className="group p-6 bg-white/70 backdrop-blur-md rounded-2xl border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-fade-in-up"
                      style={{animationDelay: `${(index + 1) * 200}ms`}}
                    >
                      <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4 mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <feature.icon className="h-6 w-6 text-white" />
                      </div>
                      <h4 className="text-lg font-bold text-gray-800 mb-2">{feature.title}</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">{feature.desc}</p>
                    </div>
                  ))}
                </div>
                
                {/* Enhanced call to action */}
                <div className="space-y-6">
                  {searchQuery ? (
                    <div className="inline-block bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full border border-blue-200 shadow-md">
                      <p className="text-sm text-gray-600 font-medium">
                        No results for "<span className="text-blue-600 font-bold">{searchQuery}</span>". Check back soon for new cities!
                      </p>
                    </div>
                  ) : null}
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <button className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1">
                      <SparklesIcon className="h-5 w-5 mr-3 animate-spin-slow" />
                      Explore Other States
                      <ArrowRightIcon className="ml-3 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                    </button>
                    
                    <div className="flex items-center space-x-2 text-gray-600 bg-white/60 backdrop-blur-sm px-6 py-3 rounded-full border border-gray-200 shadow-md">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">Amazing MP Cities Coming Soon</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced About Section */}
      <div className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-sm text-blue-600 font-bold tracking-widest uppercase mb-4">About Madhya Pradesh</h2>
            <h3 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">
              The <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Heart of India</span>
            </h3>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Discover the rich cultural heritage, stunning architecture, and breathtaking natural beauty that makes Madhya Pradesh truly special.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: MapPinIcon,
                title: "Central Location",
                description: "Located in the heart of India, Madhya Pradesh serves as the geographical center of the country with incredible connectivity.",
                color: "from-blue-500 to-cyan-500"
              },
              {
                icon: BuildingOffice2Icon,
                title: "UNESCO Heritage",
                description: "Home to three UNESCO World Heritage Sites: Khajuraho, Sanchi Buddhist Monuments, and Bhimbetka Rock Shelters.",
                color: "from-indigo-500 to-purple-500"
              },
              {
                icon: UserGroupIcon,
                title: "Tribal Culture",
                description: "Rich in tribal diversity with over 45 recognized tribes, each preserving unique traditions, art forms, and festivals.",
                color: "from-purple-500 to-pink-500"
              }
            ].map((feature, index) => (
              <div 
                key={feature.title}
                className="group bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-white/50 animate-fade-in-up"
                style={{animationDelay: `${index * 150}ms`}}
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h4>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes pulse-gentle {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
        
        @keyframes float-1 {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          33% { transform: translateY(-20px) translateX(10px); }
          66% { transform: translateY(10px) translateX(-5px); }
        }
        
        @keyframes float-2 {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          33% { transform: translateY(15px) translateX(-10px); }
          66% { transform: translateY(-10px) translateX(15px); }
        }
        
        @keyframes float-3 {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-25px) translateX(8px); }
        }
        
        @keyframes float-4 {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-15px) translateX(-8px); }
          75% { transform: translateY(10px) translateX(12px); }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out both;
        }
        
        .animate-fade-in-up-delay {
          animation: fade-in-up 0.8s ease-out 0.3s both;
        }
        
        .animate-fade-in-up-delay-2 {
          animation: fade-in-up 0.8s ease-out 0.6s both;
        }
        
        .animate-pulse-gentle {
          animation: pulse-gentle 3s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        
        .animate-float-1 {
          animation: float-1 6s ease-in-out infinite;
        }
        
        .animate-float-2 {
          animation: float-2 8s ease-in-out infinite;
        }
        
        .animate-float-3 {
          animation: float-3 7s ease-in-out infinite;
        }
        
        .animate-float-4 {
          animation: float-4 9s ease-in-out infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default MadhyaPradeshPage;