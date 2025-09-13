import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { 
  createDigitalID, 
  updateDigitalID as updateDigitalIDService, 
  deleteDigitalID as deleteDigitalIDService,
  checkIfDigitalIDExists 
} from '../services/digitalIdService';
import { DigitalIDData } from '../types/digitalId';

type DigitalIDContextType = {
  digitalID: DigitalIDData | null;
  loading: boolean;
  error: string | null;
  createDigitalID: (data: Omit<DigitalIDData, 'id' | 'created_at' | 'updated_at' | 'digital_id_number'>) => Promise<void>;
  updateDigitalID: (id: string, updates: Partial<DigitalIDData>) => Promise<void>;
  deleteDigitalID: (id: string) => Promise<void>;
  refreshDigitalID: () => Promise<void>;
};

const DigitalIDContext = createContext<DigitalIDContextType | undefined>(undefined);

export const DigitalIDProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [digitalID, setDigitalID] = useState<DigitalIDData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDigitalID = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { exists, data: existingID } = await checkIfDigitalIDExists(user.id);
      
      if (exists && existingID) {
        setDigitalID(existingID);
      } else {
        setDigitalID(null);
      }
    } catch (err) {
      console.error('Error fetching Digital ID:', err);
      setError('Failed to load Digital ID. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDigitalID = async (data: Omit<DigitalIDData, 'id' | 'created_at' | 'updated_at' | 'digital_id_number'>) => {
    if (!user?.id) {
      throw new Error('User must be logged in to create a Digital ID');
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await createDigitalID({
        ...data,
        user_id: user.id,
      });

      if (error) throw error;
      await fetchDigitalID(); // Refresh the digital ID data
    } catch (err) {
      console.error('Error creating Digital ID:', err);
      setError('Failed to create Digital ID. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDigitalID = async (id: string, updates: Partial<DigitalIDData>) => {
    setLoading(true);
    setError(null);

    try {
      const { data: updatedID, error } = await updateDigitalIDService(id, updates);
      
      if (error) throw error;
      if (updatedID) setDigitalID(updatedID);
    } catch (err) {
      console.error('Error updating Digital ID:', err);
      setError('Failed to update Digital ID. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDigitalID = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await deleteDigitalIDService(id);
      
      if (error) throw error;
      setDigitalID(null);
    } catch (err) {
      console.error('Error deleting Digital ID:', err);
      setError('Failed to delete Digital ID. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDigitalID();
  }, [user?.id]);

  return (
    <DigitalIDContext.Provider
      value={{
        digitalID,
        loading,
        error,
        createDigitalID: handleCreateDigitalID,
        updateDigitalID: handleUpdateDigitalID,
        deleteDigitalID: handleDeleteDigitalID,
        refreshDigitalID: fetchDigitalID,
      }}
    >
      {children}
    </DigitalIDContext.Provider>
  );
};

export const useDigitalID = (): DigitalIDContextType => {
  const context = useContext(DigitalIDContext);
  if (context === undefined) {
    throw new Error('useDigitalID must be used within a DigitalIDProvider');
  }
  return context;
};

export default DigitalIDContext;