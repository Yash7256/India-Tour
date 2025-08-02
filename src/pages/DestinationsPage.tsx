import React from 'react';
import { useData } from '../context/DataContext';
import { Link } from 'react-router-dom';

const DestinationsPage: React.FC = () => {
  const { cities } = useData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-yellow-400 to-red-500 mb-10 text-center drop-shadow-lg animate-pulse">
          Explore All Destinations
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {cities.map(city => (
            <Link
              key={city.id}
              to={`/city/${city.id}`}
              className="group bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-2 border-orange-100 hover:border-orange-400"
            >
              <div className="relative h-56">
                <img
                  src={city.featuredImage}
                  alt={city.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 rounded-t-3xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent rounded-t-3xl"></div>
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <span className="bg-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg">{city.state}</span>
                  <span className="bg-white/80 text-orange-600 text-xs font-bold px-3 py-1 rounded-full shadow">{city.attractions?.length || 0} Attractions</span>
                </div>
              </div>
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors duration-300 mb-2 flex items-center">
                  {city.name}
                  <svg className="ml-2 h-5 w-5 text-orange-400 group-hover:scale-125 transition-transform duration-200" fill="currentColor" viewBox="0 0 20 20"><path d="M10 3a1 1 0 011 1v8.586l3.293-3.293a1 1 0 111.414 1.414l-5 5a1 1 0 01-1.414 0l-5-5a1 1 0 111.414-1.414L9 12.586V4a1 1 0 011-1z"/></svg>
                </h2>
                <p className="text-gray-600 text-base mb-3 line-clamp-2">{city.description}</p>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-sm text-gray-500">Best Time: <span className="font-semibold text-orange-500">{city.bestTimeToVisit}</span></span>
                  <Link to={`/city/${city.id}`} className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full font-semibold shadow hover:from-orange-600 hover:to-red-600 transition-all duration-200">
                    Explore
                    <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </Link>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DestinationsPage;
