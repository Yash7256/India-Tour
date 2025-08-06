import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  HeartIcon, 
  MapPinIcon, 
  StarIcon,
  ShareIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import OptimizedImage from '../components/OptimizedImage';
import Breadcrumb from '../components/Breadcrumb';
import SEOHead from '../components/SEOHead';
import { useToast } from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';

const FavoritesPage: React.FC = () => {
  const { user, removeFromFavorites } = useAuth();
  const { getPlaceById } = useData();
  const { success, error } = useToast();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'dateAdded' | 'rating'>('dateAdded');
  const [favoritePlaces, setFavoritePlaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Load favorite places
  useEffect(() => {
    const loadFavoritePlaces = async () => {
      if (user?.favoriteDestinations && user.favoriteDestinations.length > 0) {
        setLoading(true);
        try {
          const favoritePlacesData = [];
          for (const placeId of user.favoriteDestinations) {
            const placeData = await getPlaceById(placeId);
            if (placeData) {
              favoritePlacesData.push(placeData.place);
            }
          }
          setFavoritePlaces(favoritePlacesData);
        } catch (err) {
          console.error('Error loading favorite places:', err);
          error('Failed to load favorite destinations');
        } finally {
          setLoading(false);
        }
      } else {
        setFavoritePlaces([]);
        setLoading(false);
      }
    };
    
    loadFavoritePlaces();
  }, [user, getPlaceById]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <HeartIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in to view favorites</h2>
          <p className="text-gray-600 mb-6">Create an account to save your favorite destinations</p>
          <Link
            to="/login"
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  // Use the loaded favorite places

  const handleRemoveFavorite = (cityId: string, cityName: string) => {
    removeFromFavorites(cityId);
    success('Removed from favorites', `${cityName} has been removed from your favorites`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead
        title="My Favorites - Saved Destinations"
        description="View and manage your favorite Indian destinations and attractions."
        url="/favorites"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6" />

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Favorites</h1>
            <p className="text-gray-600">
              {favoritePlaces.length} saved destination{favoritePlaces.length !== 1 ? 's' : ''}
            </p>
          </div>

          {favoritePlaces.length > 0 && (
            <div className="flex items-center space-x-4 mt-4 sm:mt-0">
              {/* Sort Options */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="dateAdded">Recently Added</option>
                <option value="name">Name A-Z</option>
                <option value="rating">Rating</option>
              </select>

              {/* View Mode Toggle */}
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 text-sm ${
                    viewMode === 'grid'
                      ? 'bg-orange-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 text-sm ${
                    viewMode === 'list'
                      ? 'bg-orange-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  List
                </button>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner />
          </div>
        ) : favoritePlaces.length === 0 ? (
          <div className="text-center py-12">
            <HeartIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No favorite destinations yet</h3>
            <p className="text-gray-500 mb-6">Start exploring and add places to your favorites</p>
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              Explore Destinations
            </Link>
          </div>
        ) : (
          <>
            {/* Filters and Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">
                  {favoritePlaces.length} {favoritePlaces.length === 1 ? 'destination' : 'destinations'}
                </span>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-orange-100 text-orange-600' : 'text-gray-400 hover:text-gray-500'}`}
                    title="Grid view"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-orange-100 text-orange-600' : 'text-gray-400 hover:text-gray-500'}`}
                    title="List view"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm rounded-md"
                >
                  <option value="name">Sort by Name</option>
                  <option value="dateAdded">Sort by Date Added</option>
                  <option value="rating">Sort by Rating</option>
                </select>
              </div>
            </div>
            
            {/* Destinations Grid/List */}
            <div className={
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-6'
            }>
              {favoritePlaces.map((place) => (
                <div
                  key={place.id}
                  className={`bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 ${
                    viewMode === 'list' ? 'flex' : ''
                  }`}
                >
                  <div className={viewMode === 'list' ? 'w-64 flex-shrink-0' : 'relative'}>
                    <OptimizedImage
                      src={place.image_url}
                      alt={place.name}
                      className={`object-cover ${
                        viewMode === 'list' ? 'w-full h-48' : 'w-full h-48'
                      }`}
                    />
                    <button
                      onClick={() => handleRemoveFavorite(place.id, place.name)}
                      className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors duration-200"
                      aria-label="Remove from favorites"
                    >
                      <HeartSolidIcon className="w-5 h-5 text-red-500" />
                    </button>
                  </div>
                  
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{place.name}</h3>
                      <div className="flex items-center space-x-1">
                        <StarIcon className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm text-gray-600">{place.rating}</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{place.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        {place.state}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {place.category}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <MapPinIcon className="w-4 h-4 mr-1" />
                      <span>{place.location}</span>
                    </div>
                    
                    <div className="mt-auto flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-500">Starting from</p>
                        <p className="text-lg font-bold text-orange-500">₹{place.entry_fee}</p>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleRemoveFavorite(place.id, place.name)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors duration-200"
                          aria-label="Remove from favorites"
                        >
                          <HeartSolidIcon className="w-5 h-5" />
                        </button>
                        <button 
                          className="p-2 text-gray-400 hover:text-orange-500 transition-colors duration-200"
                          aria-label="Share"
                        >
                          <ShareIcon className="w-5 h-5" />
                        </button>
                        <button 
                          className="p-2 text-gray-400 hover:text-orange-500 transition-colors duration-200"
                          aria-label="View details"
                        >
                          <EyeIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}  {/* Quick Actions */}
        {favoritePlaces.length > 0 && (
          <div className="mt-12 text-center">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Plan Your Trip</h3>
              <p className="text-gray-600 mb-6">
                Ready to turn your favorites into an unforgettable journey?
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/planner"
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                >
                  Create Itinerary
                </Link>
                <Link
                  to="/search"
                  className="border border-orange-500 text-orange-500 hover:bg-orange-50 px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                >
                  Find More Destinations
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
