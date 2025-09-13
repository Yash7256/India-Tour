import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  MagnifyingGlassIcon, 
  BellIcon, 
  Bars3Icon, 
  XMarkIcon,
  HomeIcon,
  MapPinIcon,
  CameraIcon,
  InformationCircleIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useData } from '../context/DataContext';
import AuthModal from './AuthModal';
import NotificationPanel from './NotificationPanel';
import ProfileEditModal from './ProfileEditModal';

const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const { getUnreadCount } = useNotifications();
  const { searchCities } = useData();
  const navigate = useNavigate();
  const location = useLocation();
  const headerRef = useRef<HTMLElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [isProfileEditModalOpen, setIsProfileEditModalOpen] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const unreadCount = getUnreadCount();

  // ChaiCode-inspired navigation items with icons
  const allNavigationItems = [
    { 
      name: 'Home', 
      href: '/', 
      current: location.pathname === '/',
      icon: HomeIcon
    },
    { 
      name: 'Destinations', 
      href: '/destinations', 
      current: location.pathname === '/destinations',
      icon: MapPinIcon
    },
    { 
      name: 'Digital ID', 
      href: '/digital-id', 
      current: location.pathname === '/digital-id',
      icon: () => (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    },
    { 
      name: 'Gallery', 
      href: '/gallery', 
      current: location.pathname === '/gallery',
      icon: CameraIcon
    },
    { 
      name: 'About', 
      href: '/about', 
      current: location.pathname === '/about',
      icon: InformationCircleIcon
    },
    { 
      name: 'Contact', 
      href: '/contact', 
      current: location.pathname === '/contact',
      icon: PhoneIcon
    }
  ];

  const navigationItems = allNavigationItems;

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length > 2) {
      try {
        const results = await searchCities(query);
        setSearchResults(results);
      } catch (error) {
        console.error('Error searching cities:', error);
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleCitySelect = (cityId: string) => {
    navigate(`/city/${cityId}`);
    setSearchQuery('');
    setSearchResults([]);
    setIsSearchFocused(false);
  };

  // Close mobile menu when location changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  // Add scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
      if (headerRef.current && !headerRef.current.querySelector('.user-menu')?.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setShowUserDropdown(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <>
      <header 
        ref={headerRef}
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled 
            ? 'bg-white/95 backdrop-blur-md shadow-lg' 
            : 'bg-white shadow-sm'
        }`}
      >
        <div className="max-w-7xl mx-auto pl-2 pr-4 sm:pl-2 sm:pr-6 lg:pl-2 lg:pr-8">
          <div className="flex justify-start items-center h-16">
            
            {/* Logo and Brand - Maximum Left Aligned */}
            <div className="flex items-center mr-auto">
              <Link to="/" className="flex items-center space-x-3 hover:opacity-90 transition-opacity group">
                <div className="relative">
                  <img 
                    src="/images/logo.png" 
                    alt="India Tour Logo" 
                    className="h-20 w-20 group-hover:scale-105 transition-transform duration-200"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg hidden items-center justify-center">
                    <span className="text-white font-bold text-lg">IT</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-3xl font-bold text-gray-900 tracking-tight">INDIA</span>
                  <span className="text-3xl font-bold text-orange-600 tracking-tight">TOUR</span>
                </div>
              </Link>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              {/* Desktop Navigation - ChaiCode Style Pills */}
              <nav className="hidden xl:flex items-center space-x-2">
                {navigationItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-gray-50 ${
                        item.current 
                          ? 'text-orange-600 bg-orange-50' 
                          : 'text-gray-700 hover:text-orange-600'
                      }`}
                    >
                      <IconComponent className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Notifications */}
              <button
                onClick={() => setIsNotificationPanelOpen(true)}
                className="relative p-2 text-gray-600 hover:text-orange-600 hover:bg-gray-50 rounded-lg transition-all duration-200"
              >
                <BellIcon className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Admin Panel Link - Only show if user is admin */}
              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  className="px-4 py-2 text-sm font-medium text-purple-600 hover:bg-purple-50 rounded-lg transition-colors duration-200 flex items-center space-x-2"
                >
                  <span className="w-5 h-5 bg-purple-600 rounded text-white text-xs flex items-center justify-center">A</span>
                  <span>Admin</span>
                </Link>
              )}

              {/* Mobile/Tablet menu button - ChaiCode Style */}
              <button
                onClick={toggleMobileMenu}
                className="xl:hidden p-2 text-gray-600 hover:text-orange-600 hover:bg-gray-50 rounded-lg transition-all duration-200"
              >
                {mobileMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {isSearchFocused && (
          <div className="lg:hidden border-t border-gray-200 bg-white px-4 py-3">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search destinations..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-sm"
                autoFocus
              />
            </div>
            
            {/* Mobile Search Results */}
            {searchResults.length > 0 && (
              <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
                {searchResults.map((city) => (
                  <button
                    key={city.id}
                    onClick={() => handleCitySelect(city.id)}
                    className="w-full text-left px-3 py-3 hover:bg-gray-50 rounded-xl flex items-center space-x-3 transition-colors duration-150"
                  >
                    <img
                      src={city.featuredImage}
                      alt={city.name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                    <div>
                      <h4 className="font-medium text-gray-900">{city.name}</h4>
                      <p className="text-sm text-gray-600">{city.state}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </header>

      {/* ChaiCode-Style Slide-out Navigation Menu */}
      {mobileMenuOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 xl:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Slide-out Menu */}
          <div 
            ref={mobileMenuRef}
            className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out xl:hidden ${
              mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            {/* Menu Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img 
                    src="/images/logo.png" 
                    alt="India Tour Logo" 
                    className="h-16 w-16"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg hidden items-center justify-center">
                    <span className="text-white font-bold">IT</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-xl font-bold text-gray-900">INDIA</span>
                  <span className="text-xl font-bold text-orange-600">TOUR</span>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors duration-200"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Navigation Items */}
            <div className="px-6 py-4">
              <nav className="space-y-2">
                {navigationItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                        item.current 
                          ? 'text-orange-600 bg-orange-50' 
                          : 'text-gray-700 hover:text-orange-600 hover:bg-gray-50'
                      }`}
                    >
                      <IconComponent className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
              {user && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex items-center space-x-3 px-4 py-3">
                    <img
                      src={user.avatar_url || 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=100'}
                      alt={user.full_name || 'User'}
                      className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{user.full_name || 'User'}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-1">
                    <button
                      onClick={() => {
                        setIsProfileEditModalOpen(true);
                        setMobileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Edit Profile
                    </button>
                    <Link
                      to="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                    >
                      My Wishlist
                    </Link>
                    <Link
                      to="/digital-id"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200 flex items-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      My Digital ID
                    </Link>
                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors duration-200"
                      >
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 mt-2"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Notification Panel */}
      <NotificationPanel
        isOpen={isNotificationPanelOpen}
        onClose={() => setIsNotificationPanelOpen(false)}
      />

      {/* Profile Edit Modal */}
      <ProfileEditModal
        isOpen={isProfileEditModalOpen}
        onClose={() => setIsProfileEditModalOpen(false)}
      />

      {/* Overlay for dropdowns */}
      {showUserDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserDropdown(false)}
        />
      )}
    </>
  );
};

export default Header;