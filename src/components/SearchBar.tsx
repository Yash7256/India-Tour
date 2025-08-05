import React, { useState, useRef, useEffect } from 'react';
import { MagnifyingGlassIcon, XMarkIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { MapPinIcon, StarIcon } from '@heroicons/react/24/solid';

interface SearchSuggestion {
  id: string;
  name: string;
  type: 'city' | 'state' | 'attraction';
  state?: string;
  rating?: number;
}

interface SearchBarProps {
  onSearch: (query: string, filters?: SearchFilters) => void;
  suggestions?: SearchSuggestion[];
  placeholder?: string;
  showFilters?: boolean;
  className?: string;
}

interface SearchFilters {
  states?: string[];
  rating?: number;
  type?: string[];
  sortBy?: 'name' | 'rating' | 'popularity';
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  suggestions = [],
  placeholder = "Search destinations, cities, or attractions...",
  showFilters = true,
  className = ''
}) => {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [filteredSuggestions, setFilteredSuggestions] = useState<SearchSuggestion[]>([]);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter suggestions based on query
  useEffect(() => {
    if (query.trim() && suggestions.length > 0) {
      const filtered = suggestions
        .filter(item => 
          item.name.toLowerCase().includes(query.toLowerCase()) ||
          item.state?.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 8);
      setFilteredSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
      setFilteredSuggestions([]);
    }
  }, [query, suggestions]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setShowFilterPanel(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (searchQuery?: string) => {
    const finalQuery = searchQuery || query;
    onSearch(finalQuery, filters);
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.name);
    handleSearch(suggestion.name);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setShowFilterPanel(false);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    if (query) {
      onSearch(query, updatedFilters);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'city':
        return '🏙️';
      case 'state':
        return '🗺️';
      case 'attraction':
        return '🏛️';
      default:
        return '📍';
    }
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Main Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyPress}
          onFocus={() => query && setShowSuggestions(true)}
          placeholder={placeholder}
          className="block w-full pl-10 pr-20 py-3 border border-gray-300 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white shadow-sm"
        />
        
        <div className="absolute inset-y-0 right-0 flex items-center space-x-1 pr-3">
          {query && (
            <button
              onClick={clearSearch}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          )}
          
          {showFilters && (
            <button
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className={`p-1 transition-colors duration-200 ${
                showFilterPanel ? 'text-orange-500' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <FunnelIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Search Suggestions */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {filteredSuggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-150 border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">{getTypeIcon(suggestion.type)}</span>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{suggestion.name}</div>
                  {suggestion.state && (
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <MapPinIcon className="h-3 w-3 mr-1" />
                      {suggestion.state}
                    </div>
                  )}
                </div>
                {suggestion.rating && (
                  <div className="flex items-center text-sm text-yellow-500">
                    <StarIcon className="h-4 w-4 mr-1" />
                    {suggestion.rating}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Filter Panel */}
      {showFilterPanel && (
        <div className="absolute z-40 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Filters</h3>
          
          <div className="space-y-4">
            {/* Rating Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Rating
              </label>
              <select
                value={filters.rating || ''}
                onChange={(e) => updateFilters({ rating: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Any Rating</option>
                <option value="4">4+ Stars</option>
                <option value="4.5">4.5+ Stars</option>
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <div className="space-y-2">
                {['city', 'attraction', 'state'].map((type) => (
                  <label key={type} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.type?.includes(type) || false}
                      onChange={(e) => {
                        const currentTypes = filters.type || [];
                        const newTypes = e.target.checked
                          ? [...currentTypes, type]
                          : currentTypes.filter(t => t !== type);
                        updateFilters({ type: newTypes.length > 0 ? newTypes : undefined });
                      }}
                      className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 capitalize">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={filters.sortBy || 'name'}
                onChange={(e) => updateFilters({ sortBy: e.target.value as any })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="name">Name</option>
                <option value="rating">Rating</option>
                <option value="popularity">Popularity</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-4 pt-3 border-t border-gray-200">
            <button
              onClick={() => {
                setFilters({});
                setShowFilterPanel(false);
                if (query) onSearch(query, {});
              }}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200"
            >
              Clear
            </button>
            <button
              onClick={() => setShowFilterPanel(false)}
              className="px-4 py-1 bg-orange-500 text-white text-sm rounded-md hover:bg-orange-600 transition-colors duration-200"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
