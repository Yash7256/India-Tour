import React, { useState, useEffect, useRef } from 'react';
import { MapPinIcon, EyeIcon } from '@heroicons/react/24/outline';
import { ArrowUpIcon } from '@heroicons/react/24/outline';
import { MapPinIcon as MapPinSolidIcon } from '@heroicons/react/24/solid';
import LoadingSpinner from './LoadingSpinner';

interface MapLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  type: 'city' | 'attraction' | 'hotel' | 'restaurant';
  rating?: number;
  image?: string;
  description?: string;
}

interface InteractiveMapProps {
  locations: MapLocation[];
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: string;
  showControls?: boolean;
  onLocationClick?: (location: MapLocation) => void;
  selectedLocationId?: string;
  className?: string;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({
  locations,
  center = { lat: 20.5937, lng: 78.9629 }, // Center of India
  zoom = 5,
  height = '400px',
  showControls = true,
  onLocationClick,
  selectedLocationId,
  className = ''
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  // Simulate map loading (in real implementation, you'd use Google Maps, Mapbox, or OpenStreetMap)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Get user's current location
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting user location:', error);
        }
      );
    }
  };

  const handleLocationClick = (location: MapLocation) => {
    setSelectedLocation(location);
    onLocationClick?.(location);
  };

  const getLocationTypeIcon = (type: string) => {
    switch (type) {
      case 'city':
        return '🏙️';
      case 'attraction':
        return '🏛️';
      case 'hotel':
        return '🏨';
      case 'restaurant':
        return '🍽️';
      default:
        return '📍';
    }
  };

  const getLocationTypeColor = (type: string) => {
    switch (type) {
      case 'city':
        return 'bg-blue-500';
      case 'attraction':
        return 'bg-orange-500';
      case 'hotel':
        return 'bg-green-500';
      case 'restaurant':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (mapError) {
    return (
      <div className={`${className} bg-gray-100 rounded-lg flex items-center justify-center`} style={{ height }}>
        <div className="text-center text-gray-500">
          <MapPinIcon className="w-12 h-12 mx-auto mb-2" />
          <p>Unable to load map</p>
          <button
            onClick={() => {
              setMapError(null);
              setIsLoading(true);
            }}
            className="mt-2 text-orange-500 hover:text-orange-600 text-sm"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Map Container */}
      <div
        ref={mapRef}
        className="relative bg-gradient-to-br from-blue-50 to-green-50 rounded-lg overflow-hidden border border-gray-200"
        style={{ height }}
      >
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <LoadingSpinner size="lg" />
              <p className="mt-2 text-gray-600">Loading map...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Simulated Map Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-green-50 to-yellow-50">
              {/* Grid pattern to simulate map */}
              <div className="absolute inset-0 opacity-20">
                <svg width="100%" height="100%">
                  <defs>
                    <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                      <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#cbd5e0" strokeWidth="1"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
              </div>
            </div>

            {/* Location Markers */}
            {locations.map((location, index) => (
              <div
                key={location.id}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 hover:scale-110 ${
                  selectedLocationId === location.id ? 'scale-125 z-20' : 'z-10'
                }`}
                style={{
                  left: `${20 + (index * 15) % 60}%`,
                  top: `${30 + (index * 10) % 40}%`
                }}
                onClick={() => handleLocationClick(location)}
              >
                <div className={`relative ${getLocationTypeColor(location.type)} rounded-full p-2 shadow-lg border-2 border-white`}>
                  <MapPinSolidIcon className="w-5 h-5 text-white" />
                  {selectedLocationId === location.id && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-400 rounded-full animate-ping"></div>
                  )}
                </div>
                
                {/* Location tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  <div className="bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                    {location.name}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-black"></div>
                  </div>
                </div>
              </div>
            ))}

            {/* User Location Marker */}
            {userLocation && (
              <div
                className="absolute transform -translate-x-1/2 -translate-y-1/2 z-30"
                style={{
                  left: '50%',
                  top: '50%'
                }}
              >
                <div className="relative bg-blue-600 rounded-full p-2 shadow-lg border-2 border-white animate-pulse">
                  <ArrowUpIcon className="w-4 h-4 text-white" />
                </div>
              </div>
            )}
          </>
        )}

        {/* Map Controls */}
        {showControls && !isLoading && (
          <div className="absolute top-4 right-4 flex flex-col space-y-2">
            <button
              onClick={getUserLocation}
              className="bg-white p-2 rounded-lg shadow-md hover:bg-gray-50 transition-colors duration-200"
              title="Get my location"
            >
              <ArrowUpIcon className="w-5 h-5 text-gray-600" />
            </button>
            <button
              className="bg-white p-2 rounded-lg shadow-md hover:bg-gray-50 transition-colors duration-200"
              title="Zoom in"
            >
              <span className="text-gray-600 font-bold">+</span>
            </button>
            <button
              className="bg-white p-2 rounded-lg shadow-md hover:bg-gray-50 transition-colors duration-200"
              title="Zoom out"
            >
              <span className="text-gray-600 font-bold">-</span>
            </button>
          </div>
        )}

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-md p-3">
          <h4 className="text-sm font-semibold text-gray-800 mb-2">Legend</h4>
          <div className="space-y-1">
            {['city', 'attraction', 'hotel', 'restaurant'].map((type) => (
              <div key={type} className="flex items-center space-x-2 text-xs">
                <div className={`w-3 h-3 ${getLocationTypeColor(type)} rounded-full`}></div>
                <span className="text-gray-600 capitalize">{type}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Location Info Panel */}
      {selectedLocation && (
        <div className="mt-4 bg-white rounded-lg shadow-md p-4 border border-gray-200">
          <div className="flex items-start space-x-3">
            <div className={`${getLocationTypeColor(selectedLocation.type)} rounded-full p-2 flex-shrink-0`}>
              <span className="text-white text-sm">{getLocationTypeIcon(selectedLocation.type)}</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{selectedLocation.name}</h3>
              <p className="text-sm text-gray-600 capitalize mb-2">{selectedLocation.type}</p>
              {selectedLocation.description && (
                <p className="text-sm text-gray-700 mb-2">{selectedLocation.description}</p>
              )}
              {selectedLocation.rating && (
                <div className="flex items-center space-x-1">
                  <span className="text-yellow-400">★</span>
                  <span className="text-sm text-gray-600">{selectedLocation.rating}</span>
                </div>
              )}
              <div className="flex space-x-2 mt-3">
                <button className="flex items-center space-x-1 text-sm text-orange-600 hover:text-orange-700">
                  <EyeIcon className="w-4 h-4" />
                  <span>View Details</span>
                </button>
                <button className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700">
                  <ArrowUpIcon className="w-4 h-4" />
                  <span>Get Directions</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractiveMap;
