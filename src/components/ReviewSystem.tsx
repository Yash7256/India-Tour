import React, { useState } from 'react';
import { StarIcon, UserCircleIcon, HandThumbUpIcon, HandThumbDownIcon, FlagIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';
import LoadingSpinner from './LoadingSpinner';

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  content: string;
  date: string;
  helpful: number;
  notHelpful: number;
  images?: string[];
  verified: boolean;
  response?: {
    content: string;
    date: string;
    author: string;
  };
}

interface ReviewSystemProps {
  destinationId: string;
  destinationName: string;
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
  onSubmitReview?: (review: Omit<Review, 'id' | 'date' | 'helpful' | 'notHelpful'>) => void;
  onHelpfulClick?: (reviewId: string, isHelpful: boolean) => void;
  className?: string;
}

const ReviewSystem: React.FC<ReviewSystemProps> = ({
  destinationId: _destinationId,
  destinationName,
  reviews,
  averageRating,
  totalReviews,
  onSubmitReview,
  onHelpfulClick,
  className = ''
}) => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful'>('newest');
  const [filterRating, setFilterRating] = useState<number | null>(null);
  
  // Review form state
  const [newReview, setNewReview] = useState({
    rating: 0,
    title: '',
    content: '',
    userName: user?.email || 'Anonymous',
    userId: user?.id || '',
    userAvatar: '',
    verified: false,
    images: [] as string[]
  });

  const handleRatingClick = (rating: number) => {
    setNewReview(prev => ({ ...prev, rating }));
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      error('Authentication Required', 'Please log in to submit a review');
      return;
    }

    if (newReview.rating === 0) {
      error('Rating Required', 'Please select a rating before submitting');
      return;
    }

    if (newReview.content.trim().length < 10) {
      error('Review Too Short', 'Please write at least 10 characters');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSubmitReview?.(newReview);
      
      success('Review Submitted', 'Thank you for your feedback!');
      setShowReviewForm(false);
      setNewReview({
        rating: 0,
        title: '',
        content: '',
        userName: user?.email || 'Anonymous',
        userId: user?.id || '',
        userAvatar: '',
        verified: false,
        images: []
      });
    } catch (err) {
      error('Submission Failed', 'Unable to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHelpfulClick = (reviewId: string, isHelpful: boolean) => {
    if (!user) {
      error('Authentication Required', 'Please log in to vote on reviews');
      return;
    }
    onHelpfulClick?.(reviewId, isHelpful);
  };

  const getRatingDistribution = () => {
    const distribution = [0, 0, 0, 0, 0];
    reviews.forEach(review => {
      if (review.rating >= 1 && review.rating <= 5) {
        distribution[review.rating - 1]++;
      }
    });
    return distribution.reverse(); // Show 5 stars first
  };

  const filteredAndSortedReviews = reviews
    .filter(review => filterRating ? review.rating === filterRating : true)
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'oldest':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'highest':
          return b.rating - a.rating;
        case 'lowest':
          return a.rating - b.rating;
        case 'helpful':
          return b.helpful - a.helpful;
        default:
          return 0;
      }
    });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderStars = (rating: number, interactive = false, onStarClick?: (rating: number) => void) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => interactive && onStarClick?.(star)}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform duration-150`}
            disabled={!interactive}
          >
            {star <= rating ? (
              <StarSolidIcon className="w-5 h-5 text-yellow-400" />
            ) : (
              <StarIcon className="w-5 h-5 text-gray-300" />
            )}
          </button>
        ))}
      </div>
    );
  };

  const ratingDistribution = getRatingDistribution();

  return (
    <div className={`${className}`}>
      {/* Reviews Overview */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Reviews & Ratings</h2>
            <p className="text-gray-600">What travelers say about {destinationName}</p>
          </div>
          
          {user && (
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="mt-4 lg:mt-0 bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors duration-200"
            >
              Write a Review
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Rating Summary */}
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start space-x-2 mb-2">
              <span className="text-4xl font-bold text-gray-900">{averageRating.toFixed(1)}</span>
              {renderStars(Math.round(averageRating))}
            </div>
            <p className="text-gray-600">{totalReviews} reviews</p>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {ratingDistribution.map((count, index) => {
              const rating = 5 - index;
              const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
              
              return (
                <div key={rating} className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600 w-8">{rating}★</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-8">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Write Your Review</h3>
          
          <form onSubmit={handleSubmitReview} className="space-y-4">
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Rating *
              </label>
              {renderStars(newReview.rating, true, handleRatingClick)}
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review Title
              </label>
              <input
                type="text"
                value={newReview.title}
                onChange={(e) => setNewReview(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Summarize your experience..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Review *
              </label>
              <textarea
                value={newReview.content}
                onChange={(e) => setNewReview(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Tell others about your experience..."
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                {newReview.content.length}/500 characters
              </p>
            </div>

            {/* Submit Buttons */}
            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={isSubmitting || newReview.rating === 0}
                className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center space-x-2"
              >
                {isSubmitting && <LoadingSpinner size="sm" color="white" />}
                <span>{isSubmitting ? 'Submitting...' : 'Submit Review'}</span>
              </button>
              
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters and Sorting */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Rated</option>
              <option value="lowest">Lowest Rated</option>
              <option value="helpful">Most Helpful</option>
            </select>

            <select
              value={filterRating || ''}
              onChange={(e) => setFilterRating(e.target.value ? Number(e.target.value) : null)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>

          <p className="text-sm text-gray-600">
            Showing {filteredAndSortedReviews.length} of {totalReviews} reviews
          </p>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {filteredAndSortedReviews.map((review) => (
          <div key={review.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start space-x-4">
              {/* User Avatar */}
              <div className="flex-shrink-0">
                {review.userAvatar ? (
                  <img
                    src={review.userAvatar}
                    alt={review.userName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <UserCircleIcon className="w-12 h-12 text-gray-400" />
                )}
              </div>

              {/* Review Content */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-semibold text-gray-900">{review.userName}</h4>
                    {review.verified && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        Verified
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">{formatDate(review.date)}</span>
                </div>

                <div className="flex items-center space-x-2 mb-3">
                  {renderStars(review.rating)}
                  {review.title && (
                    <span className="font-medium text-gray-900">{review.title}</span>
                  )}
                </div>

                <p className="text-gray-700 mb-4 leading-relaxed">{review.content}</p>

                {/* Review Images */}
                {review.images && review.images.length > 0 && (
                  <div className="flex space-x-2 mb-4">
                    {review.images.slice(0, 3).map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Review image ${index + 1}`}
                        className="w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity duration-200"
                      />
                    ))}
                    {review.images.length > 3 && (
                      <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 text-sm">
                        +{review.images.length - 3}
                      </div>
                    )}
                  </div>
                )}

                {/* Review Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleHelpfulClick(review.id, true)}
                      className="flex items-center space-x-1 text-sm text-gray-600 hover:text-green-600 transition-colors duration-200"
                    >
                      <HandThumbUpIcon className="w-4 h-4" />
                      <span>Helpful ({review.helpful})</span>
                    </button>
                    
                    <button
                      onClick={() => handleHelpfulClick(review.id, false)}
                      className="flex items-center space-x-1 text-sm text-gray-600 hover:text-red-600 transition-colors duration-200"
                    >
                      <HandThumbDownIcon className="w-4 h-4" />
                      <span>Not Helpful ({review.notHelpful})</span>
                    </button>
                  </div>

                  <button className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200">
                    <FlagIcon className="w-4 h-4" />
                    <span>Report</span>
                  </button>
                </div>

                {/* Business Response */}
                {review.response && (
                  <div className="mt-4 bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-medium text-gray-900">Response from {review.response.author}</span>
                      <span className="text-sm text-gray-500">{formatDate(review.response.date)}</span>
                    </div>
                    <p className="text-gray-700">{review.response.content}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredAndSortedReviews.length === 0 && (
          <div className="text-center py-12">
            <UserCircleIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Reviews Found</h3>
            <p className="text-gray-600">
              {filterRating ? `No reviews with ${filterRating} stars` : 'Be the first to write a review!'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewSystem;
