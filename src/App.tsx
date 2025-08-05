import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { DataProvider } from './context/DataContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastContainer, useToast } from './components/Toast';
import Header from './components/Header';
import Footer from './components/Footer';
import BackToTop from './components/BackToTop';
import HomePage from './pages/HomePage';
import CityPage from './pages/CityPage';
import DestinationsPage from './pages/DestinationsPage';
import UserProfile from './pages/UserProfile';
import SearchPage from './pages/SearchPage';
import FavoritesPage from './pages/FavoritesPage';
import PlacesAdmin from './components/admin/PlacesAdmin';
import './App.css';

function AppContent() {
  const [isLoading, setIsLoading] = useState(true);
  const { loading: authLoading } = useAuth();
  const { toasts, removeToast } = useToast();

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
      <ErrorBoundary>
        <DataProvider>
          <AuthProvider>
            <NotificationProvider>
              <Router>
                <div className="min-h-screen bg-gray-50 flex flex-col">
                  <Header />
                  <main className="flex-1">
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/city/:cityId" element={<CityPage />} />
                      <Route path="/destinations" element={<DestinationsPage />} />
                      <Route path="/profile" element={<UserProfile />} />
                      <Route path="/search" element={<SearchPage />} />
                      <Route path="/favorites" element={<FavoritesPage />} />
                      <Route path="/admin/places" element={<PlacesAdmin />} />
                    </Routes>
                  </main>
                  <Footer />
                  <BackToTop />
                </div>
                <ToastContainer toasts={toasts} onClose={removeToast} />
              </Router>
            </NotificationProvider>
          </AuthProvider>
        </DataProvider>
      </ErrorBoundary>
    </HelmetProvider>
  );
}

function App() {
  return (
    <HelmetProvider>
      <ErrorBoundary>
        <DataProvider>
          <AuthProvider>
            <NotificationProvider>
              <AppContent />
            </NotificationProvider>
          </AuthProvider>
        </DataProvider>
      </ErrorBoundary>
    </HelmetProvider>
  );
}

export default App;