import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-hot-toast';
import Button from '../common/Button';
import AppointmentSuccess from './AppointmentSuccess';
import { createAppointment } from '../../services/appointmentService';

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z.string().min(10, 'Valid 10-digit phone number is required'),
  email: z.string().email('Valid email is required').optional().or(z.literal('')),
  age: z.string().min(1, 'Age is required'),
  service: z.string().min(1, 'Please select a service'),
  preferredDate: z.string().min(1, 'Please select a date'),
  preferredTime: z.string().min(1, 'Please select a time'),
  message: z.string().optional()
});

const AppointmentForm = () => {
  const [submittedData, setSubmittedData] = useState(null);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
    resolver: zodResolver(schema)
  });

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        age: parseInt(data.age, 10),
        email: data.email || undefined,
      };
      await createAppointment(payload);
      setSubmittedData(data);
      toast.success('Appointment request sent successfully!');
      reset();
    } catch (err) {
      const msg =
        err?.response?.data?.errors?.[0]?.msg ||
        err?.response?.data?.message ||
        'Failed to book appointment. Please try again or call us.';
      toast.error(msg);
    }
  };

  if (submittedData) {
    return (
      <AppointmentSuccess 
        appointment={submittedData} 
        onReset={() => setSubmittedData(null)} 
      />
    );
  }

  // Minimum date for appointment is today
  const today = new Date().toISOString().split('T')[0];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
          <input 
            {...register('name')} 
            placeholder="e.g. Ramesh Kumar"
            className="w-full px-4 py-3 rounded-xl border border-sage focus:ring-2 focus:ring-primary-600 focus:outline-none" 
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
          <input 
            {...register('phone')} 
            type="tel" 
            placeholder="+91 98765 43210"
            className="w-full px-4 py-3 rounded-xl border border-sage focus:ring-2 focus:ring-primary-600 focus:outline-none" 
          />
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
          <input 
            {...register('email')} 
            type="email" 
            placeholder="ramesh@example.com"
            className="w-full px-4 py-3 rounded-xl border border-sage focus:ring-2 focus:ring-primary-600 focus:outline-none" 
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Age *</label>
          <input 
            {...register('age')} 
            type="number" 
            min="1" 
            max="120" 
            placeholder="e.g. 35"
            className="w-full px-4 py-3 rounded-xl border border-sage focus:ring-2 focus:ring-primary-600 focus:outline-none" 
          />
          {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age.message}</p>}
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Service Required *</label>
          <select {...register('service')} className="w-full px-4 py-3 rounded-xl border border-sage focus:ring-2 focus:ring-primary-600 focus:outline-none bg-white">
            <option value="">Select a service...</option>
            <option value="General Consultation">General Consultation (Nadi Parikshai)</option>
            <option value="Varmam Therapy">Varmam Therapy (Vital Point Healing)</option>
            <option value="Thokkanam Therapy">Thokkanam Therapy (Medicated Manipulation)</option>
            <option value="Wellness Support">Wellness Support (Holistic & Preventive)</option>
          </select>
          {errors.service && <p className="text-red-500 text-xs mt-1">{errors.service.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Date *</label>
          <input 
            {...register('preferredDate')} 
            type="date" 
            min={today}
            className="w-full px-4 py-3 rounded-xl border border-sage focus:ring-2 focus:ring-primary-600 focus:outline-none" 
          />
          {errors.preferredDate && <p className="text-red-500 text-xs mt-1">{errors.preferredDate.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Time *</label>
          <select {...register('preferredTime')} className="w-full px-4 py-3 rounded-xl border border-sage focus:ring-2 focus:ring-primary-600 focus:outline-none bg-white">
            <option value="">Select a time (Mon - Sat)...</option>
            <option value="17:00">5:00 PM</option>
            <option value="17:30">5:30 PM</option>
            <option value="18:00">6:00 PM</option>
            <option value="18:30">6:30 PM</option>
            <option value="19:00">7:00 PM</option>
            <option value="19:30">7:30 PM</option>
            <option value="20:00">8:00 PM</option>
            <option value="20:30">8:30 PM</option>
            <option value="21:00">9:00 PM</option>
          </select>
          {errors.preferredTime && <p className="text-red-500 text-xs mt-1">{errors.preferredTime.message}</p>}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Additional Message or Symptoms (Optional)</label>
        <textarea 
          {...register('message')} 
          rows={4} 
          placeholder="Briefly describe your symptoms, health goals, or any prior treatments..."
          className="w-full px-4 py-3 rounded-xl border border-sage focus:ring-2 focus:ring-primary-600 focus:outline-none resize-none"
        ></textarea>
      </div>
      <Button type="submit" variant="primary" className="w-full py-4 text-lg" disabled={isSubmitting}>
        {isSubmitting ? 'Sending Request...' : 'Request Appointment'}
      </Button>
    </form>
  );
};

export default AppointmentForm;
