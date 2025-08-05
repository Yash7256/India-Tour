import React from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPinIcon, 
  PhoneIcon, 
  EnvelopeIcon,
  GlobeAltIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import {
  FacebookIcon,
  TwitterIcon,
  InstagramIcon,
  YouTubeIcon,
  LinkedInIcon
} from './SocialIcons';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'Home', path: '/' },
    { name: 'Destinations', path: '/destinations' },
    { name: 'Search', path: '/search' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' }
  ];

  const popularDestinations = [
    { name: 'Delhi', path: '/city/delhi' },
    { name: 'Mumbai', path: '/city/mumbai' },
    { name: 'Jaipur', path: '/city/jaipur' },
    { name: 'Kerala', path: '/city/kerala' },
    { name: 'Goa', path: '/city/goa' },
    { name: 'Agra', path: '/city/agra' }
  ];

  const resources = [
    { name: 'Travel Guide', path: '/guide' },
    { name: 'Trip Planner', path: '/planner' },
    { name: 'Weather', path: '/weather' },
    { name: 'Currency Converter', path: '/currency' },
    { name: 'Travel Tips', path: '/tips' },
    { name: 'FAQ', path: '/faq' }
  ];

  const support = [
    { name: 'Help Center', path: '/help' },
    { name: 'Customer Support', path: '/support' },
    { name: 'Booking Assistance', path: '/booking-help' },
    { name: 'Refund Policy', path: '/refund' },
    { name: 'Terms of Service', path: '/terms' },
    { name: 'Privacy Policy', path: '/privacy' }
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <GlobeAltIcon className="h-8 w-8 text-orange-500" />
              <span className="text-2xl font-bold">India Tour</span>
            </div>
            <p className="text-gray-300 mb-6 text-sm leading-relaxed">
              Discover the incredible diversity of India with our comprehensive travel guide. 
              From ancient monuments to vibrant cultures, plan your perfect Indian adventure.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-sm">
                <MapPinIcon className="h-4 w-4 text-orange-500 flex-shrink-0" />
                <span className="text-gray-300">New Delhi, India</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <PhoneIcon className="h-4 w-4 text-orange-500 flex-shrink-0" />
                <span className="text-gray-300">+91 11 1234 5678</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <EnvelopeIcon className="h-4 w-4 text-orange-500 flex-shrink-0" />
                <span className="text-gray-300">info@indiatour.com</span>
              </div>
            </div>

            {/* Social Media */}
            <div className="mt-6">
              <h4 className="text-sm font-semibold mb-3">Follow Us</h4>
              <div className="flex space-x-3">
                <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors duration-200">
                  <FacebookIcon className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors duration-200">
                  <TwitterIcon className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors duration-200">
                  <InstagramIcon className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors duration-200">
                  <YouTubeIcon className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors duration-200">
                  <LinkedInIcon className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-gray-300 hover:text-orange-500 transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular Destinations */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Popular Destinations</h3>
            <ul className="space-y-2">
              {popularDestinations.map((destination) => (
                <li key={destination.path}>
                  <Link
                    to={destination.path}
                    className="text-gray-300 hover:text-orange-500 transition-colors duration-200 text-sm"
                  >
                    {destination.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources & Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 mb-6">
              {resources.slice(0, 3).map((resource) => (
                <li key={resource.path}>
                  <Link
                    to={resource.path}
                    className="text-gray-300 hover:text-orange-500 transition-colors duration-200 text-sm"
                  >
                    {resource.name}
                  </Link>
                </li>
              ))}
            </ul>

            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              {support.slice(0, 3).map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className="text-gray-300 hover:text-orange-500 transition-colors duration-200 text-sm"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="max-w-md mx-auto text-center">
            <h3 className="text-lg font-semibold mb-2">Stay Updated</h3>
            <p className="text-gray-300 text-sm mb-4">
              Get the latest travel tips, destination guides, and exclusive offers.
            </p>
            <div className="flex space-x-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <button className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors duration-200">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-gray-950 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <div className="text-gray-400 text-sm">
              © {currentYear} India Tour. All rights reserved.
            </div>
            <div className="flex items-center space-x-1 text-gray-400 text-sm">
              <span>Made with</span>
              <HeartIcon className="h-4 w-4 text-red-500" />
              <span>in India</span>
            </div>
            <div className="flex space-x-6 text-sm">
              <Link to="/privacy" className="text-gray-400 hover:text-orange-500 transition-colors duration-200">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-orange-500 transition-colors duration-200">
                Terms of Service
              </Link>
              <Link to="/cookies" className="text-gray-400 hover:text-orange-500 transition-colors duration-200">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
