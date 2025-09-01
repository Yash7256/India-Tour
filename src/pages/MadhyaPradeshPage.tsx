import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
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
  <Link to={city.name.toLowerCase() === 'bhopal' ? '/bhopal' : city.name.toLowerCase() === 'pachmarhi' ? '/pachmarhi' : city.name.toLowerCase() === 'neemuch' ? '/neemuch' :city.name.toLowerCase() === 'sheopur' ? '/sheopur':`#${city.name.toLowerCase()}`} 
        className="block group bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-gray-100">
    <div className="relative h-64 overflow-hidden">
      <img
        src={city.image_url || `https://source.unsplash.com/random/800x600/?${city.name},india`}
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
      
      <div className="flex items-center justify-between border-t border-gray-100 pt-4">
        <div className="flex items-center text-sm text-gray-500">
          <BuildingOffice2Icon className="h-4 w-4 mr-1" />
          <span>{city.places_count || 'Many'} places to explore</span>
        </div>
        <button className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors duration-200 group">
          Explore {city.name}
          <ArrowRightIcon className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  </Link>
);

const MadhyaPradeshPage: React.FC = () => {
  const { fetchCitiesByState } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [cities, setCities] = useState<CityWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch cities when component mounts
  useEffect(() => {
    const loadCities = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const mpCities = await fetchCitiesByState('Madhya Pradesh');
        setCities(mpCities as CityWithDetails[]);
      } catch (err) {
        console.error('Error fetching cities:', err);
        setError(err instanceof Error ? err : new Error('Failed to load cities'));
      } finally {
        setIsLoading(false);
      }
    };

    loadCities();
  }, [fetchCitiesByState]);

  // Filter cities based on search query
  const filteredCities = useMemo(() => {
    if (!searchQuery.trim()) {
      return cities;
    }
    const query = searchQuery.toLowerCase();
    return cities.filter(city => 
      city.name.toLowerCase().includes(query) ||
      (city.description && city.description.toLowerCase().includes(query))
    );
  }, [cities, searchQuery]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
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
      {/* Hero Section */}
      <div className="relative h-[400px] w-full overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transform scale-110 transition-transform duration-1000"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`
          }}
        />
        
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 via-indigo-900/60 to-purple-900/80"></div>
        
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-2 h-2 bg-blue-300 rounded-full opacity-60 animate-float-1"></div>
          <div className="absolute top-40 right-20 w-3 h-3 bg-indigo-300 rounded-full opacity-50 animate-float-2"></div>
          <div className="absolute bottom-40 left-32 w-2 h-2 bg-purple-300 rounded-full opacity-70 animate-float-3"></div>
          <div className="absolute top-60 left-1/2 w-1 h-1 bg-blue-200 rounded-full opacity-80 animate-float-4"></div>
        </div>
        
        <div className="relative h-full flex items-center justify-center">
          <div className="text-center text-white px-6 max-w-5xl mx-auto">
            <div className="mb-6 animate-fade-in">
              <SparklesIcon className="h-16 w-16 text-blue-300 mx-auto mb-4 animate-pulse-gentle" />
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Explore Madhya Pradesh
            </h1>
            
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto mb-8">
              Discover the heart of Incredible India with its rich heritage, wildlife, and cultural wonders
            </p>
            
            <div className="max-w-2xl mx-auto relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-4 py-4 border border-transparent rounded-lg bg-white/20 backdrop-blur-sm text-white placeholder-blue-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 text-lg"
                placeholder="Search cities in Madhya Pradesh..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Cities Grid or Coming Soon Message */}
        {filteredCities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCities.map((city) => (
              <CityCard key={city.id} city={city} />
            ))}
          </div>
        ) : (
          <div className="relative">
            <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-3xl border border-blue-200/50 shadow-2xl overflow-hidden backdrop-blur-sm">
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-4 -left-4 w-24 h-24 bg-blue-400/10 rounded-full animate-pulse-slow"></div>
                <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-purple-400/10 rounded-full animate-pulse-slow animation-delay-2000"></div>
                <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-indigo-400/10 rounded-full animate-pulse-slow animation-delay-3000"></div>
              </div>
              
              <div className="relative z-10 p-12 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 mb-6">
                  <BuildingOffice2Icon className="h-10 w-10 text-blue-600" />
                </div>
                
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Cities Coming Soon!</h2>
                
                <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
                  We're working hard to bring you detailed information about cities in Madhya Pradesh. 
                  Check back soon to explore the rich cultural heritage and stunning destinations.
                </p>
                
                <div className="flex flex-wrap justify-center gap-4">
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center"
                  >
                    <ArrowRightIcon className="h-5 w-5 mr-2 -ml-1" />
                    View All Destinations
                  </button>
                  
                  <button className="px-6 py-3 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                    <ClockIcon className="h-5 w-5 mr-2 -ml-1 inline" />
                    Get Notified
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Animations */}
      <style jsx global>{`
        @keyframes float-1 {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
        
        @keyframes float-2 {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-30px) translateX(-15px); }
        }
        
        @keyframes float-3 {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(20px) translateX(15px); }
        }
        
        @keyframes float-4 {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-15px) translateX(-5px); }
        }
        
        @keyframes pulse-gentle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
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
        
        .animate-pulse-gentle {
          animation: pulse-gentle 3s ease-in-out infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-3000 {
          animation-delay: 3s;
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
