import { Link } from 'react-router-dom';
import { Place } from '../types';
import { MapPinIcon, StarIcon, ClockIcon, CurrencyRupeeIcon, CalendarIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';

type DestinationCardProps = {
  place: Place;
};

import { Variants } from 'framer-motion';

const cardVariants: Variants = {
  hover: {
    y: -5,
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    transition: {
      duration: 0.3,
      ease: 'easeOut'
    }
  },
  initial: {
    y: 0,
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
  }
};

export default function DestinationCard({ place }: DestinationCardProps) {
  return (
    <motion.div 
      className="bg-white rounded-xl overflow-hidden border border-gray-100"
      initial="initial"
      whileHover="hover"
      variants={cardVariants}
    >
      <Link to={`/destination/${place.id}`} className="block group">
        <div className="relative h-56 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
          <img
            src={place.imageUrl || '/images/placeholder.jpg'}
            alt={place.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
          
          {/* Price Badge */}
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-md">
            <span className="text-sm font-bold text-indigo-700 flex items-center">
              <CurrencyRupeeIcon className="w-4 h-4 mr-1" />
              {place.price?.startingFrom?.toLocaleString('en-IN') || 'On Request'}
            </span>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 z-20 p-4 text-white">
            <h3 className="text-xl font-bold mb-1 drop-shadow-md">{place.name}</h3>
            <div className="flex items-center text-sm mb-3">
              <MapPinIcon className="w-4 h-4 mr-1 text-white/90" />
              <span className="text-white/90">{place.city}, {place.state}</span>
            </div>
            
            <div className="flex items-center space-x-3 text-xs text-white/90 mb-3">
              {place.duration && (
                <span className="flex items-center">
                  <ClockIcon className="w-3.5 h-3.5 mr-1" />
                  {place.duration}
                </span>
              )}
              {place.bestTime && (
                <span className="flex items-center">
                  <CalendarIcon className="w-3.5 h-3.5 mr-1" />
                  {place.bestTime}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="p-5">
          <p className="text-gray-600 text-sm line-clamp-2 mb-4 min-h-[2.5rem]">
            {place.description?.substring(0, 100)}...
          </p>
          
          <div className="flex justify-between items-center pt-3 border-t border-gray-100">
            <div className="flex items-center">
              <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-md">
                <StarIcon className="w-4 h-4 text-yellow-400 mr-1" />
                <span className="text-sm font-semibold text-gray-800">
                  {place.rating?.toFixed(1) || 'N/A'}
                </span>
                <span className="text-xs text-gray-500 ml-1">
                  ({place.reviewCount || 0})
                </span>
              </div>
            </div>
            
            <button className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2">
              View Details →
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
