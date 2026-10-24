import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const defaultSettings = {
  clinicName: 'Sanjeevini Siddha & Ayurveda Medical Centre',
  address: 'No. 22, Dr. Ambedkar Street, Karaikal - 609602, Puducherry (U.T.), India',
  phone: '+91 94431 89498',
  email: 'sanjeevinisiddha@gmail.com',
  consultationHours: 'Monday – Saturday, 5:00 PM – 9:30 PM',
  mapUrl: 'https://maps.app.goo.gl/Yt69f1M1mUipkFbi9',
  socialLinks: {
    twitter: 'https://twitter.com/Sanjeevini_KKL',
    facebook: '',
    instagram: 'https://www.instagram.com/sanjeevinisiddha?rpxt=aWZydDRmMXl3aWg4',
    youtube: 'https://www.youtube.com/@SanjeeviniSiddha',
  },
};

const Settings = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(defaultSettings);

  useEffect(() => {
    api.get('/settings')
      .then((res) => {
        const data = res.data.data;
        if (data) {
          setFormData((prev) => ({
            ...prev,
            ...data,
            socialLinks: { ...prev.socialLinks, ...(data.socialLinks || {}) },
          }));
        }
      })
      .catch(() => {
        // Use defaults if settings not found
      });
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSocialChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [e.target.name]: e.target.value },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.put('/settings', formData);
      toast.success('Settings updated successfully');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save settings.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <h2 className="text-2xl font-bold text-gray-800">Clinic Settings</h2>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Clinic Name</label>
            <input
              type="text" name="clinicName" value={formData.clinicName} onChange={handleChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#1880B8] focus:ring focus:ring-[#1880B8] focus:ring-opacity-50 p-2 border"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea
              name="address" value={formData.address} onChange={handleChange} rows="2"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#1880B8] focus:ring focus:ring-[#1880B8] focus:ring-opacity-50 p-2 border"
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="text" name="phone" value={formData.phone} onChange={handleChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#1880B8] focus:ring focus:ring-[#1880B8] focus:ring-opacity-50 p-2 border"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email" name="email" value={formData.email} onChange={handleChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#1880B8] focus:ring focus:ring-[#1880B8] focus:ring-opacity-50 p-2 border"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Consultation Hours</label>
            <input
              type="text" name="consultationHours" value={formData.consultationHours} onChange={handleChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#1880B8] focus:ring focus:ring-[#1880B8] focus:ring-opacity-50 p-2 border"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Google Maps Location URL</label>
            <input
              type="text" name="mapUrl" value={formData.mapUrl || ''} onChange={handleChange}
              placeholder="https://maps.app.goo.gl/..."
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#1880B8] focus:ring focus:ring-[#1880B8] focus:ring-opacity-50 p-2 border"
            />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Social Links</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['twitter', 'facebook', 'instagram', 'youtube'].map((platform) => (
              <div key={platform}>
                <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">{platform}</label>
                <input
                  type="text"
                  name={platform}
                  value={formData.socialLinks?.[platform] || ''}
                  onChange={handleSocialChange}
                  placeholder={`https://${platform}.com/...`}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#1880B8] focus:ring focus:ring-[#1880B8] focus:ring-opacity-50 p-2 border"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg transition-colors font-medium disabled:opacity-70"
          >
            {isSubmitting ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
