import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaMapMarkerAlt, 
  FaPhone, FaEnvelope, FaTripadvisor, FaPinterest, FaLinkedin 
} from 'react-icons/fa';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  const quickLinks = [
    { to: '/', text: 'Home' },
    { to: '/destinations', text: 'Destinations' },
    { to: '/tours', text: 'Tours & Packages' },
    { to: '/experiences', text: 'Experiences' },
    { to: '/blog', text: 'Travel Blog' },
    { to: '/about', text: 'About Us' },
    { to: '/contact', text: 'Contact Us' },
    { to: '/faq', text: 'FAQs' },
  ];

  const topDestinations = [
    { to: '/city/1', text: 'Taj Mahal, Agra' },
    { to: '/city/2', text: 'Golden Temple, Amritsar' },
    { to: '/city/3', text: 'Kerala Backwaters' },
    { to: '/city/4', text: 'Goa Beaches' },
    { to: '/city/5', text: 'Rajasthan Forts' },
    { to: '/city/6', text: 'Varanasi Ghats' },
    { to: '/city/7', text: 'Ladakh' },
    { to: '/city/8', text: 'Mysore Palace' },
  ];

  const socialLinks = [
    { icon: <FaFacebook className="h-5 w-5" />, url: '#', label: 'Facebook' },
    { icon: <FaTwitter className="h-5 w-5" />, url: '#', label: 'Twitter' },
    { icon: <FaInstagram className="h-5 w-5" />, url: '#', label: 'Instagram' },
    { icon: <FaYoutube className="h-5 w-5" />, url: '#', label: 'YouTube' },
    { icon: <FaTripadvisor className="h-5 w-5" />, url: '#', label: 'TripAdvisor' },
    { icon: <FaPinterest className="h-5 w-5" />, url: '#', label: 'Pinterest' },
    { icon: <FaLinkedin className="h-5 w-5" />, url: '#', label: 'LinkedIn' },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* About Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <img 
                src="/images/logo.png" 
                alt="India Tour Logo" 
                className="h-12 w-auto"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              <h2 className="text-2xl font-bold text-white">India Tour</h2>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Discover the incredible diversity of India with our curated travel experiences.
            </p>
            <div className="flex space-x-3 pt-2">
              {socialLinks.map((social, index) => (
                <a 
                  key={index}
                  href={social.url} 
                  className="text-gray-300 hover:text-orange-400 transition-colors duration-200"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Follow us on ${social.label}`}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold text-orange-400 mb-4 uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((item, index) => (
                <li key={index}>
                  <Link 
                    to={item.to} 
                    className="text-gray-300 hover:text-orange-400 transition-colors duration-200 text-sm flex items-center group"
                  >
                    <span className="w-1.5 h-1.5 bg-orange-400 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {item.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {/* Top Destinations */}
          <div>
            <h3 className="text-lg font-bold text-orange-400 mb-4 uppercase tracking-wider">Top Destinations</h3>
            <ul className="space-y-3">
              {topDestinations.map((item, index) => (
                <li key={index}>
                  <Link 
                    to={item.to} 
                    className="text-gray-300 hover:text-orange-400 transition-colors duration-200 text-sm flex items-center group"
                  >
                    <span className="w-1.5 h-1.5 bg-orange-400 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {item.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div>
            <h3 className="text-lg font-bold text-orange-400 mb-4 uppercase tracking-wider">Contact & Newsletter</h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <FaMapMarkerAlt className="h-5 w-5 mt-1 text-orange-400 flex-shrink-0" />
                <span className="text-gray-300 text-sm">123 Travel Street, Colaba, Mumbai, Maharashtra 400001, India</span>
              </li>
              <li className="flex items-center space-x-3">
                <FaPhone className="h-5 w-5 text-orange-400 flex-shrink-0" />
                <div className="flex flex-col">
                  <a href="tel:+911234567890" className="text-gray-300 hover:text-orange-400 transition-colors duration-200 text-sm">+91 12345 67890</a>
                </div>
              </li>
              <li className="flex items-center space-x-3">
                <FaEnvelope className="h-5 w-5 text-orange-400 flex-shrink-0" />
                <a href="mailto:info@indiatour.com" className="text-gray-300 hover:text-orange-400 transition-colors duration-200 text-sm">info@indiatour.com</a>
              </li>
              <li className="pt-2">
                <h4 className="text-sm font-medium text-white mb-2">Subscribe to our newsletter</h4>
                <div className="flex">
                  <input 
                    type="email" 
                    placeholder="Your email address" 
                    className="px-3 py-2 text-sm text-gray-900 bg-white border border-r-0 border-gray-300 rounded-l-md focus:ring-orange-500 focus:border-orange-500 w-full"
                  />
                  <button 
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-r-md transition-colors duration-200 text-sm font-medium"
                  >
                    Subscribe
                  </button>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            &copy; {currentYear} India Tour. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/privacy-policy" className="text-gray-400 hover:text-orange-400 transition-colors duration-200 text-sm">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-gray-400 hover:text-orange-400 transition-colors duration-200 text-sm">
              Terms of Service
            </Link>
            <Link to="/sitemap" className="text-gray-400 hover:text-orange-400 transition-colors duration-200 text-sm">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
