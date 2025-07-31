import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  UserIcon, 
  HeartIcon, 
  MapIcon, 
  CalendarIcon, 
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

const UserProfile: React.FC = () => {
  const { user, updateProfile, signOut } = useAuth();
  const { cities } = useData();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: user?.full_name || '',
    email: user?.email || ''
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <UserIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please sign in</h2>
          <p className="text-gray-600 mb-6">You need to be signed in to view your profile</p>
          <Link
            to="/"
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-full font-medium hover:from-orange-600 hover:to-red-600 transition-all duration-200"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  const favoriteDestinations = cities.filter(city => 
    user.favoriteDestinations.includes(city.id)
  );

  const handleUpdateProfile = () => {
    updateProfile({
      full_name: editForm.full_name,
      email: editForm.email
    });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
            <img
              src={user.avatar_url || 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=200'}
              alt={user.full_name || 'User'}
              className="w-24 h-24 rounded-full object-cover"
            />
            <div className="flex-1 text-center md:text-left">
              {isEditing ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={editForm.full_name}
                    onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                    className="text-2xl font-bold bg-transparent border-b-2 border-orange-500 focus:outline-none"
                  />
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="block text-gray-600 bg-transparent border-b-2 border-orange-500 focus:outline-none"
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={handleUpdateProfile}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {user.full_name || user.email.split('@')[0]}
                  </h1>
                  <p className="text-gray-600 mb-4">{user.email}</p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors duration-200"
                    >
                      <PencilIcon className="h-4 w-4 mr-2" />
                      Edit Profile
                    </button>
                    <button
                      onClick={signOut}
                      className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
                    >
                      <TrashIcon className="h-4 w-4 mr-2" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{favoriteDestinations.length}</div>
              <div className="text-sm text-gray-600">Favorite Destinations</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Favorite Destinations */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <HeartIcon className="h-6 w-6 text-red-500 mr-2" />
                  Favorite Destinations
                </h2>
              </div>

              {favoriteDestinations.length === 0 ? (
                <div className="text-center py-12">
                  <HeartIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No favorites yet</h3>
                  <p className="text-gray-600 mb-6">Start exploring and add destinations to your favorites</p>
                  <Link
                    to="/"
                    className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-full font-medium hover:from-orange-600 hover:to-red-600 transition-all duration-200"
                  >
                    Explore Destinations
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {favoriteDestinations.map((city) => (
                    <Link
                      key={city.id}
                      to={`/city/${city.id}`}
                      className="group block"
                    >
                      <div className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-200">
                        <img
                          src={city.featuredImage}
                          alt={city.name}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="p-4">
                          <h3 className="font-bold text-gray-900 mb-1">{city.name}</h3>
                          <p className="text-gray-600 text-sm mb-2">{city.state}</p>
                          <p className="text-gray-500 text-sm line-clamp-2">{city.description}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Travel Stats */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <MapIcon className="h-5 w-5 text-blue-500 mr-2" />
                Travel Stats
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Cities Favorited</span>
                  <span className="font-semibold text-orange-600">{favoriteDestinations.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Itineraries Created</span>
                  <span className="font-semibold text-blue-600">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Reviews Written</span>
                  <span className="font-semibold text-green-600">0</span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <CalendarIcon className="h-5 w-5 text-purple-500 mr-2" />
                Recent Activity
              </h3>
              <div className="space-y-4">
                <div className="text-center py-8">
                  <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 text-sm">No recent activity</p>
                  <p className="text-gray-500 text-xs">Start exploring to see your activity here</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  to="/"
                  className="block w-full text-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors duration-200"
                >
                  Explore Destinations
                </Link>
                <button className="block w-full text-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                  Create Itinerary
                </button>
                <button className="block w-full text-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                  View Travel Tips
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;