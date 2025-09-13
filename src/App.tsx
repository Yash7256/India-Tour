import { useState, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import CityPage from './pages/CityPage';
import UserProfile from './pages/UserProfile';
import AdminPage from './pages/AdminPage';
import Destinations from './pages/Destinations';
import UttarPradeshPage from './pages/UttarPradeshPage';
import MadhyaPradeshPage from './pages/MadhyaPradeshPage';
import DigitalIDPage from './pages/DigitalIDPage';

import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { NotificationProvider } from './context/NotificationContext';
import { DigitalIDProvider } from './context/DigitalIDContext';
import { cityRoutes } from './cityRoutes';
import './App.css';

function AppContent() {
  const [isLoading, setIsLoading] = useState(true);
  const { loading: authLoading } = useAuth();

  useEffect(() => {
    // Simulate initial data loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-500 rounded-full animate-spin animation-delay-150 mx-auto"></div>
          </div>
          <h2 className="text-2xl font-bold text-orange-600 mb-2">India Tour</h2>
          <p className="text-gray-600">Discovering Incredible India...</p>
        </div>
      </div>
    );
  }

  return (
    <HelmetProvider>
      <DataProvider>
        <NotificationProvider>
          <DigitalIDProvider>
          <Router>
          <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/destinations" element={<Destinations />} />
                <Route path="/destinations/uttar-pradesh" element={<UttarPradeshPage />} />
                <Route path="/destinations/madhya-pradesh" element={<MadhyaPradeshPage />} />
                <Route path="/city/:cityId" element={<CityPage />} />
                {cityRoutes.map(({ path, Component }) => (
                  <Route key={path} path={path} element={<Component />} />
                ))}
                <Route path="/profile" element={<UserProfile />} />
                <Route path="/digital-id" element={<DigitalIDPage />} />
                <Route path="/admin" element={<AdminPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
            </Router>
            <Analytics />
          </DigitalIDProvider>
        </NotificationProvider>
      </DataProvider>
    </HelmetProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;