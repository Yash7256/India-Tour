import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

interface PlaceFormData {
  name: string;
  description: string;
  state: string;
  city: string;
  image_url: string;
  best_time: string;
  latitude?: number;
  longitude?: number;
  is_active: boolean;
}

const AddPlaceForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddingAttraction, setIsAddingAttraction] = useState(false);
  const [currentPlaceId, setCurrentPlaceId] = useState<string | null>(null);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<PlaceFormData>();

  const onSubmit: SubmitHandler<PlaceFormData> = async (data) => {
    try {
      setIsSubmitting(true);
      
      // Add the new place
      const { data: placeData, error } = await supabase
        .from('places')
        .insert([{
          ...data,
          latitude: data.latitude || 0,
          longitude: data.longitude || 0,
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      setCurrentPlaceId(placeData.id);
      toast.success('Place added successfully!');
      reset();
      
      // Show attraction form if user wants to add attractions
      setIsAddingAttraction(true);
      
    } catch (error) {
      console.error('Error adding place:', error);
      toast.error('Failed to add place. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Add New Tourist Destination</h2>
      
      {!isAddingAttraction ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-1" htmlFor="name">
              Place Name *
            </label>
            <input
              id="name"
              type="text"
              {...register('name', { required: 'Name is required' })}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Taj Mahal"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-gray-700 mb-1" htmlFor="description">
              Description *
            </label>
            <textarea
              id="description"
              rows={3}
              {...register('description', { required: 'Description is required' })}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter a detailed description..."
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-1" htmlFor="state">
                State *
              </label>
              <input
                id="state"
                type="text"
                {...register('state', { required: 'State is required' })}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Uttar Pradesh"
              />
              {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state.message}</p>}
            </div>

            <div>
              <label className="block text-gray-700 mb-1" htmlFor="city">
                City *
              </label>
              <input
                id="city"
                type="text"
                {...register('city', { required: 'City is required' })}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Agra"
              />
              {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-1" htmlFor="image_url">
              Image URL *
            </label>
            <input
              id="image_url"
              type="url"
              {...register('image_url', { required: 'Image URL is required' })}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://example.com/image.jpg"
            />
            {errors.image_url && <p className="text-red-500 text-sm mt-1">{errors.image_url.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-700 mb-1" htmlFor="best_time">
                Best Time to Visit
              </label>
              <input
                id="best_time"
                type="text"
                {...register('best_time')}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., October to March"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1" htmlFor="latitude">
                Latitude
              </label>
              <input
                id="latitude"
                type="number"
                step="any"
                {...register('latitude')}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 27.1750"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1" htmlFor="longitude">
                Longitude
              </label>
              <input
                id="longitude"
                type="number"
                step="any"
                {...register('longitude')}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 78.0422"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="is_active"
              type="checkbox"
              {...register('is_active')}
              defaultChecked
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="is_active" className="ml-2 block text-gray-700">
              Make this place visible to users
            </label>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => reset()}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Place'}
            </button>
          </div>
        </form>
      ) : (
        <AddAttractionForm placeId={currentPlaceId!} onBack={() => setIsAddingAttraction(false)} />
      )}
    </div>
  );
};

// Add Attraction Form Component
const AddAttractionForm = ({ placeId, onBack }: { placeId: string; onBack: () => void }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<string[]>(['']);
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<{
    name: string;
    category: string;
    description: string;
    history: string;
    entry_fee: string;
    opening_hours: string;
    accessibility: string;
  }>();

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...images];
    newImages[index] = value;
    setImages(newImages);
  };

  const addImageField = () => {
    setImages([...images, '']);
  };

  const removeImageField = (index: number) => {
    if (images.length > 1) {
      const newImages = [...images];
      newImages.splice(index, 1);
      setImages(newImages);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      
      const attractionData = {
        ...data,
        place_id: placeId,
        images: images.filter(url => url.trim() !== ''),
        rating: 0,
        reviews: []
      };

      const { error } = await supabase
        .from('attractions')
        .insert([attractionData]);
      
      if (error) throw error;
      
      toast.success('Attraction added successfully!');
      reset();
      setImages(['']);
      
    } catch (error) {
      console.error('Error adding attraction:', error);
      toast.error('Failed to add attraction. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800">Add Tourist Attraction</h3>
      <p className="text-gray-600 mb-4">
        Add a popular tourist attraction for this destination. You can add more later.
      </p>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-gray-700 mb-1" htmlFor="attraction-name">
            Attraction Name *
          </label>
          <input
            id="attraction-name"
            type="text"
            {...register('name', { required: 'Name is required' })}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Taj Mahal Main Mausoleum"
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 mb-1" htmlFor="category">
              Category *
            </label>
            <input
              id="category"
              type="text"
              {...register('category', { required: 'Category is required' })}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Historical Monument"
            />
            {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>}
          </div>

          <div>
            <label className="block text-gray-700 mb-1" htmlFor="entry_fee">
              Entry Fee *
            </label>
            <input
              id="entry_fee"
              type="text"
              {...register('entry_fee', { required: 'Entry fee is required' })}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., ₹50 for Indians, ₹1100 for foreigners"
            />
            {errors.entry_fee && <p className="text-red-500 text-sm mt-1">{errors.entry_fee.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-gray-700 mb-1" htmlFor="description">
            Description *
          </label>
          <textarea
            id="description"
            rows={2}
            {...register('description', { required: 'Description is required' })}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter a brief description..."
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
        </div>

        <div>
          <label className="block text-gray-700 mb-1" htmlFor="history">
            Historical Background
          </label>
          <textarea
            id="history"
            rows={2}
            {...register('history')}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter historical information..."
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-2">
            Image URLs
          </label>
          {images.map((url, index) => (
            <div key={index} className="flex space-x-2 mb-2">
              <input
                type="url"
                value={url}
                onChange={(e) => handleImageChange(index, e.target.value)}
                className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/attraction-image.jpg"
              />
              {images.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeImageField(index)}
                  className="px-3 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  -
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addImageField}
            className="mt-2 px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            + Add Another Image
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 mb-1" htmlFor="opening_hours">
              Opening Hours *
            </label>
            <input
              id="opening_hours"
              type="text"
              {...register('opening_hours', { required: 'Opening hours are required' })}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 6:00 AM - 6:00 PM"
            />
            {errors.opening_hours && <p className="text-red-500 text-sm mt-1">{errors.opening_hours.message}</p>}
          </div>

          <div>
            <label className="block text-gray-700 mb-1" htmlFor="accessibility">
              Accessibility
            </label>
            <input
              id="accessibility"
              type="text"
              {...register('accessibility')}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Wheelchair accessible"
            />
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            ← Back to Place
          </button>
          <div className="space-x-4">
            <button
              type="button"
              onClick={() => {
                reset();
                setImages(['']);
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Attraction'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddPlaceForm;
