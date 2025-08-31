import { useEffect, useState, useMemo, useCallback } from 'react';
import { useData } from '../context/DataContext';
import { Place } from '../types';
import { Link } from 'react-router-dom';
import { 
  MapPinIcon, 
  StarIcon, 
  ClockIcon,
  CalendarIcon,
  ArrowRightIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  BuildingOffice2Icon
} from '@heroicons/react/24/solid';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface CityGroup {
  city: string;
  places: Place[];
  averageRating: number;
  totalDestinations: number;
  featuredPlace: Place;
}

interface StateGroup {
  state: string;
  cities: CityGroup[];
  totalPlaces: number;
  averageRating: number;
  isExpanded: boolean;
  featuredPlace: Place;
  image_url?: string;
}

export default function Destinations() {
  const { 
    places, 
    loading, 
    error, 
    states, 
    selectedState, 
    selectState,
    fetchStates 
  } = useData();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [stateGroups, setStateGroups] = useState<StateGroup[]>([]);
  const [viewMode, setViewMode] = useState<'states' | 'cities'>('states');

  // Fetch states when component mounts
  const [hasFetchedStates, setHasFetchedStates] = useState(false);
  
  useEffect(() => {
    if (fetchStates && !hasFetchedStates) {
      fetchStates();
      setHasFetchedStates(true);
    }
  }, [fetchStates, hasFetchedStates, places, states, selectedState]);

  useEffect(() => {
    if (states && states.length > 0) {
      // Create StateGroup array directly from states
      const stateGroupsData = states.map(state => {
        // Get places for this state
        const statePlaces = places?.filter(place => 
          place?.state && 
          place.state.toString().toLowerCase() === state.name.toLowerCase()
        ) || [];
        
        // Group places by city
        const cityMap = statePlaces.reduce<Record<string, Place[]>>((acc, place) => {
          if (!place || !place.city) return acc;
          
          const cityName = place.city.toString() || 'Unknown City';
          if (!acc[cityName]) {
            acc[cityName] = [];
          }
          acc[cityName].push(place);
          return acc;
        }, {});
        
        // Create city groups
        const cities: CityGroup[] = Object.entries(cityMap).map(([city, cityPlaces]) => {
          // Calculate average rating for city
          const ratingsSum = cityPlaces
            .filter(place => place.rating && !isNaN(place.rating))
            .reduce((sum, place) => sum + (place.rating || 0), 0);
          const validRatings = cityPlaces.filter(place => place.rating && !isNaN(place.rating)).length;
          const averageRating = validRatings > 0 ? ratingsSum / validRatings : 0;
          
          // Get featured place for city
          const featuredPlace = cityPlaces.reduce((best, current) => {
            const bestRating = best.rating || 0;
            const currentRating = current.rating || 0;
            return currentRating > bestRating ? current : best;
          }, cityPlaces[0]);
          
          return {
            city,
            places: cityPlaces.sort((a, b) => {
              const nameA = a.name?.toString() || '';
              const nameB = b.name?.toString() || '';
              return nameA.localeCompare(nameB);
            }),
            averageRating,
            totalDestinations: cityPlaces.length,
            featuredPlace
          };
        }).sort((a, b) => a.city.localeCompare(b.city));
        
        // Calculate state-level statistics
        const allPlaces = cities.flatMap(city => city.places);
        const stateRatingsSum = allPlaces
          .filter(place => place.rating && !isNaN(place.rating))
          .reduce((sum, place) => sum + (place.rating || 0), 0);
        const validStateRatings = allPlaces.filter(place => place.rating && !isNaN(place.rating)).length;
        const stateAverageRating = validStateRatings > 0 ? stateRatingsSum / validStateRatings : 0;
        
        // Get the best featured place for the entire state
        const stateFeaturedPlace = allPlaces.reduce((best, current) => {
          if (!best) return current;
          const bestRating = best.rating || 0;
          const currentRating = current.rating || 0;
          return currentRating > bestRating ? current : best;
        }, allPlaces[0]);
        
        return {
          state: state.name,
          cities,
          totalPlaces: allPlaces.length,
          averageRating: stateAverageRating,
          isExpanded: false,
          featuredPlace: stateFeaturedPlace,
          image_url: state.image_url
        };
      }).sort((a, b) => a.state.localeCompare(b.state));
      
      setStateGroups(stateGroupsData);
    } else if (places && places.length > 0) {
      // Fallback to old method if states are not available
      const stateMap = places.reduce<Record<string, Record<string, Place[]>>>((acc, place) => {
        if (!place || !place.state || !place.name) return acc;
        
        const stateName = place.state.toString();
        const cityName = place.city?.toString() || 'Unknown City';
        
        if (!acc[stateName]) acc[stateName] = {};
        if (!acc[stateName][cityName]) acc[stateName][cityName] = [];
        
        acc[stateName][cityName].push(place);
        return acc;
      }, {});
      
      const stateGroupsData = Object.entries(stateMap).map(([state, cityMap]) => {
        // Create city groups
        const cities: CityGroup[] = Object.entries(cityMap).map(([city, cityPlaces]) => {
          // Calculate average rating for city
          const ratingsSum = cityPlaces
            .filter(place => place.rating && !isNaN(place.rating))
            .reduce((sum, place) => sum + (place.rating || 0), 0);
          const validRatings = cityPlaces.filter(place => place.rating && !isNaN(place.rating)).length;
          const averageRating = validRatings > 0 ? ratingsSum / validRatings : 0;

          // Get featured place for city
          const featuredPlace = cityPlaces.reduce((best, current) => {
            const bestRating = best.rating || 0;
            const currentRating = current.rating || 0;
            return currentRating > bestRating ? current : best;
          }, cityPlaces[0]);

          return {
            city,
            places: cityPlaces.sort((a, b) => {
              const nameA = a.name?.toString() || '';
              const nameB = b.name?.toString() || '';
              return nameA.localeCompare(nameB);
            }),
            averageRating,
            totalDestinations: cityPlaces.length,
            featuredPlace
          };
        }).sort((a, b) => a.city.localeCompare(b.city));

        // Calculate state-level statistics
        const allPlaces = cities.flatMap(city => city.places);
        const stateRatingsSum = allPlaces
          .filter(place => place.rating && !isNaN(place.rating))
          .reduce((sum, place) => sum + (place.rating || 0), 0);
        const validStateRatings = allPlaces.filter(place => place.rating && !isNaN(place.rating)).length;
        const stateAverageRating = validStateRatings > 0 ? stateRatingsSum / validStateRatings : 0;

        // Get the best featured place for the entire state
        const stateFeaturedPlace = allPlaces.reduce((best, current) => {
          if (!best) return current;
          const bestRating = best.rating || 0;
          const currentRating = current.rating || 0;
          return currentRating > bestRating ? current : best;
        }, allPlaces[0]);

        // Try to find the state in the states array to get its image_url
        const stateData = states.find(s => s.name === state);
        
        return {
          state,
          cities,
          totalPlaces: allPlaces.length,
          averageRating: stateAverageRating,
          isExpanded: false,
          featuredPlace: stateFeaturedPlace,
          image_url: stateData?.image_url
        };
      }).sort((a, b) => a.state.localeCompare(b.state));

      setStateGroups(stateGroupsData);
    }
  }, [places, states]);

  const toggleStateExpansion = (stateName: string) => {
    setStateGroups(prev => 
      prev.map(group => 
        group.state === stateName 
          ? { ...group, isExpanded: !group.isExpanded }
          : group
      )
    );
  };

  const filteredData = useMemo(() => {
    // If we have a selected state, filter to only that state
    let filteredStates = stateGroups;
    
    if (selectedState) {
      filteredStates = stateGroups.filter(
        stateGroup => {
          // Convert both to lowercase for case-insensitive comparison
          const stateName = stateGroup.state.toLowerCase();
          const selectedStateName = selectedState.name.toLowerCase();
          return stateName === selectedStateName;
        }
      );
    }
    
    // Apply search query if present
    if (!searchQuery || !searchQuery.trim()) return filteredStates;
    
    const query = searchQuery.toLowerCase().trim();
    
    return filteredStates.filter(stateGroup => {
      // Search in state name
      if (stateGroup.state.toLowerCase().includes(query)) return true;
      
      // Search in cities and places within the state
      return stateGroup.cities.some(cityGroup => {
        // Search in city name
        if (cityGroup.city.toLowerCase().includes(query)) return true;
        
        // Search in places within the city
        return cityGroup.places.some(place => {
          if (!place) return false;
          
          const name = place.name?.toString()?.toLowerCase() || '';
          const description = place.description?.toString()?.toLowerCase() || '';
          
          return name.includes(query) || description.includes(query);
        });
      });
    });
  }, [stateGroups, searchQuery, selectedState]);

  // Get all cities for city view mode
  const allCities = useMemo(() => {
    return stateGroups.flatMap(state => 
      state.cities.map(city => ({ ...city, stateName: state.state }))
    );
  }, [stateGroups]);

  const filteredCities = useMemo(() => {
    if (!searchQuery || !searchQuery.trim()) return allCities;
    
    const query = searchQuery.toLowerCase().trim();
    return allCities.filter(city => {
      const cityName = city.city.toLowerCase();
      const stateName = city.stateName.toLowerCase();
      
      return cityName.includes(query) || 
             stateName.includes(query) ||
             city.places.some(place => {
               const name = place.name?.toString()?.toLowerCase() || '';
               const description = place.description?.toString()?.toLowerCase() || '';
               return name.includes(query) || description.includes(query);
             });
    });
  }, [allCities, searchQuery]);

  // State selector component
  const StateSelector = () => {
    // Get the state name from the selectedState object if it exists
    const selectedStateValue = selectedState?.id || '';
    
    return (
      <div className="mb-8">
        <label htmlFor="state-select" className="block text-sm font-medium text-gray-700 mb-2">
          Filter by State
        </label>
        <select
          id="state-select"
          value={selectedStateValue}
          onChange={(e) => {
            const stateId = e.target.value;
            selectState?.(stateId || null);
          }}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option value="">All States</option>
          {states.map((state) => (
            <option key={state.id} value={state.id}>
              {state.name}
            </option>
          ))}
        </select>
      </div>
    );
  };

  // Handle error and loading states with conditional rendering
  if (error) {
    return <div className="text-red-500 p-4">Error loading destinations: {error.message}</div>;
  }
  
  if (loading) {
    return <div className="text-center p-8">Loading destinations...</div>;
  }

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Explore India's Destinations
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            {selectedState 
              ? `Discover destinations in ${selectedState.name}`
              : 'Discover the most beautiful destinations across India\'s diverse states and cities'}
          </p>
          
          <StateSelector />
          
          {/* View Mode Toggle */}
          <div className="flex justify-center mb-8">
            <div className="bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('states')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'states' 
                    ? 'bg-white text-orange-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                By States
              </button>
              <button
                onClick={() => setViewMode('cities')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'cities' 
                    ? 'bg-white text-orange-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                By Cities
              </button>
            </div>
          </div>
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
              placeholder={viewMode === 'states' ? "Search states, cities, or destinations..." : "Search cities or destinations..."}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-base shadow-sm"
            />
          </div>
        </div>

        {viewMode === 'states' ? (
          /* States View - Card Layout */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredData.map((stateGroup, index) => (
              <Link
                key={stateGroup.state}
                to={`/state/${stateGroup.state.replace(/\s+/g, '-').toLowerCase()}`}
                className="group card-hover-effect"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="bg-white rounded-2xl overflow-hidden shadow-lg h-full flex flex-col transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                  <div className="relative overflow-hidden flex-1">
                    <img
                      src={stateGroup.image_url || '/images/placeholder.jpg'}
                      alt={stateGroup.state}
                      className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/images/placeholder.jpg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-70 transition-opacity duration-300"></div>
                    <div className="absolute top-3 right-3">
                      <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center">
                        <StarIcon className="h-3 w-3 text-yellow-500 fill-current mr-1" />
                        <span className="text-xs font-medium text-gray-700">
                          {stateGroup.averageRating > 0 ? stateGroup.averageRating.toFixed(1) : 'N/A'}
                        </span>
                      </div>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{stateGroup.cities.length} Cities</p>
                          <p className="text-sm opacity-90">{stateGroup.totalPlaces} Destinations</p>
                        </div>
                        <ArrowRightIcon className="h-6 w-6" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{stateGroup.state}</h3>
                      <div className="flex items-center text-yellow-500">
                        <StarIcon className="h-5 w-5 fill-current" />
                        <span className="text-sm text-gray-600 ml-1">
                          {stateGroup.averageRating > 0 ? stateGroup.averageRating.toFixed(1) : 'N/A'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-gray-600 mb-3">
                      <MapPinIcon className="h-4 w-4 mr-1" />
                      <span className="text-sm">India</span>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">
                      {stateGroup.featuredPlace?.description 
                        ? stateGroup.featuredPlace.description.substring(0, 100) + '...'
                        : `Explore ${stateGroup.totalPlaces} amazing destinations across ${stateGroup.cities.length} cities in ${stateGroup.state}`
                      }
                    </p>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                      <div className="flex items-center text-sm text-gray-500">
                        <BuildingOffice2Icon className="h-4 w-4 mr-1" />
                        <span>{stateGroup.cities.length} cities • {stateGroup.totalPlaces} places</span>
                      </div>
                      <span className="text-orange-600 font-semibold group-hover:text-orange-700 transition-colors duration-200">
                        Explore →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          /* Cities View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCities.map((cityGroup, index) => (
              <Link
                key={`${cityGroup.stateName}-${cityGroup.city}`}
                to={`/city/${cityGroup.featuredPlace.id}`}
                className="group card-hover-effect"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="bg-white rounded-2xl overflow-hidden shadow-lg h-full flex flex-col transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                  <div className="relative overflow-hidden flex-1">
                    <img
                      src={cityGroup.featuredPlace?.imageUrl || '/images/placeholder.jpg'}
                      alt={cityGroup.city}
                      className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/images/placeholder.jpg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-70 transition-opacity duration-300"></div>
                    <div className="absolute bottom-4 left-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{cityGroup.totalDestinations} Destinations</p>
                          <p className="text-sm opacity-90">in {cityGroup.stateName}</p>
                        </div>
                        <ArrowRightIcon className="h-6 w-6" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{cityGroup.city}</h3>
                      <div className="flex items-center text-yellow-500">
                        <StarIcon className="h-5 w-5 fill-current" />
                        <span className="text-sm text-gray-600 ml-1">
                          {cityGroup.averageRating > 0 ? cityGroup.averageRating.toFixed(1) : 'N/A'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-gray-600 mb-3">
                      <MapPinIcon className="h-4 w-4 mr-1" />
                      <span className="text-sm">{cityGroup.stateName}, India</span>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">
                      {cityGroup.featuredPlace?.description 
                        ? cityGroup.featuredPlace.description.substring(0, 100) + '...'
                        : `Explore ${cityGroup.totalDestinations} amazing destinations in ${cityGroup.city}`
                      }
                    </p>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                      <div className="flex items-center text-sm text-gray-500">
                        <BuildingOffice2Icon className="h-4 w-4 mr-1" />
                        <span>{cityGroup.totalDestinations} places</span>
                      </div>
                      <span className="text-orange-600 font-semibold group-hover:text-orange-700 transition-colors duration-200">
                        Explore →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {((viewMode === 'states' && filteredData.length === 0) || (viewMode === 'cities' && filteredCities.length === 0)) && (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-medium text-gray-900">No {viewMode} found</h3>
            <p className="mt-2 text-gray-500">
              {searchQuery 
                ? 'Try a different search term'
                : `No ${viewMode} available at the moment`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}