import { useState, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import CityPage from './pages/CityPage';
import UserProfile from './pages/UserProfile';
import AdminPage from './pages/AdminPage';
import Destinations from './pages/Destinations';
import UttarPradeshPage from './pages/UttarPradeshPage';
import MadhyaPradeshPage from './pages/MadhyaPradeshPage';
import BhopalPage from './states/Madhya Pradesh/BhopalPage';
import PachmarhiPage from './states/Madhya Pradesh/PachmarhiPage';
import TikamgarhPage from './states/Madhya Pradesh/TikamgarhPage';
import JabalpurPage from './states/Madhya Pradesh/JabalpurPage';
import IndorePage from './states/Madhya Pradesh/IndorePage';
import GwaliorPage from './states/Madhya Pradesh/GwaliorPage';
import DatiaPage from './states/Madhya Pradesh/DatiaPage';
import DewasPage from './states/Madhya Pradesh/DewasPage';
import DamohPage from './states/Madhya Pradesh/DamohPage';
import BurhanpurPage from './states/Madhya Pradesh/BurhanpurPage';
import BarwaniPage from './states/Madhya Pradesh/BarwaniPage';
import ChhindwaraPage from './states/Madhya Pradesh/ChindwaraPage';
import DharPage from './states/Madhya Pradesh/DharPage';
import KhandwaPage from './states/Madhya Pradesh/KhandwaPage';
import KhargonePage from './states/Madhya Pradesh/KhargonePage';
import MandsaurPage from './states/Madhya Pradesh/MandsaurPage';
import NarmadapuramPage from './states/Madhya Pradesh/NarmadapuramPage';
import NarsinghpurPage from './states/Madhya Pradesh/NarsinghpurPage';
import PannaPage from './states/Madhya Pradesh/PannaPage';
import RaisenPage from './states/Madhya Pradesh/RaisenPage';
import RewaPage from './states/Madhya Pradesh/RewaPage';
import SagarPage from './states/Madhya Pradesh/SagarPage';
import SehorePage from './states/Madhya Pradesh/SehorePage';
import ShivpuriPage from './states/Madhya Pradesh/ShivpuriPage';
import UjjainPage from './states/Madhya Pradesh/UjjainPage';
import UmariaPage from './states/Madhya Pradesh/UmariaPage';
import KatniPage from './states/Madhya Pradesh/KatniPage';

import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { NotificationProvider } from './context/NotificationContext';
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
    <DataProvider>
      <NotificationProvider>
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
                <Route path="/bhopal" element={<BhopalPage />} />
                <Route path="/pachmarhi" element={<PachmarhiPage />} />
                <Route path="/tikamgarh" element={<TikamgarhPage />} />
                <Route path="/jabalpur" element={<JabalpurPage />} />
                <Route path="/indore" element={<IndorePage />} />
                <Route path="/gwalior" element={<GwaliorPage />} />
                <Route path="/datia" element={<DatiaPage />} />
                <Route path="/dewas" element={<DewasPage />} />
                <Route path="/damoh" element={<DamohPage />} />
                <Route path="/burhanpur" element={<BurhanpurPage />} />
                <Route path="/barwani" element={<BarwaniPage />} />
                <Route path="/chhindwada" element={<ChhindwaraPage />} />
                <Route path="/katni" element={<KatniPage />} />
                <Route path="/dhar" element={<DharPage />} />
                <Route path="/khandwa" element={<KhandwaPage />} />
                <Route path="/khargone" element={<KhargonePage />} />
                <Route path="/mandsaur" element={<MandsaurPage />} />
                <Route path="/narmadapuram" element={<NarmadapuramPage />} />
                <Route path="/narsinghpur" element={<NarsinghpurPage />} />
                <Route path="/panna" element={<PannaPage />} />
                <Route path="/raisen" element={<RaisenPage />} />
                <Route path="/rewa" element={<RewaPage />} />
                <Route path="/sagar" element={<SagarPage />} />
                <Route path="/sehore" element={<SehorePage />} />
                <Route path="/shivpuri" element={<ShivpuriPage />} />
                <Route path="/ujjain" element={<UjjainPage />} />
                <Route path="/umaria" element={<UmariaPage />} />
                <Route path="/profile" element={<UserProfile />} />
                <Route path="/admin" element={<AdminPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
        <Analytics />
      </NotificationProvider>
    </DataProvider>
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