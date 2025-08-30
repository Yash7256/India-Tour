import { useEffect, useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { Place } from '../types';
import { Link } from 'react-router-dom';
import { 
  MapPinIcon, 
  StarIcon, 
  ChevronDownIcon, 
  ChevronUpIcon,
  ClockIcon,
  CalendarIcon
} from '@heroicons/react/24/solid';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface StateGroup {
  state: string;
  places: Place[];
  isOpen: boolean;
}

export default function Destinations() {
  const { places, loading, error, searchPlaces } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [stateGroups, setStateGroups] = useState<StateGroup[]>([]);

  useEffect(() => {
    if (places.length > 0) {
      // Group places by state
      const grouped = places.reduce<Record<string, Place[]>>((acc, place) => {
        if (!acc[place.state]) {
          acc[place.state] = [];
        }
        acc[place.state].push(place);
        return acc;
      }, {});

      // Convert to array and sort by state name
      const sortedStates = Object.entries(grouped)
        .map(([state, places]) => ({
          state,
          places: places.sort((a, b) => a.name.localeCompare(b.name)),
          isOpen: false
        }))
        .sort((a, b) => a.state.localeCompare(b.state));

      // Open first state by default
      if (sortedStates.length > 0) {
        sortedStates[0].isOpen = true;
      }

      setStateGroups(sortedStates);
    }
  }, [places]);

  const toggleState = (stateName: string) => {
    setStateGroups(prev => 
      prev.map(group => 
        group.state === stateName 
          ? { ...group, isOpen: !group.isOpen } 
          : group
      )
    );
  };

  const filteredStateGroups = useMemo(() => {
    if (!searchQuery.trim()) return stateGroups;
    
    const query = searchQuery.toLowerCase();
    return stateGroups
      .map(group => ({
        ...group,
        places: group.places.filter(
          place => 
            place.name.toLowerCase().includes(query) ||
            place.city?.toLowerCase().includes(query) ||
            place.description?.toLowerCase().includes(query)
        ),
        isOpen: true // Auto-expand when searching
      }))
      .filter(group => group.places.length > 0);
  }, [stateGroups, searchQuery]);

  if (error) return <div className="text-red-500 p-4">Error loading destinations: {error.message}</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            Explore India's Beauty
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Discover amazing destinations across India's diverse states and union territories
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search destinations, cities, or states..."
              className="block w-full pl-10 pr-3 py-4 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-base shadow-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-4 w-48 bg-gray-200 rounded mb-4"></div>
              <div className="text-gray-500">Loading destinations...</div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredStateGroups.length > 0 ? (
              filteredStateGroups.map((group) => (
                <div key={group.state} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                  <button
                    onClick={() => toggleState(group.state)}
                    className="w-full px-6 py-4 flex justify-between items-center text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 rounded-lg"
                  >
                    <h2 className="text-xl font-bold text-gray-900">
                      {group.state}
                      <span className="ml-2 text-sm font-normal text-gray-500">
                        ({group.places.length} {group.places.length === 1 ? 'destination' : 'destinations'})
                      </span>
                    </h2>
                    {group.isOpen ? (
                      <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                    )}
                  </button>
                  
                  {group.isOpen && (
                    <div className="px-6 pb-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                        {group.places.map((place) => (
                          <div key={place.id} className="group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
                            <Link to={`/destination/${place.id}`} className="block">
                              <div className="relative h-48 overflow-hidden">
                                <img
                                  src={place.imageUrl || '/images/placeholder.jpg'}
                                  alt={place.name}
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                  loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                                <div className="absolute bottom-0 left-0 right-0 p-4">
                                  <h3 className="text-white font-bold text-lg">{place.name}</h3>
                                  <div className="flex items-center text-white/90 text-sm mt-1">
                                    <MapPinIcon className="w-4 h-4 mr-1" />
                                    <span>{place.city}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="p-4">
                                <p className="text-gray-600 text-sm line-clamp-2 mb-3 h-12">
                                  {place.description?.substring(0, 100)}...
                                </p>
                                
                                <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
                                  {place.duration && (
                                    <span className="flex items-center">
                                      <ClockIcon className="w-3.5 h-3.5 mr-1" />
                                      {place.duration}
                                    </span>
                                  )}
                                  {place.bestTime && (
                                    <span className="flex items-center">
                                      <CalendarIcon className="w-3.5 h-3.5 mr-1" />
                                      {place.bestTime}
                                    </span>
                                  )}
                                </div>
                                
                                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                                  <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-md">
                                    <StarIcon className="w-4 h-4 text-yellow-400 mr-1" />
                                    <span className="text-sm font-semibold text-gray-800">
                                      {place.rating?.toFixed(1) || 'N/A'}
                                    </span>
                                    <span className="text-xs text-gray-500 ml-1">
                                      ({place.reviewCount || 0})
                                    </span>
                                  </div>
                                  
                                  <span className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
                                    Explore →
                                  </span>
                                </div>
                              </div>
                            </Link>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-medium text-gray-900">No destinations found</h3>
                <p className="mt-2 text-gray-500">
                  {searchQuery 
                    ? 'Try a different search term'
                    : 'No destinations available at the moment'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
