import React from 'react';
import { Helmet } from 'react-helmet-async';
import DigitalIDForm from '../components/DigitalID/DigitalIDForm';
import NewDigitalIDForm from '../components/DigitalID/NewDigitalIDForm';
import { useAuth } from '../context/AuthContext';
import { useDigitalID } from '../context/DigitalIDContext';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';

const DigitalIDPage: React.FC = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="text-gray-600">Loading Digital ID service...</p>
        </div>
      </div>
    );
  }

  const LoggedInView: React.FC = () => {
    const { digitalID, loading: idLoading, refreshDigitalID } = useDigitalID();
  
    if (idLoading || authLoading) {
      return (
        <div className="flex items-center justify-center p-4">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="text-gray-600 mt-2">Loading your Digital ID...</p>
          </div>
        </div>
      );
    }
    return <DigitalIDForm existingDigitalID={digitalID} onSuccess={refreshDigitalID} />;
  };
  
  const GuestView: React.FC = () => (
    <>
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8 rounded-r-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              You are not logged in. Your Digital ID will not be saved.
              <Link to="/login" state={{ from: '/digital-id' }} className="font-medium underline text-blue-800 hover:text-blue-600 ml-1">Log in or sign up</Link> 
              to save your ID and access it from any device.
            </p>
          </div>
        </div>
      </div>
      <NewDigitalIDForm />
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>Digital ID | India Tour</title>
        <meta 
          name="description" 
          content="Create or manage your Digital ID for a seamless travel experience across India. Store your travel documents securely in one place." 
        />
      </Helmet>
      
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Your Digital Travel ID
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            {isAuthenticated ? 'Manage your existing Digital ID' : 'Create a new Digital ID for seamless travel across India'}
          </p>
        </div>

        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
          <div className="p-6 sm:p-8">
            {isAuthenticated ? <LoggedInView /> : <GuestView />}
          </div>
        </div>

        <div className="mt-8 bg-white shadow-lg rounded-xl overflow-hidden">
          <div className="px-6 py-5 bg-gradient-to-r from-indigo-500 to-purple-600">
            <h3 className="text-lg font-medium text-white">Privacy & Security</h3>
          </div>
          <div className="p-6">
            <div className="prose prose-indigo text-gray-600">
              <p className="font-medium">
                Your privacy and security are our top priority. Your Digital ID information is:
              </p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>Encrypted in transit and at rest</li>
                <li>Only accessible to you when logged in</li>
                <li>Never shared with third parties without your explicit consent</li>
                <li>Compliant with relevant data protection regulations</li>
              </ul>
              <p className="mt-4 text-sm text-gray-500">
                By creating a Digital ID, you agree to our <a href="/privacy" className="text-indigo-600 hover:text-indigo-500">Privacy Policy</a> and 
                <a href="/terms" className="text-indigo-600 hover:text-indigo-500"> Terms of Service</a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DigitalIDPage;
