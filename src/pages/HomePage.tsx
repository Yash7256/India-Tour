import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPinIcon, CalendarIcon, StarIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { useData } from '../context/DataContext';
import { useNotifications } from '../context/NotificationContext';
import Chatbot from '../components/Chatbot';

const HomePage: React.FC = () => {
  const { states, fetchStates } = useData();
  const { getActiveNotifications } = useNotifications();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [featuredStates, setFeaturedStates] = useState<any[]>([]);
  
  // Fetch states on component mount
  useEffect(() => {
    const loadStates = async () => {
      try {
        await fetchStates();
        // Get first 6 states for featured section
        const featured = states.slice(0, 6);
        setFeaturedStates(featured);
      } catch (error) {
        console.error('Error loading states:', error);
      }
    };
    
    loadStates();
  }, [fetchStates]);
  const heroImages = [
    'https://images.pexels.com/photos/1583339/pexels-photo-1583339.jpeg?auto=compress&cs=tinysrgb&w=1920',
    'https://images.pexels.com/photos/2437299/pexels-photo-2437299.jpeg?auto=compress&cs=tinysrgb&w=1920',
    'https://images.pexels.com/photos/3581364/pexels-photo-3581364.jpeg?auto=compress&cs=tinysrgb&w=1920',
    'https://images.pexels.com/photos/789750/pexels-photo-789750.jpeg?auto=compress&cs=tinysrgb&w=1920'
  ];

  const activeNotifications = getActiveNotifications();
  const highPriorityNotifications = activeNotifications.filter(n => n.priority === 'high');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  return (
    <div className="min-h-screen">
      {/* Chatbot Component & Toggle Button */}
      <div className="fixed bottom-8 right-8 z-50">
        {isChatbotOpen && <Chatbot />}
        <button
          onClick={() => setIsChatbotOpen(!isChatbotOpen)}
          className="bg-orange-600 text-white p-4 rounded-full shadow-lg hover:bg-orange-700 transition-transform transform hover:scale-110"
          aria-label="Toggle Chatbot"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      </div>

      {/* High Priority Notifications Banner */}
      {highPriorityNotifications.length > 0 && (
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-3 festival-animation">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg">🎉</span>
              <span className="font-medium">{highPriorityNotifications[0].title}</span>
              <span className="hidden md:inline">- {highPriorityNotifications[0].message}</span>
            </div>
            {highPriorityNotifications[0].actionUrl && (
              <Link
                to={highPriorityNotifications[0].actionUrl}
                className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm font-medium hover:bg-opacity-30 transition-all duration-200"
              >
                Explore
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative h-screen overflow-hidden">
        <div className="absolute inset-0">
          {heroImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img
                src={image}
                alt={`India destination ${index + 1}`}
                className="w-full h-full object-cover parallax-hero"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            </div>
          ))}
        </div>
        
        <div className="relative z-10 h-full flex items-center justify-center text-center px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 animate-fade-in">
              Discover
              <span className="block gradient-text text-transparent bg-clip-text bg-gradient-to-r from-orange-300 to-yellow-300">
                Incredible India
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-2xl mx-auto">
              Explore diverse cultures, majestic monuments, and unforgettable experiences across the incredible subcontinent
            </p>
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'bg-white' : 'bg-white bg-opacity-50'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Featured Destinations */}
      <section className="py-20 bg-gray-50 mandala-pattern">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Featured Destinations
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover the most popular destinations that showcase India's incredible diversity and rich heritage
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredStates.map((state, index) => (
              <Link
                key={state.id}
                to={`/destinations/${state.name.toLowerCase().replace(/\s+/g, '-')}`}
                className="group card-hover-effect"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="bg-white rounded-2xl overflow-hidden shadow-lg h-full flex flex-col">
                  <div className="relative overflow-hidden flex-shrink-0" style={{ height: '200px' }}>
                    <img
                      src={state.image_url || `https://source.unsplash.com/random/800x600/?${state.name},india`}
                      alt={state.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://source.unsplash.com/random/800x600/?india';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">State of India</p>
                        </div>
                        <ArrowRightIcon className="h-5 w-5" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{state.name}</h3>
                      <div className="flex items-center text-yellow-500">
                        <StarIcon className="h-5 w-5 fill-current" />
                        <span className="text-sm text-gray-600 ml-1">4.5</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-gray-600 mb-3">
                      <MapPinIcon className="h-4 w-4 mr-1 flex-shrink-0" />
                      <span className="text-sm truncate">
                        {state.region || 'India'}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-grow">
                      {state.description || `Explore the beautiful state of ${state.name} with its rich cultural heritage and stunning attractions.`}
                    </p>
                    
                    <div className="flex items-center justify-between mt-auto pt-2">
                      <div className="flex items-center text-sm text-gray-500">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        <span>Year-round</span>
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

          <div className="text-center mt-12">
            <Link
              to="/destinations"
              className="inline-flex items-center px-8 py-3 border-2 border-orange-500 text-orange-600 font-semibold rounded-full hover:bg-orange-500 hover:text-white transition-all duration-300 transform hover:scale-105"
            >
              View All Destinations
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose India Tour */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose India Tour?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We make exploring India effortless with comprehensive guides, real-time updates, and personalized recommendations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-2xl hover:shadow-lg transition-shadow duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🗺️</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Comprehensive Guides</h3>
              <p className="text-gray-600">
                Detailed information about attractions, local culture, transportation, and hidden gems in every destination.
              </p>
            </div>

            <div className="text-center p-6 rounded-2xl hover:shadow-lg transition-shadow duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🔔</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Smart Notifications</h3>
              <p className="text-gray-600">
                Get real-time updates about festivals, weather conditions, and seasonal attractions based on your location.
              </p>
            </div>

            <div className="text-center p-6 rounded-2xl hover:shadow-lg transition-shadow duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">❤️</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Personalized Experience</h3>
              <p className="text-gray-600">
                Create custom itineraries, save favorite destinations, and get recommendations tailored to your interests.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Cultural Highlights */}
      <section className="py-20 bg-gradient-to-br from-orange-50 to-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Experience India's Rich Culture
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Immerse yourself in festivals, traditions, cuisine, and arts that make India truly incredible
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🎭</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Festivals & Celebrations</h3>
                  <p className="text-gray-600">
                    Experience vibrant festivals like Diwali, Holi, and regional celebrations that showcase India's cultural diversity.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🍛</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Culinary Adventures</h3>
                  <p className="text-gray-600">
                    Discover regional cuisines, street food, and traditional recipes that have been passed down through generations.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🏛️</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Architectural Marvels</h3>
                  <p className="text-gray-600">
                    Explore ancient temples, majestic palaces, and modern monuments that tell the story of India's rich history.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <img
                src="https://images.pexels.com/photos/3614513/pexels-photo-3614513.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Indian cultural celebration"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-30 rounded-2xl"></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;