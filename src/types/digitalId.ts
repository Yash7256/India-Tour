export type DigitalIDData = {
  id?: string;
  user_id: string;
  full_name: string;
  gov_id_type: 'aadhaar' | 'passport' | 'driving' | 'voter' | 'other';
  gov_id_number: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  phone: string;
  email: string;
  blood_group?: string;
  emergency_contact_name: string;
  emergency_contact_relation: string;
  emergency_contact_phone: string;
  digital_id_number: string;
  created_at?: string;
  updated_at?: string;
};

export type CreateDigitalIDData = Omit<DigitalIDData, 'id' | 'created_at' | 'updated_at' | 'digital_id_number'>;

export type UpdateDigitalIDData = Partial<Omit<DigitalIDData, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'digital_id_number'>>;
