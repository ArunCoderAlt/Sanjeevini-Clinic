import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-hot-toast';
import Button from '../common/Button';
import { submitTestimonial } from '../../services/testimonialService';

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  location: z.string().min(2, 'Location is required'),
  rating: z.string().min(1, 'Rating is required'),
  treatment: z.string().min(2, 'Treatment is required'),
  review: z.string().min(10, 'Review must be at least 10 characters long')
});

const TestimonialForm = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { rating: '5' }
  });

  const onSubmit = async (data) => {
    try {
      await submitTestimonial({
        ...data,
        rating: parseInt(data.rating, 10),
      });
      toast.success('Thank you! Your review has been submitted for moderation.');
      reset();
    } catch (err) {
      const msg =
        err?.response?.data?.errors?.[0]?.msg ||
        err?.response?.data?.message ||
        'Failed to submit review. Please try again.';
      toast.error(msg);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
          <input {...register('name')} className="w-full px-4 py-3 rounded-xl border border-sage focus:ring-2 focus:ring-primary-600 focus:outline-none" />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location / City</label>
          <input {...register('location')} className="w-full px-4 py-3 rounded-xl border border-sage focus:ring-2 focus:ring-primary-600 focus:outline-none" />
          {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Treatment Received</label>
          <input {...register('treatment')} className="w-full px-4 py-3 rounded-xl border border-sage focus:ring-2 focus:ring-primary-600 focus:outline-none" />
          {errors.treatment && <p className="text-red-500 text-xs mt-1">{errors.treatment.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
          <select {...register('rating')} className="w-full px-4 py-3 rounded-xl border border-sage focus:ring-2 focus:ring-primary-600 focus:outline-none bg-white">
            <option value="5">5 Stars - Excellent</option>
            <option value="4">4 Stars - Very Good</option>
            <option value="3">3 Stars - Good</option>
            <option value="2">2 Stars - Fair</option>
            <option value="1">1 Star - Poor</option>
          </select>
          {errors.rating && <p className="text-red-500 text-xs mt-1">{errors.rating.message}</p>}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Your Review</label>
        <textarea {...register('review')} rows={4} className="w-full px-4 py-3 rounded-xl border border-sage focus:ring-2 focus:ring-primary-600 focus:outline-none resize-none"></textarea>
        {errors.review && <p className="text-red-500 text-xs mt-1">{errors.review.message}</p>}
      </div>
      <Button type="submit" variant="primary" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit Review'}
      </Button>
    </form>
  );
};

export default TestimonialForm;
