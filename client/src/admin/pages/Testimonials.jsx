import React, { useState, useEffect, useCallback } from 'react';
import DataTable from '../components/DataTable';
import ConfirmDialog from '../components/ConfirmDialog';
import Modal from '../components/Modal';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getTestimonials,
  submitTestimonial,
  updateTestimonial,
  deleteTestimonial,
} from '../../services/testimonialService';

const initialTestimonialForm = {
  name: '',
  location: 'Karaikal',
  treatment: 'Varmam Therapy',
  rating: 5,
  review: '',
  isApproved: true,
  isFeatured: false,
};

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null });
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState(initialTestimonialForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchTestimonials = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getTestimonials();
      setTestimonials(res.data.data || []);
    } catch (err) {
      if (err.response?.status !== 401) {
        toast.error(err.response?.data?.message || 'Failed to load testimonials.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  const toggleStatus = async (id, field) => {
    const item = testimonials.find((t) => t._id === id);
    if (!item) return;
    const updated = { [field]: !item[field] };
    try {
      await updateTestimonial(id, updated);
      setTestimonials((prev) =>
        prev.map((t) => (t._id === id ? { ...t, ...updated } : t))
      );
      toast.success('Status updated');
    } catch (err) {
      toast.error('Failed to update status.');
    }
  };

  const handleOpenAdd = () => {
    setFormData(initialTestimonialForm);
    setModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error('Patient name is required');
    if (!formData.review.trim()) return toast.error('Review text is required');

    setSubmitting(true);
    try {
      await submitTestimonial({
        ...formData,
        rating: Number(formData.rating) || 5,
      });
      toast.success('Testimonial created successfully');
      setModalOpen(false);
      fetchTestimonials();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create testimonial.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (row) => {
    setDeleteDialog({ isOpen: true, id: row._id });
  };

  const confirmDelete = async () => {
    try {
      await deleteTestimonial(deleteDialog.id);
      setTestimonials((prev) => prev.filter((t) => t._id !== deleteDialog.id));
      toast.success('Testimonial deleted successfully');
    } catch (err) {
      toast.error('Failed to delete testimonial.');
    } finally {
      setDeleteDialog({ isOpen: false, id: null });
    }
  };

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    {
      key: 'rating',
      label: 'Rating',
      render: (val) => (
        <div className="text-yellow-500 font-medium">
          {'★'.repeat(val || 0)}
          <span className="text-gray-300">{'★'.repeat(5 - (val || 0))}</span>
        </div>
      ),
    },
    {
      key: 'treatment',
      label: 'Treatment',
      render: (val) => val || 'General',
    },
    {
      key: 'review',
      label: 'Review',
      render: (val) => (
        <span className="truncate block max-w-xs text-sm text-gray-600" title={val}>
          {val}
        </span>
      ),
    },
    {
      key: 'isApproved',
      label: 'Approved',
      render: (val, row) => (
        <button
          onClick={() => toggleStatus(row._id, 'isApproved')}
          className={`px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${
            val ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
          }`}
        >
          {val ? 'Yes' : 'No'}
        </button>
      ),
    },
    {
      key: 'isFeatured',
      label: 'Featured',
      render: (val, row) => (
        <button
          onClick={() => toggleStatus(row._id, 'isFeatured')}
          className={`px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${
            val ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
          }`}
        >
          {val ? 'Yes' : 'No'}
        </button>
      ),
    },
    {
      key: 'createdAt',
      label: 'Submitted',
      render: (val) => (val ? new Date(val).toLocaleDateString('en-IN') : '—'),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Testimonials Management</h2>
          <p className="text-sm text-gray-500">
            Moderate submitted patient reviews or add handwritten clinic testimonials
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-[#1B5E3B] hover:bg-[#2E7D5B] text-white px-4 py-2.5 rounded-lg transition-colors shadow-sm cursor-pointer font-medium text-sm"
        >
          <Plus size={18} />
          <span>Add Testimonial</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={testimonials}
        onDelete={handleDelete}
        loading={loading}
      />

      {/* Add Testimonial Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Patient Testimonial"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Patient Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleFormChange}
              placeholder="e.g. Ramesh Kumar"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1B5E3B] focus:border-[#1B5E3B]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location / City</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleFormChange}
                placeholder="e.g. Karaikal"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1B5E3B] focus:border-[#1B5E3B]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Treatment Received</label>
              <input
                type="text"
                name="treatment"
                value={formData.treatment}
                onChange={handleFormChange}
                placeholder="e.g. Varmam Therapy"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1B5E3B] focus:border-[#1B5E3B]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
            <select
              name="rating"
              value={formData.rating}
              onChange={handleFormChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1B5E3B] focus:border-[#1B5E3B]"
            >
              <option value="5">⭐⭐⭐⭐⭐ (5 Stars)</option>
              <option value="4">⭐⭐⭐⭐ (4 Stars)</option>
              <option value="3">⭐⭐⭐ (3 Stars)</option>
              <option value="2">⭐⭐ (2 Stars)</option>
              <option value="1">⭐ (1 Star)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Review / Feedback <span className="text-red-500">*</span>
            </label>
            <textarea
              name="review"
              rows="4"
              value={formData.review}
              onChange={handleFormChange}
              placeholder="Patient's experience, health recovery feedback..."
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1B5E3B] focus:border-[#1B5E3B]"
            />
          </div>

          <div className="flex gap-6 pt-2">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="isApproved"
                checked={formData.isApproved}
                onChange={handleFormChange}
                className="rounded text-[#1B5E3B] focus:ring-[#1B5E3B] h-4 w-4"
              />
              <span className="text-sm font-medium text-gray-700">Approved</span>
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={handleFormChange}
                className="rounded text-[#1B5E3B] focus:ring-[#1B5E3B] h-4 w-4"
              />
              <span className="text-sm font-medium text-gray-700">Feature on Homepage</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              disabled={submitting}
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-[#1B5E3B] hover:bg-[#2E7D5B] text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-70 cursor-pointer"
            >
              {submitting ? 'Saving...' : 'Add Testimonial'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, id: null })}
        onConfirm={confirmDelete}
        title="Delete Testimonial"
        message="Are you sure you want to delete this testimonial? This action cannot be undone."
      />
    </div>
  );
};

export default Testimonials;
