import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  HeartIcon, 
  MapPinIcon, 
  StarIcon,
  ShareIcon,
  TrashIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext.old';
import OptimizedImage from '../components/OptimizedImage';
import Breadcrumb from '../components/Breadcrumb';
import SEOHead from '../components/SEOHead';
import { useToast } from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';

const FavoritesPage: React.FC = () => {
  const { user, removeFromFavorites, loading } = useAuth();
  const { getCityById } = useData();
  const { success, error } = useToast();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'dateAdded' | 'rating'>('dateAdded');

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

  const favoriteDestinations = user.favoriteDestinations
    .map(id => getCityById(id))
    .filter(city => city !== null);

  const handleRemoveFavorite = (cityId: string, cityName: string) => {
    removeFromFavorites(cityId);
    success('Removed from favorites', `${cityName} has been removed from your favorites`);
  };

  const handleShare = async (city: any) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${city.name} - India Tour`,
          text: `Check out ${city.name}: ${city.description}`,
          url: `${window.location.origin}/city/${city.id}`
        });
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(`${window.location.origin}/city/${city.id}`);
        success('Link copied', 'Destination link copied to clipboard');
      }
    } catch (err) {
      error('Share failed', 'Unable to share destination');
    }
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
              {favoriteDestinations.length} saved destination{favoriteDestinations.length !== 1 ? 's' : ''}
            </p>
          </div>

          {favoriteDestinations.length > 0 && (
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

        {/* Empty State */}
        {favoriteDestinations.length === 0 ? (
          <div className="text-center py-16">
            <HeartIcon className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No favorites yet</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Start exploring destinations and save your favorites to plan your perfect trip to India.
            </p>
            <Link
              to="/"
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 inline-flex items-center space-x-2"
            >
              <EyeIcon className="h-5 w-5" />
              <span>Explore Destinations</span>
            </Link>
          </div>
        ) : (
          /* Favorites Grid/List */
          <div className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-6'
          }>
            {favoriteDestinations.map((city) => (
              <div
                key={city.id}
                className={`bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 ${
                  viewMode === 'list' ? 'flex' : ''
                }`}
              >
                <div className={viewMode === 'list' ? 'w-64 flex-shrink-0' : 'relative'}>
                  <OptimizedImage
                    src={city.featuredImage}
                    alt={city.name}
                    className={`object-cover ${
                      viewMode === 'list' ? 'w-full h-48' : 'w-full h-48'
                    }`}
                  />
                  
                  {/* Favorite Button */}
                  <button
                    onClick={() => handleRemoveFavorite(city.id, city.name)}
                    className="absolute top-3 right-3 p-2 bg-white bg-opacity-90 backdrop-blur-sm rounded-full hover:bg-opacity-100 transition-all duration-200 group"
                    title="Remove from favorites"
                  >
                    <HeartSolidIcon className="h-5 w-5 text-red-500 group-hover:scale-110 transition-transform duration-200" />
                  </button>
                </div>

                <div className={`p-6 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{city.name}</h3>
                      <div className="flex items-center text-gray-600 text-sm">
                        <MapPinIcon className="h-4 w-4 mr-1" />
                        <span>{city.state}</span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <StarIcon className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm text-gray-600 ml-1">4.8</span>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {city.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      {city.attractions.length} attractions
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleShare(city)}
                        className="p-2 text-gray-400 hover:text-orange-500 transition-colors duration-200"
                        title="Share destination"
                      >
                        <ShareIcon className="h-4 w-4" />
                      </button>
                      
                      <Link
                        to={`/city/${city.id}`}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                      >
                        Explore
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        {favoriteDestinations.length > 0 && (
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
