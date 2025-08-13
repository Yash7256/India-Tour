import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface City {
  id: string;
  name: string;
  state: string;
  description: string;
  bestTimeToVisit: string;
  climate: string;
  featuredImage: string;
  images: string[];
  attractions: Attraction[];
  localSpecialties: LocalSpecialty[];
  transportation: Transportation[];
  events: Event[];
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface Attraction {
  id: string;
  name: string;
  category: string;
  description: string;
  history: string;
  images: string[];
  coordinates: {
    lat: number;
    lng: number;
  };
  entryFee: string;
  openingHours: string;
  accessibility: string;
  rating: number;
  reviews: Review[];
}

export interface LocalSpecialty {
  id: string;
  name: string;
  type: 'food' | 'craft' | 'culture';
  description: string;
  image: string;
}

export interface Transportation {
  id: string;
  type: 'bus' | 'train' | 'auto' | 'taxi' | 'metro';
  routes: string[];
  approximateCost: string;
  bookingInfo: string;
}

export interface Event {
  id: string;
  name: string;
  description: string;
  significance: string;
  dateRange: string;
  specialAttractions: string[];
  image: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  images?: string[];
}

interface DataContextType {
  cities: City[];
  getCityById: (id: string) => City | undefined;
  searchCities: (query: string) => City[];
  addReview: (attractionId: string, cityId: string, review: Omit<Review, 'id' | 'date'>) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cities, setCities] = useState<City[]>([]);

  useEffect(() => {
    fetchPlacesFromDatabase();
  }, []);

  const fetchPlacesFromDatabase = async () => {
    try {
      const { data: places, error } = await supabase
        .from('places')
        .select('*')
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching places:', error);
        // Fallback to sample data if database fetch fails
        initializeSampleData();
        return;
      }

      if (places && places.length > 0) {
        // Convert database places to city format
        const convertedCities = convertPlacesToCities(places);
        setCities(convertedCities);
      } else {
        // Initialize with sample data if no places in database
        initializeSampleData();
      }
    } catch (error) {
      console.error('Error in fetchPlacesFromDatabase:', error);
      initializeSampleData();
    }
  };

  const convertPlacesToCities = (places: any[]): City[] => {
    // Group places by location to create cities
    const cityMap = new Map<string, City>();

    places.forEach(place => {
      const cityKey = `${place.location}-${place.state}`;
      
      if (!cityMap.has(cityKey)) {
        cityMap.set(cityKey, {
          id: place.location.toLowerCase().replace(/\s+/g, '-'),
          name: place.location,
          state: place.state || '',
          description: `Explore the beautiful ${place.location} with its rich heritage and attractions.`,
          bestTimeToVisit: place.best_time_to_visit || 'Year round',
          climate: 'Varies by season',
          featuredImage: place.image_url || 'https://images.pexels.com/photos/1583339/pexels-photo-1583339.jpeg?auto=compress&cs=tinysrgb&w=1200',
          images: place.images || [place.image_url],
          coordinates: {
            lat: place.latitude || 0,
            lng: place.longitude || 0
          },
          attractions: [],
          localSpecialties: [],
          transportation: [],
          events: []
        });
      }

      const city = cityMap.get(cityKey)!;
      city.attractions.push({
        id: place.id,
        name: place.name,
        category: place.category || 'Attraction',
        description: place.description || '',
        history: `Learn about the rich history of ${place.name}`,
        images: place.images || [place.image_url],
        coordinates: {
          lat: place.latitude || 0,
          lng: place.longitude || 0
        },
        entryFee: place.entry_fee ? `₹${place.entry_fee}` : 'Free',
        openingHours: '9:00 AM - 6:00 PM',
        accessibility: place.features?.includes('Wheelchair accessible') ? 'Wheelchair accessible' : 'Limited accessibility',
        rating: place.rating || 4.0,
        reviews: []
      });
    });

    return Array.from(cityMap.values());
  };

  const initializeSampleData = () => {
    const sampleCities: City[] = [
      {
        id: 'mumbai',
        name: 'Mumbai',
        state: 'Maharashtra',
        description: 'The financial capital of India, known for Bollywood, street food, and vibrant nightlife.',
        bestTimeToVisit: 'October to February',
        climate: 'Tropical',
        featuredImage: 'https://images.pexels.com/photos/2563674/pexels-photo-2563674.jpeg?auto=compress&cs=tinysrgb&w=1200',
        images: [
          'https://images.pexels.com/photos/2563674/pexels-photo-2563674.jpeg?auto=compress&cs=tinysrgb&w=800',
          'https://images.pexels.com/photos/3597209/pexels-photo-3597209.jpeg?auto=compress&cs=tinysrgb&w=800'
        ],
        coordinates: { lat: 19.0760, lng: 72.8777 },
        attractions: [
          {
            id: 'gateway-of-india',
            name: 'Gateway of India',
            category: 'Historical Monument',
            description: 'An iconic arch monument built during the British colonial period.',
            history: 'Built in 1924 to commemorate the visit of King George V and Queen Mary.',
            images: ['https://images.pexels.com/photos/3125171/pexels-photo-3125171.jpeg?auto=compress&cs=tinysrgb&w=800'],
            coordinates: { lat: 18.9220, lng: 72.8347 },
            entryFee: 'Free',
            openingHours: '24 hours',
            accessibility: 'Wheelchair accessible',
            rating: 4.5,
            reviews: []
          },
          {
            id: 'marine-drive',
            name: 'Marine Drive',
            category: 'Scenic Drive',
            description: 'A 3.6-kilometer-long boulevard along the coast, known as the Queen\'s Necklace.',
            history: 'Built on reclaimed land facing the Arabian Sea in the 1920s.',
            images: ['https://images.pexels.com/photos/1007025/pexels-photo-1007025.jpeg?auto=compress&cs=tinysrgb&w=800'],
            coordinates: { lat: 18.9432, lng: 72.8238 },
            entryFee: 'Free',
            openingHours: '24 hours',
            accessibility: 'Fully accessible',
            rating: 4.7,
            reviews: []
          }
        ],
        localSpecialties: [
          {
            id: 'vada-pav',
            name: 'Vada Pav',
            type: 'food',
            description: 'Mumbai\'s signature street food - spiced potato fritter in a bun.',
            image: 'https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg?auto=compress&cs=tinysrgb&w=400'
          },
          {
            id: 'bollywood',
            name: 'Bollywood',
            type: 'culture',
            description: 'The heart of Indian film industry with studio tours and celebrity spotting.',
            image: 'https://images.pexels.com/photos/3721941/pexels-photo-3721941.jpeg?auto=compress&cs=tinysrgb&w=400'
          }
        ],
        transportation: [
          {
            id: 'mumbai-local',
            type: 'train',
            routes: ['Western Line', 'Central Line', 'Harbour Line'],
            approximateCost: '₹5-15 per journey',
            bookingInfo: 'Buy tickets at station counters or use mobile apps'
          },
          {
            id: 'mumbai-taxi',
            type: 'taxi',
            routes: ['Available city-wide'],
            approximateCost: '₹25-50 per km',
            bookingInfo: 'Ola, Uber, or street taxis available'
          }
        ],
        events: [
          {
            id: 'ganesh-chaturthi',
            name: 'Ganesh Chaturthi',
            description: 'Grand festival celebrating Lord Ganesha with elaborate decorations.',
            significance: 'Most important festival of Mumbai with community celebrations.',
            dateRange: 'August/September (10 days)',
            specialAttractions: ['Lalbaugcha Raja', 'Ganpati Visarjan', 'Street processions'],
            image: 'https://images.pexels.com/photos/3614513/pexels-photo-3614513.jpeg?auto=compress&cs=tinysrgb&w=400'
          }
        ]
      },
      {
        id: 'jaipur',
        name: 'Jaipur',
        state: 'Rajasthan',
        description: 'The Pink City, famous for its majestic palaces, forts, and vibrant bazaars.',
        bestTimeToVisit: 'October to March',
        climate: 'Arid',
        featuredImage: 'https://images.pexels.com/photos/3581364/pexels-photo-3581364.jpeg?auto=compress&cs=tinysrgb&w=1200',
        images: [
          'https://images.pexels.com/photos/3581364/pexels-photo-3581364.jpeg?auto=compress&cs=tinysrgb&w=800',
          'https://images.pexels.com/photos/2404843/pexels-photo-2404843.jpeg?auto=compress&cs=tinysrgb&w=800'
        ],
        coordinates: { lat: 26.9124, lng: 75.7873 },
        attractions: [
          {
            id: 'hawa-mahal',
            name: 'Hawa Mahal',
            category: 'Palace',
            description: 'The iconic Palace of Winds with its distinctive pink sandstone facade.',
            history: 'Built in 1799 by Maharaja Sawai Pratap Singh.',
            images: ['https://images.pexels.com/photos/3881104/pexels-photo-3881104.jpeg?auto=compress&cs=tinysrgb&w=800'],
            coordinates: { lat: 26.9239, lng: 75.8267 },
            entryFee: '₹50 for Indians, ₹200 for foreigners',
            openingHours: '9:00 AM - 4:30 PM',
            accessibility: 'Limited wheelchair access',
            rating: 4.6,
            reviews: []
          },
          {
            id: 'city-palace',
            name: 'City Palace',
            category: 'Palace',
            description: 'A stunning complex of courtyards, gardens, and buildings.',
            history: 'Built over 300 years ago, still home to the royal family.',
            images: ['https://images.pexels.com/photos/3881105/pexels-photo-3881105.jpeg?auto=compress&cs=tinysrgb&w=800'],
            coordinates: { lat: 26.9255, lng: 75.8235 },
            entryFee: '₹300-1500 depending on areas visited',
            openingHours: '9:30 AM - 5:00 PM',
            accessibility: 'Partially accessible',
            rating: 4.8,
            reviews: []
          }
        ],
        localSpecialties: [
          {
            id: 'dal-baati-churma',
            name: 'Dal Baati Churma',
            type: 'food',
            description: 'Traditional Rajasthani dish with lentils, baked wheat balls, and sweet crumble.',
            image: 'https://images.pexels.com/photos/5560724/pexels-photo-5560724.jpeg?auto=compress&cs=tinysrgb&w=400'
          },
          {
            id: 'blue-pottery',
            name: 'Blue Pottery',
            type: 'craft',
            description: 'Traditional Jaipur craft with distinctive blue glaze.',
            image: 'https://images.pexels.com/photos/6476589/pexels-photo-6476589.jpeg?auto=compress&cs=tinysrgb&w=400'
          }
        ],
        transportation: [
          {
            id: 'jaipur-bus',
            type: 'bus',
            routes: ['City buses', 'RSRTC buses'],
            approximateCost: '₹10-30 per journey',
            bookingInfo: 'Buy tickets on board or at bus stations'
          },
          {
            id: 'jaipur-auto',
            type: 'auto',
            routes: ['Available throughout the city'],
            approximateCost: '₹15-25 per km',
            bookingInfo: 'Negotiate fare or use meter'
          }
        ],
        events: [
          {
            id: 'jaipur-literature-festival',
            name: 'Jaipur Literature Festival',
            description: 'World\'s largest free literary festival.',
            significance: 'Brings together authors, poets, and literature lovers from around the world.',
            dateRange: 'January (5 days)',
            specialAttractions: ['Author sessions', 'Book launches', 'Cultural performances'],
            image: 'https://images.pexels.com/photos/159866/books-book-pages-read-literature-159866.jpeg?auto=compress&cs=tinysrgb&w=400'
          }
        ]
      },
      {
        id: 'kerala',
        name: 'Kerala',
        state: 'Kerala',
        description: 'God\'s Own Country, known for backwaters, hill stations, and Ayurvedic treatments.',
        bestTimeToVisit: 'September to March',
        climate: 'Tropical monsoon',
        featuredImage: 'https://images.pexels.com/photos/2437299/pexels-photo-2437299.jpeg?auto=compress&cs=tinysrgb&w=1200',
        images: [
          'https://images.pexels.com/photos/2437299/pexels-photo-2437299.jpeg?auto=compress&cs=tinysrgb&w=800',
          'https://images.pexels.com/photos/962464/pexels-photo-962464.jpeg?auto=compress&cs=tinysrgb&w=800'
        ],
        coordinates: { lat: 10.8505, lng: 76.2711 },
        attractions: [
          {
            id: 'alleppey-backwaters',
            name: 'Alleppey Backwaters',
            category: 'Natural',
            description: 'Serene network of canals, rivers, and lakes with houseboat cruises.',
            history: 'Traditional transportation route now famous for tourism.',
            images: ['https://images.pexels.com/photos/3889868/pexels-photo-3889868.jpeg?auto=compress&cs=tinysrgb&w=800'],
            coordinates: { lat: 9.4981, lng: 76.3388 },
            entryFee: 'Houseboat packages: ₹5000-15000 per day',
            openingHours: '24 hours (houseboats available)',
            accessibility: 'Limited for wheelchairs',
            rating: 4.9,
            reviews: []
          },
          {
            id: 'munnar-hills',
            name: 'Munnar Hill Station',
            category: 'Hill Station',
            description: 'Picturesque tea plantations and cool mountain climate.',
            history: 'Former summer resort of British Raj in South India.',
            images: ['https://images.pexels.com/photos/4321015/pexels-photo-4321015.jpeg?auto=compress&cs=tinysrgb&w=800'],
            coordinates: { lat: 10.0889, lng: 77.0595 },
            entryFee: 'Various attractions: ₹30-100',
            openingHours: 'Varies by attraction',
            accessibility: 'Some areas accessible',
            rating: 4.7,
            reviews: []
          }
        ],
        localSpecialties: [
          {
            id: 'kerala-sadya',
            name: 'Kerala Sadya',
            type: 'food',
            description: 'Traditional vegetarian feast served on banana leaf.',
            image: 'https://images.pexels.com/photos/5560758/pexels-photo-5560758.jpeg?auto=compress&cs=tinysrgb&w=400'
          },
          {
            id: 'ayurveda',
            name: 'Ayurvedic Treatments',
            type: 'culture',
            description: 'Traditional healing system with massages and herbal treatments.',
            image: 'https://images.pexels.com/photos/3992206/pexels-photo-3992206.jpeg?auto=compress&cs=tinysrgb&w=400'
          }
        ],
        transportation: [
          {
            id: 'kerala-bus',
            type: 'bus',
            routes: ['KSRTC state buses', 'Private buses'],
            approximateCost: '₹20-100 per journey',
            bookingInfo: 'Online booking available for long routes'
          },
          {
            id: 'kerala-train',
            type: 'train',
            routes: ['Main railway network connects major cities'],
            approximateCost: '₹50-500 depending on class and distance',
            bookingInfo: 'Book through IRCTC or at stations'
          }
        ],
        events: [
          {
            id: 'onam',
            name: 'Onam Festival',
            description: 'Kerala\'s harvest festival with traditional dance and feast.',
            significance: 'State festival celebrating King Mahabali\'s return.',
            dateRange: 'August/September (10 days)',
            specialAttractions: ['Pookalam (flower carpets)', 'Pulikali (tiger dance)', 'Snake boat races'],
            image: 'https://images.pexels.com/photos/8191464/pexels-photo-8191464.jpeg?auto=compress&cs=tinysrgb&w=400'
          }
        ]
      },
      {
        id: 'goa',
        name: 'Goa',
        state: 'Goa',
        description: 'Beach paradise with Portuguese heritage, vibrant nightlife, and water sports.',
        bestTimeToVisit: 'November to February',
        climate: 'Tropical',
        featuredImage: 'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=1200',
        images: [
          'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=800',
          'https://images.pexels.com/photos/1007025/pexels-photo-1007025.jpeg?auto=compress&cs=tinysrgb&w=800'
        ],
        coordinates: { lat: 15.2993, lng: 74.1240 },
        attractions: [
          {
            id: 'baga-beach',
            name: 'Baga Beach',
            category: 'Beach',
            description: 'Popular beach known for water sports and nightlife.',
            history: 'Named after Baga Creek that flows into the Arabian Sea.',
            images: ['https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=800'],
            coordinates: { lat: 15.5557, lng: 73.7515 },
            entryFee: 'Free (water sports extra)',
            openingHours: '24 hours',
            accessibility: 'Beach wheelchairs available',
            rating: 4.4,
            reviews: []
          },
          {
            id: 'old-goa-churches',
            name: 'Churches of Old Goa',
            category: 'Historical',
            description: 'UNESCO World Heritage churches showcasing Portuguese architecture.',
            history: 'Built during Portuguese colonial period (16th-17th centuries).',
            images: ['https://images.pexels.com/photos/2649403/pexels-photo-2649403.jpeg?auto=compress&cs=tinysrgb&w=800'],
            coordinates: { lat: 15.5007, lng: 73.9122 },
            entryFee: 'Free',
            openingHours: '9:00 AM - 6:30 PM',
            accessibility: 'Most churches accessible',
            rating: 4.6,
            reviews: []
          }
        ],
        localSpecialties: [
          {
            id: 'fish-curry-rice',
            name: 'Fish Curry Rice',
            type: 'food',
            description: 'Goan staple dish with coconut-based curry and fresh seafood.',
            image: 'https://images.pexels.com/photos/5560757/pexels-photo-5560757.jpeg?auto=compress&cs=tinysrgb&w=400'
          },
          {
            id: 'feni',
            name: 'Feni',
            type: 'culture',
            description: 'Traditional Goan alcoholic beverage made from cashew or palm.',
            image: 'https://images.pexels.com/photos/2789328/pexels-photo-2789328.jpeg?auto=compress&cs=tinysrgb&w=400'
          }
        ],
        transportation: [
          {
            id: 'goa-taxi',
            type: 'taxi',
            routes: ['Tourist taxis available statewide'],
            approximateCost: '₹30-50 per km',
            bookingInfo: 'Hotel bookings or taxi stands'
          },
          {
            id: 'goa-bus',
            type: 'bus',
            routes: ['Kadamba Transport buses'],
            approximateCost: '₹15-50 per journey',
            bookingInfo: 'Buy tickets on board'
          }
        ],
        events: [
          {
            id: 'goa-carnival',
            name: 'Goa Carnival',
            description: 'Vibrant festival with parades, music, and dance.',
            significance: 'Portuguese tradition continued with Indian flavor.',
            dateRange: 'February/March (4 days)',
            specialAttractions: ['Colorful parades', 'Street performances', 'Traditional dances'],
            image: 'https://images.pexels.com/photos/3171837/pexels-photo-3171837.jpeg?auto=compress&cs=tinysrgb&w=400'
          }
        ]
      },
      {
        id: 'delhi',
        name: 'Delhi',
        state: 'Delhi',
        description: 'India\'s capital city blending ancient history with modern governance.',
        bestTimeToVisit: 'October to March',
        climate: 'Semi-arid',
        featuredImage: 'https://images.pexels.com/photos/789750/pexels-photo-789750.jpeg?auto=compress&cs=tinysrgb&w=1200',
        images: [
          'https://images.pexels.com/photos/789750/pexels-photo-789750.jpeg?auto=compress&cs=tinysrgb&w=800',
          'https://images.pexels.com/photos/2563674/pexels-photo-2563674.jpeg?auto=compress&cs=tinysrgb&w=800'
        ],
        coordinates: { lat: 28.7041, lng: 77.1025 },
        attractions: [
          {
            id: 'red-fort',
            name: 'Red Fort',
            category: 'Historical Monument',
            description: 'Magnificent Mughal fortress and UNESCO World Heritage Site.',
            history: 'Built by Emperor Shah Jahan in 1648, symbol of Mughal power.',
            images: ['https://images.pexels.com/photos/3881104/pexels-photo-3881104.jpeg?auto=compress&cs=tinysrgb&w=800'],
            coordinates: { lat: 28.6562, lng: 77.2410 },
            entryFee: '₹35 for Indians, ₹500 for foreigners',
            openingHours: '9:30 AM - 4:30 PM (Closed Mondays)',
            accessibility: 'Wheelchair accessible paths available',
            rating: 4.5,
            reviews: []
          },
          {
            id: 'india-gate',
            name: 'India Gate',
            category: 'Memorial',
            description: 'War memorial dedicated to Indian soldiers of World War I.',
            history: 'Designed by Sir Edwin Lutyens, completed in 1931.',
            images: ['https://images.pexels.com/photos/789750/pexels-photo-789750.jpeg?auto=compress&cs=tinysrgb&w=800'],
            coordinates: { lat: 28.6129, lng: 77.2295 },
            entryFee: 'Free',
            openingHours: '24 hours',
            accessibility: 'Fully accessible',
            rating: 4.7,
            reviews: []
          }
        ],
        localSpecialties: [
          {
            id: 'street-food',
            name: 'Delhi Street Food',
            type: 'food',
            description: 'Famous for chaat, paranthas, and diverse culinary experiences.',
            image: 'https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg?auto=compress&cs=tinysrgb&w=400'
          },
          {
            id: 'government-quarter',
            name: 'Government Architecture',
            type: 'culture',
            description: 'British-era government buildings and modern parliamentary complex.',
            image: 'https://images.pexels.com/photos/789750/pexels-photo-789750.jpeg?auto=compress&cs=tinysrgb&w=400'
          }
        ],
        transportation: [
          {
            id: 'delhi-metro',
            type: 'metro',
            routes: ['8 color-coded lines covering entire NCR'],
            approximateCost: '₹10-60 per journey',
            bookingInfo: 'Smart cards or tokens at stations'
          },
          {
            id: 'delhi-bus',
            type: 'bus',
            routes: ['DTC buses, cluster buses'],
            approximateCost: '₹10-25 per journey',
            bookingInfo: 'Buy tickets on board or use smart cards'
          }
        ],
        events: [
          {
            id: 'diwali',
            name: 'Diwali Festival',
            description: 'Festival of lights celebrated with great enthusiasm.',
            significance: 'Major Hindu festival celebrating victory of light over darkness.',
            dateRange: 'October/November (5 days)',
            specialAttractions: ['Fireworks displays', 'Market decorations', 'Traditional sweets'],
            image: 'https://images.pexels.com/photos/3992206/pexels-photo-3992206.jpeg?auto=compress&cs=tinysrgb&w=400'
          }
        ]
      },
      {
        id: 'agra',
        name: 'Agra',
        state: 'Uttar Pradesh',
        description: 'City of the Taj Mahal and rich Mughal heritage.',
        bestTimeToVisit: 'October to March',
        climate: 'Semi-arid',
        featuredImage: 'https://images.pexels.com/photos/1583339/pexels-photo-1583339.jpeg?auto=compress&cs=tinysrgb&w=1200',
        images: [
          'https://images.pexels.com/photos/1583339/pexels-photo-1583339.jpeg?auto=compress&cs=tinysrgb&w=800',
          'https://images.pexels.com/photos/2404843/pexels-photo-2404843.jpeg?auto=compress&cs=tinysrgb&w=800'
        ],
        coordinates: { lat: 27.1767, lng: 78.0081 },
        attractions: [
          {
            id: 'taj-mahal',
            name: 'Taj Mahal',
            category: 'Monument',
            description: 'Iconic white marble mausoleum and UNESCO World Heritage Site.',
            history: 'Built by Emperor Shah Jahan for his wife Mumtaz Mahal (1632-1653).',
            images: ['https://images.pexels.com/photos/1583339/pexels-photo-1583339.jpeg?auto=compress&cs=tinysrgb&w=800'],
            coordinates: { lat: 27.1751, lng: 78.0421 },
            entryFee: '₹50 for Indians, ₹1100 for foreigners',
            openingHours: '6:00 AM - 6:30 PM (Closed Fridays)',
            accessibility: 'Wheelchair accessible with assistance',
            rating: 4.9,
            reviews: []
          },
          {
            id: 'agra-fort',
            name: 'Agra Fort',
            category: 'Fort',
            description: 'Red sandstone fort complex with palaces and mosques.',
            history: 'Mughal imperial residence until 1638, UNESCO World Heritage Site.',
            images: ['https://images.pexels.com/photos/3881105/pexels-photo-3881105.jpeg?auto=compress&cs=tinysrgb&w=800'],
            coordinates: { lat: 27.1795, lng: 78.0211 },
            entryFee: '₹40 for Indians, ₅550 for foreigners',
            openingHours: '6:00 AM - 6:00 PM',
            accessibility: 'Partially wheelchair accessible',
            rating: 4.6,
            reviews: []
          }
        ],
        localSpecialties: [
          {
            id: 'petha',
            name: 'Agra Petha',
            type: 'food',
            description: 'Famous sweet made from ash gourd, available in various flavors.',
            image: 'https://images.pexels.com/photos/5560724/pexels-photo-5560724.jpeg?auto=compress&cs=tinysrgb&w=400'
          },
          {
            id: 'marble-inlay',
            name: 'Marble Inlay Work',
            type: 'craft',
            description: 'Traditional craft similar to that used in Taj Mahal construction.',
            image: 'https://images.pexels.com/photos/6476589/pexels-photo-6476589.jpeg?auto=compress&cs=tinysrgb&w=400'
          }
        ],
        transportation: [
          {
            id: 'agra-auto',
            type: 'auto',
            routes: ['City-wide auto rickshaw service'],
            approximateCost: '₹20-40 per km',
            bookingInfo: 'Available at taxi stands or book through apps'
          },
          {
            id: 'agra-bus',
            type: 'bus',
            routes: ['UPSRTC and private buses'],
            approximateCost: '₹10-50 per journey',
            bookingInfo: 'Bus terminals and online booking'
          }
        ],
        events: [
          {
            id: 'taj-mahotsav',
            name: 'Taj Mahotsav',
            description: 'Annual cultural festival celebrating arts, crafts, and cuisine.',
            significance: 'Showcases the rich cultural heritage of the region.',
            dateRange: 'February (10 days)',
            specialAttractions: ['Cultural performances', 'Handicraft exhibitions', 'Food stalls'],
            image: 'https://images.pexels.com/photos/3721941/pexels-photo-3721941.jpeg?auto=compress&cs=tinysrgb&w=400'
          }
        ]
      }
    ];

    setCities(sampleCities);
  };

  const getCityById = (id: string) => {
    return cities.find(city => city.id === id);
  };

  const searchCities = (query: string) => {
    if (!query) return cities;
    return cities.filter(city => 
      city.name.toLowerCase().includes(query.toLowerCase()) ||
      city.state.toLowerCase().includes(query.toLowerCase()) ||
      city.description.toLowerCase().includes(query.toLowerCase())
    );
  };

  const addReview = (attractionId: string, cityId: string, review: Omit<Review, 'id' | 'date'>) => {
    const newReview: Review = {
      ...review,
      id: Date.now().toString(),
      date: new Date().toISOString()
    };

    setCities(prevCities => 
      prevCities.map(city => {
        if (city.id === cityId) {
          return {
            ...city,
            attractions: city.attractions.map(attraction => {
              if (attraction.id === attractionId) {
                return {
                  ...attraction,
                  reviews: [...attraction.reviews, newReview]
                };
              }
              return attraction;
            })
          };
        }
        return city;
      })
    );
  };

  return (
    <DataContext.Provider value={{
      cities,
      getCityById,
      searchCities,
      addReview
    }}>
      {children}
    </DataContext.Provider>
  );
};