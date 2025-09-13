import React, { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaBirthdayCake, 
  FaVenusMars, FaTint, FaUserFriends, FaIdCard, FaDownload, FaPrint } from 'react-icons/fa';
import { toast } from 'react-toastify';

// Types
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
  photo?: string;
}

// Generate a unique ID
const generateDigitalId = (): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `DID-${timestamp}-${random}`.toUpperCase();
};

// Format date to DD/MM/YYYY
const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-GB').format(date);
};

// Generate QR Code data URL
const generateQRCode = (data: string): string => {
  const canvas = document.createElement('canvas');
  canvas.width = 200;
  canvas.height = 200;
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 200, 200);
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('SCAN ME', 100, 100);
    ctx.fillText(data.substring(0, 10), 100, 120);
    ctx.fillText(data.substring(10), 100, 140);
  }
  
  return canvas.toDataURL();
};

const NewDigitalIDForm: React.FC = () => {
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
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [qrCode, setQrCode] = useState<string>('');
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'form' | 'preview'>('form');
  
  // Generate a new ID when the component mounts
  useEffect(() => {
    setDigitalId(generateDigitalId());
  }, []);
  
  // Generate QR code when digitalId changes
  useEffect(() => {
    if (digitalId) {
      setQrCode(generateQRCode(digitalId));
    }
  }, [digitalId]);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    
    // Handle file upload
    if (name === 'photo' && (e.target as HTMLInputElement).files) {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPhotoPreview(reader.result as string);
          setFormData(prev => ({
            ...prev,
            photo: reader.result as string
          }));
        };
        reader.readAsDataURL(file);
      }
      return;
    }
    
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
    console.log('Validating form with data:', formData);
    
    // Check required fields
    const requiredFields = [
      { field: 'fullName', label: 'Full Name', value: formData.fullName },
      { field: 'email', label: 'Email', value: formData.email },
      { field: 'phone', label: 'Phone Number', value: formData.phone },
      { field: 'dateOfBirth', label: 'Date of Birth', value: formData.dateOfBirth },
      { field: 'emergencyContact.name', label: 'Emergency Contact Name', value: formData.emergencyContact.name },
      { field: 'emergencyContact.relation', label: 'Emergency Contact Relation', value: formData.emergencyContact.relation },
      { field: 'emergencyContact.phone', label: 'Emergency Contact Phone', value: formData.emergencyContact.phone }
    ];
    
    for (const { field, label, value } of requiredFields) {
      console.log(`Validating ${field}:`, value);
      
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        console.error(`Validation failed: ${label} is required`);
        toast.error(`Please fill in the ${label}`);
        return false;
      }
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }
    
    // Validate phone numbers (at least 10 digits)
    const phoneRegex = /^\+?[0-9\s-]{10,}$/;
    if (!phoneRegex.test(formData.phone)) {
      toast.error('Please enter a valid phone number (at least 10 digits)');
      return false;
    }
    
    if (!phoneRegex.test(formData.emergencyContact.phone)) {
      toast.error('Please enter a valid emergency contact phone number (at least 10 digits)');
      return false;
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted');
    
    const isValid = validateForm();
    console.log('Form validation result:', isValid);
    
    if (!isValid) {
      console.log('Form validation failed');
      return;
    }
    
    // Generate a new ID if this is the first submission
    if (!isSubmitted) {
      console.log('Generating new Digital ID');
      const newId = generateDigitalId();
      console.log('Generated ID:', newId);
      setDigitalId(newId);
      setQrCode(generateQRCode(newId));
    } else {
      console.log('Using existing Digital ID:', digitalId);
    }
    
    console.log('Setting form as submitted');
    setIsSubmitted(true);
    setActiveTab('preview');
    toast.success('Digital ID generated successfully!');
  };
  
  const handleEdit = () => {
    setActiveTab('form');
  };
  
  const handlePrint = () => {
    window.print();
  };
  
  const downloadDigitalID = () => {
    const element = document.createElement('a');
    const file = new Blob([JSON.stringify({
      ...formData,
      digitalId,
      qrCode
    }, null, 2)], {type: 'application/json'});
    element.href = URL.createObjectURL(file);
    element.download = `digital-id-${digitalId}.json`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const renderForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Information */}
      <div className="bg-white shadow overflow-hidden rounded-lg">
        <div className="px-6 py-5 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
        </div>
        <div className="px-6 py-6 space-y-6">
          {/* Photo Upload */}
          <div className="flex items-center space-x-6">
            <div className="flex-shrink-0">
              <div className="h-24 w-24 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <FaUser className="h-12 w-12 text-gray-400" />
                )}
              </div>
            </div>
            <div>
              <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                <span>Upload Photo</span>
                <input
                  type="file"
                  name="photo"
                  accept="image/*"
                  onChange={handleChange}
                  className="sr-only"
                />
              </label>
              <p className="mt-2 text-xs text-gray-500">JPG, PNG, or WebP. Max 2MB</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            {/* Full Name */}
            <div className="sm:col-span-4">
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="fullName"
                  id="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="sm:col-span-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>

            {/* Phone */}
            <div className="sm:col-span-4">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaPhone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>

            {/* Date of Birth */}
            <div className="sm:col-span-3">
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaBirthdayCake className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  name="dateOfBirth"
                  id="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>

            {/* Gender */}
            <div className="sm:col-span-3">
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                Gender
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaVenusMars className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>
            </div>

            {/* Blood Group */}
            <div className="sm:col-span-2">
              <label htmlFor="bloodGroup" className="block text-sm font-medium text-gray-700">
                Blood Group
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaTint className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  id="bloodGroup"
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                >
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
        </div>
      </div>

      {/* Address Information */}
      <div className="bg-white shadow overflow-hidden rounded-lg">
        <div className="px-6 py-5 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Address Information</h3>
        </div>
        <div className="px-6 py-6 space-y-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            {/* Address */}
            <div className="sm:col-span-6">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Street Address <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="address"
                  id="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>

            {/* City */}
            <div className="sm:col-span-2">
              <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                City <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="city"
                  id="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>

            {/* State */}
            <div className="sm:col-span-2">
              <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                State/Province <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="state"
                  id="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>

            {/* Country */}
            <div className="sm:col-span-2">
              <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                Country <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="country"
                  id="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>

            {/* Pincode */}
            <div className="sm:col-span-2">
              <label htmlFor="pincode" className="block text-sm font-medium text-gray-700">
                ZIP/Postal Code <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="pincode"
                  id="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Government ID */}
      <div className="bg-white shadow overflow-hidden rounded-lg">
        <div className="px-6 py-5 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Government ID</h3>
        </div>
        <div className="px-6 py-6 space-y-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            {/* ID Type */}
            <div className="sm:col-span-2">
              <label htmlFor="govIdType" className="block text-sm font-medium text-gray-700">
                ID Type
              </label>
              <div className="mt-1">
                <select
                  id="govIdType"
                  name="govIdType"
                  value={formData.govIdType}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="aadhaar">Aadhaar</option>
                  <option value="passport">Passport</option>
                  <option value="driving">Driving License</option>
                  <option value="voter">Voter ID</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* ID Number */}
            <div className="sm:col-span-4">
              <label htmlFor="govIdNumber" className="block text-sm font-medium text-gray-700">
                ID Number <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaIdCard className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="govIdNumber"
                  id="govIdNumber"
                  value={formData.govIdNumber}
                  onChange={handleChange}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="bg-white shadow overflow-hidden rounded-lg">
        <div className="px-6 py-5 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Emergency Contact</h3>
        </div>
        <div className="px-6 py-6 space-y-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            {/* Emergency Contact Name */}
            <div className="sm:col-span-3">
              <label htmlFor="emergencyContact.name" className="block text-sm font-medium text-gray-700">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUserFriends className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="emergencyContact.name"
                  id="emergencyContact.name"
                  value={formData.emergencyContact.name}
                  onChange={handleChange}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>

            {/* Relation */}
            <div className="sm:col-span-2">
              <label htmlFor="emergencyContact.relation" className="block text-sm font-medium text-gray-700">
                Relation <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="emergencyContact.relation"
                  id="emergencyContact.relation"
                  value={formData.emergencyContact.relation}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>

            {/* Emergency Phone */}
            <div className="sm:col-span-3">
              <label htmlFor="emergencyContact.phone" className="block text-sm font-medium text-gray-700">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaPhone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  name="emergencyContact.phone"
                  id="emergencyContact.phone"
                  value={formData.emergencyContact.phone}
                  onChange={handleChange}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {isSubmitted ? 'Update Digital ID' : 'Generate Digital ID'}
        </button>
      </div>
    </form>
  );

  const renderPreview = () => (
    <div className="space-y-6">
      {/* Digital ID Card */}
      <div className="bg-white shadow-lg rounded-xl overflow-hidden border-2 border-gray-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">India Tour Digital ID</h2>
            <div className="text-sm text-indigo-100">ID: {digitalId}</div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Photo and Basic Info */}
            <div className="flex-shrink-0">
              <div className="h-32 w-32 rounded-lg bg-gray-200 overflow-hidden flex items-center justify-center">
                {photoPreview ? (
                  <img src={photoPreview} alt="ID Photo" className="h-full w-full object-cover" />
                ) : (
                  <FaUser className="h-16 w-16 text-gray-400" />
                )}
              </div>
              
              {/* QR Code */}
              <div className="mt-4 flex justify-center">
                {qrCode && (
                  <div className="p-2 bg-white rounded border border-gray-200">
                    <img src={qrCode} alt="QR Code" className="h-24 w-24" />
                  </div>
                )}
              </div>
              
              <div className="mt-4 text-center text-sm text-gray-500">
                <p>Scan QR code to verify</p>
                <p className="text-xs mt-1">Valid for travel within India</p>
              </div>
            </div>

            {/* Details */}
            <div className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div className="border-b border-gray-100 pb-2">
                  <p className="text-xs font-medium text-gray-500">Full Name</p>
                  <p className="font-medium text-gray-900">{formData.fullName}</p>
                </div>
                
                <div className="border-b border-gray-100 pb-2">
                  <p className="text-xs font-medium text-gray-500">Date of Birth</p>
                  <p className="text-gray-900">{formatDate(formData.dateOfBirth)}</p>
                </div>
                
                <div className="border-b border-gray-100 pb-2">
                  <p className="text-xs font-medium text-gray-500">Gender</p>
                  <p className="text-gray-900 capitalize">{formData.gender}</p>
                </div>
                
                <div className="border-b border-gray-100 pb-2">
                  <p className="text-xs font-medium text-gray-500">Blood Group</p>
                  <p className="text-gray-900">{formData.bloodGroup}</p>
                </div>
                
                <div className="md:col-span-2 border-b border-gray-100 pb-2">
                  <p className="text-xs font-medium text-gray-500">Address</p>
                  <p className="text-gray-900">
                    {formData.address}, {formData.city}, {formData.state}, {formData.country} - {formData.pincode}
                  </p>
                </div>
                
                <div className="border-b border-gray-100 pb-2">
                  <p className="text-xs font-medium text-gray-500">Phone</p>
                  <p className="text-gray-900">{formData.phone}</p>
                </div>
                
                <div className="border-b border-gray-100 pb-2">
                  <p className="text-xs font-medium text-gray-500">Email</p>
                  <p className="text-gray-900 truncate">{formData.email}</p>
                </div>
                
                <div className="md:col-span-2 mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-2">Emergency Contact</p>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="font-medium text-gray-900">{formData.emergencyContact.name}</p>
                    <p className="text-sm text-gray-600">{formData.emergencyContact.relation}</p>
                    <p className="text-sm text-gray-600">{formData.emergencyContact.phone}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
          <div className="flex justify-between items-center text-xs text-gray-500">
            <div>
              <p>Issued on: {new Date().toLocaleDateString()}</p>
              <p className="text-red-600 font-medium">For identification purposes only</p>
            </div>
            <div className="text-right">
              <p>ID: {digitalId}</p>
              <p>Valid across India</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 justify-center md:justify-end">
        <button
          onClick={handleEdit}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Edit Details
        </button>
        <button
          onClick={handlePrint}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <FaPrint className="mr-2 h-4 w-4" />
          Print ID
        </button>
        <button
          onClick={downloadDigitalID}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          <FaDownload className="mr-2 h-4 w-4" />
          Download ID
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            type="button"
            onClick={() => setActiveTab('form')}
            className={`${activeTab === 'form' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Fill Details
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            disabled={!isSubmitted}
            className={`${!isSubmitted ? 'opacity-50 cursor-not-allowed' : ''} ${activeTab === 'preview' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Preview ID
          </button>
        </nav>
      </div>

      {activeTab === 'form' ? renderForm() : renderPreview()}
    </div>
  );
};

export default NewDigitalIDForm;
