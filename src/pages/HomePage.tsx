import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPinIcon, CalendarIcon, StarIcon, ArrowRightIcon, PlayIcon } from '@heroicons/react/24/outline';
import { useData } from '../context/DataContext.old';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

const HomePage: React.FC = () => {
  const { cities } = useData();
  const { getActiveNotifications } = useNotifications();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const featuredCities = cities.slice(0, 6);
  const heroImages = [
    {
      url: 'https://images.pexels.com/photos/1583339/pexels-photo-1583339.jpeg?auto=compress&cs=tinysrgb&w=1920',
      title: 'Taj Mahal, Agra',
      description: 'Symbol of eternal love'
    },
    {
      url: 'https://images.pexels.com/photos/2437299/pexels-photo-2437299.jpeg?auto=compress&cs=tinysrgb&w=1920',
      title: 'Kerala Backwaters',
      description: 'Serene waterways of God\'s Own Country'
    },
    {
      url: 'https://images.pexels.com/photos/3581364/pexels-photo-3581364.jpeg?auto=compress&cs=tinysrgb&w=1920',
      title: 'Rajasthan Palaces',
      description: 'Royal heritage and majestic architecture'
    },
    {
      url: 'https://images.pexels.com/photos/789750/pexels-photo-789750.jpeg?auto=compress&cs=tinysrgb&w=1920',
      title: 'Goa Beaches',
      description: 'Golden sands and azure waters'
    }
  ];

  const activeNotifications = getActiveNotifications();
  const highPriorityNotifications = activeNotifications.filter(n => n.priority === 'high');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  // Preload images
  useEffect(() => {
    heroImages.forEach((image) => {
      const img = new Image();
      img.onload = () => {
      };
      img.src = image.url;
    });
  }, []);

  const handleStartJourney = () => {
    if (user) {
      // If logged in, go to destinations with personalized recommendations
      navigate('/destinations?recommended=true');
    } else {
      // If not logged in, go to destinations page
      navigate('/destinations');
    }
  };

  const handleWatchVideo = () => {
    // You can implement a modal or redirect to a video page
    window.open('https://www.youtube.com/watch?v=your-video-id', '_blank');
  };

  const handleImageError = (cityId: string) => {
    console.error(`Failed to load image for city: ${cityId}`);
  };

  return (
    <div className="min-h-screen">
      {/* High Priority Notifications Banner */}
      {highPriorityNotifications.length > 0 && (
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-3 festival-animation relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=&quot;60&quot; height=&quot;60&quot; viewBox=&quot;0 0 60 60&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;%3E%3Cg fill=&quot;none&quot; fill-rule=&quot;evenodd&quot;%3E%3Cg fill=&quot;%23ffffff&quot; fill-opacity=&quot;0.1&quot;%3E%3Ccircle cx=&quot;30&quot; cy=&quot;30&quot; r=&quot;2&quot;/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
          <div className="max-w-7xl mx-auto flex items-center justify-between relative z-10">
            <div className="flex items-center space-x-2">
              <span className="text-lg animate-bounce">🎉</span>
              <span className="font-medium">{highPriorityNotifications[0].title}</span>
              <span className="hidden md:inline">- {highPriorityNotifications[0].message}</span>
            </div>
            {highPriorityNotifications[0].actionUrl && (
              <Link
                to={highPriorityNotifications[0].actionUrl}
                className="bg-white bg-opacity-20 px-4 py-2 rounded-full text-sm font-medium hover:bg-opacity-30 transition-all duration-200 backdrop-blur-sm"
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
              key={image.url}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
              }`}
            >
              <img
                src={image.url}
                alt={image.title}
                className="w-full h-full object-cover"
                onError={() => handleImageError(image.url)}
                loading={index === 0 ? 'eager' : 'lazy'}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/60"></div>
              
              {/* Image Caption */}
              <div className="absolute bottom-20 left-8 text-white opacity-80">
                <h3 className="text-xl font-semibold mb-1">{image.title}</h3>
                <p className="text-sm">{image.description}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="relative z-10 h-full flex items-center justify-center text-center px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 animate-fade-in">
              Discover
              <span className="block gradient-text text-transparent bg-clip-text bg-gradient-to-r from-orange-300 via-yellow-300 to-orange-300 animate-pulse">
                Incredible India
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-2xl mx-auto leading-relaxed">
              Explore diverse cultures, majestic monuments, and unforgettable experiences across the incredible subcontinent
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button 
                onClick={handleStartJourney}
                className="group bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2"
              >
                <span>Start Your Journey</span>
                <ArrowRightIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
              </button>
              <button 
                onClick={handleWatchVideo}
                className="group border-2 border-white text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:text-gray-900 transition-all duration-300 backdrop-blur-sm flex items-center space-x-2"
              >
                <PlayIcon className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                <span>Watch Video</span>
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`relative w-12 h-3 rounded-full transition-all duration-300 overflow-hidden ${
                index === currentSlide ? 'bg-white' : 'bg-white/50'
              }`}
            >
              {index === currentSlide && (
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 rounded-full animate-pulse"></div>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Quick Stats Section */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="group">
              <div className="text-3xl font-bold text-orange-600 mb-2 group-hover:scale-110 transition-transform duration-200">
                {cities.length}+
              </div>
              <div className="text-gray-600 font-medium">Destinations</div>
            </div>
            <div className="group">
              <div className="text-3xl font-bold text-blue-600 mb-2 group-hover:scale-110 transition-transform duration-200">
                500+
              </div>
              <div className="text-gray-600 font-medium">Attractions</div>
            </div>
            <div className="group">
              <div className="text-3xl font-bold text-green-600 mb-2 group-hover:scale-110 transition-transform duration-200">
                50+
              </div>
              <div className="text-gray-600 font-medium">Cultural Sites</div>
            </div>
            <div className="group">
              <div className="text-3xl font-bold text-purple-600 mb-2 group-hover:scale-110 transition-transform duration-200">
                24/7
              </div>
              <div className="text-gray-600 font-medium">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Destinations */}
      <section className="py-20 bg-gray-50 mandala-pattern relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=&quot;100&quot; height=&quot;100&quot; viewBox=&quot;0 0 100 100&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;%3E%3Cg fill=&quot;%23f97316&quot; fill-opacity=&quot;0.03&quot;%3E%3Cpolygon points=&quot;50 0 60 40 100 50 60 60 50 100 40 60 0 50 40 40&quot;/%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Featured Destinations
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover the most popular destinations that showcase India's incredible diversity and rich heritage
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCities.map((city, index) => (
              <Link
                key={city.id}
                to={`/city/${city.id}`}
                className="group card-hover-effect bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative overflow-hidden">
                  <img
                    src={city.featuredImage}
                    alt={city.name}
                    className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={() => handleImageError(city.id)}
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                  <div className="absolute bottom-4 left-4 right-4 text-white transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-lg">{city.attractions?.length || 0} Attractions</p>
                        <p className="text-sm opacity-90">{city.bestTimeToVisit}</p>
                      </div>
                      <ArrowRightIcon className="h-6 w-6 transform group-hover:translate-x-1 transition-transform duration-200" />
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors duration-200">
                      {city.name}
                    </h3>
                    <div className="flex items-center text-yellow-500">
                      <StarIcon className="h-5 w-5 fill-current" />
                      <span className="text-sm text-gray-600 ml-1">4.5</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-gray-600 mb-3">
                    <MapPinIcon className="h-4 w-4 mr-1" />
                    <span className="text-sm">{city.state}</span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                    {city.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      <span>{city.bestTimeToVisit}</span>
                    </div>
                    <span className="text-orange-600 font-semibold group-hover:text-orange-700 transition-colors duration-200 flex items-center">
                      Explore 
                      <ArrowRightIcon className="ml-1 h-4 w-4 transform group-hover:translate-x-1 transition-transform duration-200" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/destinations"
              className="inline-flex items-center px-8 py-3 border-2 border-orange-500 text-orange-600 font-semibold rounded-full hover:bg-orange-500 hover:text-white transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
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
            {[
              {
                icon: '🗺️',
                title: 'Comprehensive Guides',
                description: 'Detailed information about attractions, local culture, transportation, and hidden gems in every destination.',
                gradient: 'from-orange-500 to-red-500'
              },
              {
                icon: '🔔',
                title: 'Smart Notifications',
                description: 'Get real-time updates about festivals, weather conditions, and seasonal attractions based on your location.',
                gradient: 'from-blue-500 to-purple-500'
              },
              {
                icon: '❤️',
                title: 'Personalized Experience',
                description: 'Create custom itineraries, save favorite destinations, and get recommendations tailored to your interests.',
                gradient: 'from-green-500 to-teal-500'
              }
            ].map((feature, index) => (
              <div key={index} className="group text-center p-6 rounded-2xl hover:shadow-lg transition-all duration-300 hover:bg-gray-50">
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <span className="text-2xl">{feature.icon}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-orange-600 transition-colors duration-200">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cultural Highlights */}
      <section className="py-20 bg-gradient-to-br from-orange-50 to-red-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=&quot;120&quot; height=&quot;120&quot; viewBox=&quot;0 0 120 120&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;%3E%3Cg fill=&quot;%23f97316&quot; fill-opacity=&quot;0.05&quot;%3E%3Cpath d=&quot;M60 15c-24.3 0-45 20.7-45 45s20.7 45 45 45 45-20.7 45-45-20.7-45-45-45zm0 75c-16.5 0-30-13.5-30-30s13.5-30 30-30 30 13.5 30 30-13.5 30-30 30z&quot;/%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
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
              {[
                {
                  icon: '🎭',
                  title: 'Festivals & Celebrations',
                  description: 'Experience vibrant festivals like Diwali, Holi, and regional celebrations that showcase India\'s cultural diversity.',
                  bgColor: 'bg-orange-100'
                },
                {
                  icon: '🍛',
                  title: 'Culinary Adventures',
                  description: 'Discover regional cuisines, street food, and traditional recipes that have been passed down through generations.',
                  bgColor: 'bg-blue-100'
                },
                {
                  icon: '🏛️',
                  title: 'Architectural Marvels',
                  description: 'Explore ancient temples, majestic palaces, and modern monuments that tell the story of India\'s rich history.',
                  bgColor: 'bg-green-100'
                }
              ].map((item, index) => (
                <div key={index} className="group flex items-start space-x-4 hover:bg-white/50 p-4 rounded-xl transition-all duration-300">
                  <div className={`w-12 h-12 ${item.bgColor} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                    <span className="text-2xl">{item.icon}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors duration-200">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="relative group">
              <img
                src="https://images.pexels.com/photos/3614513/pexels-photo-3614513.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Indian cultural celebration"
                className="rounded-2xl shadow-2xl group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent rounded-2xl group-hover:from-black/20 transition-all duration-300"></div>
              <div className="absolute bottom-6 left-6 text-white">
                <h4 className="text-lg font-semibold mb-1">Cultural Heritage</h4>
                <p className="text-sm opacity-90">Celebrating diversity and tradition</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <main>
        {/* ...existing code... */}
      </main>
    </div>
  );
};

export default HomePage;