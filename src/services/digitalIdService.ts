import { supabase } from '../lib/supabase';
import { DigitalIDData, CreateDigitalIDData, UpdateDigitalIDData } from '../types/digitalId';

const TABLE_NAME = 'digital_ids';

export const createDigitalID = async (data: CreateDigitalIDData): Promise<{ data: DigitalIDData | null; error: Error | null }> => {
  try {
    const { data: result, error } = await supabase
      .from(TABLE_NAME)
      .insert([data])
      .select()
      .single();

    return { data: result, error: error ? new Error(error.message) : null };
  } catch (error) {
    console.error('Error creating Digital ID:', error);
    return { data: null, error: error as Error };
  }
};

export const getDigitalID = async (id: string): Promise<{ data: DigitalIDData | null; error: Error | null }> => {
  try {
    const { data: result, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return { data: result, error: null };
  } catch (error) {
    console.error('Error fetching Digital ID:', error);
    return { data: null, error: error as Error };
  }
};

export const getUserDigitalIDs = async (userId: string): Promise<{ data: DigitalIDData[] | null; error: Error | null }> => {
  try {
    const { data: result, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data: result, error: null };
  } catch (error) {
    console.error('Error fetching user Digital IDs:', error);
    return { data: null, error: error as Error };
  }
};

export const updateDigitalID = async (
  id: string,
  updates: UpdateDigitalIDData
): Promise<{ data: DigitalIDData | null; error: Error | null }> => {
  try {
    const { data: result, error } = await supabase
      .from(TABLE_NAME)
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { data: result, error: null };
  } catch (error) {
    console.error('Error updating Digital ID:', error);
    return { data: null, error: error as Error };
  }
};

export const deleteDigitalID = async (id: string): Promise<{ error: Error | null }> => {
  try {
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error deleting Digital ID:', error);
    return { error: error as Error };
  }
};

export const checkIfDigitalIDExists = async (userId: string): Promise<{ exists: boolean; data: DigitalIDData | null; error: Error | null }> => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('user_id', userId)
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is the code for no rows returned
      throw error;
    }

    return { 
      exists: !!data, 
      data: data || null, 
      error: null 
    };
  } catch (error) {
    console.error('Error checking if Digital ID exists:', error);
    return { 
      exists: false, 
      data: null, 
      error: error as Error 
    };
  }
};
