import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useDigitalID } from '../../context/DigitalIDContext';
import { generateDigitalId } from '../../utils/idGenerator';
import { toast } from 'react-toastify';
import { DigitalIDData } from '../../types/digitalId';

// User metadata type for type safety
interface UserMetadata {
  full_name?: string;
  name?: string;
}

// Type for the user object from useAuth
interface AppUser {
  id: string;
  email?: string;
  phone?: string;
  user_metadata?: UserMetadata;
}

interface DigitalIDFormProps {
  existingDigitalID: DigitalIDData | null;
  onSuccess: () => void;
}

type Gender = 'male' | 'female' | 'other' | 'prefer-not-to-say';
type GovIdType = 'aadhaar' | 'passport' | 'driving' | 'voter' | 'other';

interface EmergencyContact {
  name: string;
  relation: string;
  phone: string;
}

interface DigitalIDFormData {
  fullName: string;
  govIdType: GovIdType;
  govIdNumber: string;
  dateOfBirth: string;
  gender: Gender;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  phone: string;
  email: string;
  bloodGroup: string;
  emergencyContact: EmergencyContact;
}

const DigitalIDForm: React.FC<DigitalIDFormProps> = ({ existingDigitalID, onSuccess }) => {
  const { user } = useAuth() as { user: AppUser | null };
  const { createDigitalID, updateDigitalID } = useDigitalID();
  
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState<DigitalIDFormData>({
    fullName: '',
    govIdType: 'aadhaar',
    govIdNumber: '',
    dateOfBirth: '',
    gender: 'male',
    address: '',
    city: '',
    state: '',
    country: 'India',
    pincode: '',
    phone: '',
    email: '',
    bloodGroup: 'A+',
    emergencyContact: {
      name: '',
      relation: '',
      phone: ''
    }
  });
  
  const [digitalId, setDigitalId] = useState<string>('');

  // Helper to safely get user metadata
  const getUserFullName = (user: AppUser | null): string => {
    if (!user) return '';
    const metadata = user.user_metadata || {};
    return metadata.full_name || metadata.name || '';
  };

  useEffect(() => {
    if (existingDigitalID) {
      setFormData({
        fullName: existingDigitalID.full_name,
        govIdType: existingDigitalID.gov_id_type as any,
        govIdNumber: existingDigitalID.gov_id_number,
        dateOfBirth: existingDigitalID.date_of_birth,
        gender: existingDigitalID.gender as any,
        address: existingDigitalID.address,
        city: existingDigitalID.city,
        state: existingDigitalID.state,
        country: existingDigitalID.country,
        pincode: existingDigitalID.pincode,
        phone: existingDigitalID.phone,
        email: existingDigitalID.email,
        bloodGroup: existingDigitalID.blood_group || '',
        emergencyContact: {
          name: existingDigitalID.emergency_contact_name,
          relation: existingDigitalID.emergency_contact_relation,
          phone: existingDigitalID.emergency_contact_phone
        }
      });
      setDigitalId(existingDigitalID.digital_id_number);
      setIsSubmitted(true);
    } else {
      setFormData(prev => ({
        ...prev,
        fullName: getUserFullName(user),
        phone: user?.phone || '',
        email: user?.email || ''
      }));
    }
  }, [existingDigitalID, user]);

  // Handle all form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    
    // Handle nested emergency contact fields
    if (name.startsWith('emergencyContact.')) {
      const field = name.split('.')[1] as keyof EmergencyContact;
      setFormData(prev => ({
        ...prev,
        emergencyContact: {
          ...prev.emergencyContact,
          [field]: value
        }
      }));
    } else {
      // Handle regular fields
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? Number(value) : value
      }));
    }
  };

  const validateForm = (): boolean => {
    const requiredFields: (keyof DigitalIDFormData)[] = [
      'fullName', 'govIdNumber', 'dateOfBirth', 'address', 
      'city', 'state', 'country', 'pincode', 'phone', 'email'
    ];
    
    for (const field of requiredFields) {
      const value = formData[field];
      if (!value) {
        const fieldName = field.replace(/([A-Z])/g, ' $1').toLowerCase().trim();
        toast.error(`Please fill in the ${fieldName}`);
        return false;
      }
    }

    const { emergencyContact } = formData;
    if (!emergencyContact.name || !emergencyContact.relation || !emergencyContact.phone) {
      toast.error('Please fill in all emergency contact details');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    const phoneRegex = /^\+?[0-9\s-]{10,}$/;
    if (!phoneRegex.test(formData.phone) || !phoneRegex.test(emergencyContact.phone)) {
      toast.error('Please enter valid phone numbers (at least 10 digits)');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !user.id) {
      toast.error('You must be logged in to save a Digital ID');
      return;
    }
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Create base digital ID data without the fields we'll handle specially
      const baseDigitalIDData = {
        full_name: formData.fullName,
        gov_id_type: formData.govIdType,
        gov_id_number: formData.govIdNumber,
        date_of_birth: formData.dateOfBirth,
        gender: formData.gender,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        pincode: formData.pincode,
        phone: formData.phone,
        email: formData.email,
        blood_group: formData.bloodGroup || undefined,
        emergency_contact_name: formData.emergencyContact.name,
        emergency_contact_relation: formData.emergencyContact.relation,
        emergency_contact_phone: formData.emergencyContact.phone,
      };

      if (existingDigitalID) {
        // For updates, we don't need to include the digital_id_number
        const id = existingDigitalID.id || ''; // Ensure ID is always a string
        await updateDigitalID(id, baseDigitalIDData);
        toast.success('Digital ID updated successfully!');
      } else {
        // For new records, include the generated ID and user ID
        const newDigitalID = {
          ...baseDigitalIDData,
          digital_id_number: generateDigitalId() || `ID-${Date.now()}`, // Fallback ID if generateDigitalId() fails
          user_id: user.id
        };
        
        await createDigitalID(newDigitalID);
        toast.success('Digital ID created successfully!');
      }
      
      setIsSubmitted(true);
      onSuccess();
    } catch (error) {
      console.error('Error saving Digital ID:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save Digital ID');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-green-600 mb-2">Digital ID Created Successfully!</h2>
          <p className="text-gray-600">Your Digital ID has been generated and saved successfully.</p>
        </div>
        
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <div className="text-center mb-6">
            <div className="text-3xl font-mono font-bold text-indigo-700 mb-2">{digitalId}</div>
            <p className="text-sm text-gray-500">Your unique Digital ID</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-500">Full Name</p>
              <p className="font-medium">{formData.fullName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Date of Birth</p>
              <p className="font-medium">{new Date(formData.dateOfBirth).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">ID Type</p>
              <p className="font-medium capitalize">{formData.govIdType}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">ID Number</p>
              <p className="font-mono">{formData.govIdNumber}</p>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="font-medium text-gray-700 mb-3">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{formData.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{formData.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-medium">{formData.address}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">City/State</p>
                <p className="font-medium">{formData.city}, {formData.state}</p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex justify-center space-x-4">
            <button
              onClick={() => window.print()}
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Print ID
            </button>
            <button
              onClick={() => {
                // Here you would implement download as PDF
                toast.info('Download feature coming soon!');
              }}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Download PDF
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Create Your Digital ID</h2>
        <p className="text-gray-600">Fill in your details to generate a secure Digital ID for your travels in India</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="prefer-not-to-say">Prefer not to say</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="bloodGroup" className="block text-sm font-medium text-gray-700 mb-1">
                Blood Group (Optional)
              </label>
              <select
                id="bloodGroup"
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Government ID */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Government Identification</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="govIdType" className="block text-sm font-medium text-gray-700 mb-1">
                ID Type <span className="text-red-500">*</span>
              </label>
              <select
                id="govIdType"
                name="govIdType"
                value={formData.govIdType}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="aadhaar">Aadhaar Card</option>
                <option value="passport">Passport</option>
                <option value="driving">Driving License</option>
                <option value="voter">Voter ID</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="govIdNumber" className="block text-sm font-medium text-gray-700 mb-1">
                ID Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="govIdNumber"
                name="govIdNumber"
                value={formData.govIdNumber}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder={formData.govIdType === 'aadhaar' ? 'XXXX XXXX XXXX' : ''}
                required
              />
            </div>
          </div>
        </div>
        
        {/* Contact Information */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="10-digit mobile number"
                required
              />
            </div>
          </div>
        </div>
        
        {/* Address */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Address</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Street Address <span className="text-red-500">*</span>
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                  State/Province <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-1">
                  ZIP/Postal Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="pincode"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                Country <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 focus:ring-indigo-500 focus:border-indigo-500"
                readOnly
              />
            </div>
          </div>
        </div>
        
        {/* Emergency Contact */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Emergency Contact</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="emergencyContact.name" className="block text-sm font-medium text-gray-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="emergencyContact.name"
                name="emergencyContact.name"
                value={formData.emergencyContact.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="emergencyContact.relation" className="block text-sm font-medium text-gray-700 mb-1">
                Relation <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="emergencyContact.relation"
                name="emergencyContact.relation"
                value={formData.emergencyContact.relation}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., Father, Mother, Spouse"
                required
              />
            </div>
            
            <div>
              <label htmlFor="emergencyContact.phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="emergencyContact.phone"
                name="emergencyContact.phone"
                value={formData.emergencyContact.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
          </div>
        </div>
        
        {/* Terms and Conditions */}
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
              required
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="terms" className="font-medium text-gray-700">
              I agree to the <a href="/terms" className="text-indigo-600 hover:text-indigo-500">Terms of Service</a> and{' '}
              <a href="/privacy" className="text-indigo-600 hover:text-indigo-500">Privacy Policy</a>.
              <span className="text-red-500">*</span>
            </label>
            <p className="text-gray-500">I confirm that all the information provided is accurate to the best of my knowledge.</p>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Generating ID...' : 'Generate Digital ID'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DigitalIDForm;
