import React, { useState, useEffect, useCallback } from 'react';
import DataTable from '../components/DataTable';
import ConfirmDialog from '../components/ConfirmDialog';
import Modal from '../components/Modal';
import ImageUploader from '../components/ImageUploader';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { getServices, createService, updateService, deleteService } from '../../services/serviceService';
import { uploadImage } from '../../services/uploadService';

const initialServiceForm = {
  title: '',
  shortDescription: '',
  fullDescription: '',
  image: '',
  icon: 'Leaf',
  benefits: '',
  procedures: '',
  order: 0,
  isActive: true,
};

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState(initialServiceForm);
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getServices({ all: 'true' });
      setServices(res.data.data || []);
    } catch (err) {
      if (err.response?.status !== 401) {
        toast.error(err.response?.data?.message || 'Failed to load services.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleOpenAdd = () => {
    setEditingService(null);
    setFormData(initialServiceForm);
    setSelectedFile(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (service) => {
    setEditingService(service);
    setFormData({
      title: service.title || '',
      shortDescription: service.shortDescription || '',
      fullDescription: service.fullDescription || '',
      image: service.image || '',
      icon: service.icon || 'Leaf',
      benefits: Array.isArray(service.benefits) ? service.benefits.join('\n') : (service.benefits || ''),
      procedures: Array.isArray(service.procedures) ? service.procedures.join('\n') : (service.procedures || ''),
      order: service.order ?? 0,
      isActive: service.isActive ?? true,
    });
    setSelectedFile(null);
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
    if (!formData.title.trim()) return toast.error('Service title is required');
    if (!formData.shortDescription.trim()) return toast.error('Short description is required');

    setSubmitting(true);
    try {
      let finalImageUrl = formData.image;
      if (selectedFile instanceof File) {
        toast.loading('Uploading service banner...', { id: 'upload-toast' });
        finalImageUrl = await uploadImage(selectedFile);
        toast.dismiss('upload-toast');
      }

      const payload = {
        title: formData.title.trim(),
        shortDescription: formData.shortDescription.trim(),
        fullDescription: formData.fullDescription.trim(),
        image: finalImageUrl || '',
        icon: formData.icon.trim() || 'Leaf',
        order: Number(formData.order) || 0,
        isActive: Boolean(formData.isActive),
        benefits: formData.benefits
          ? formData.benefits.split('\n').map((b) => b.trim()).filter(Boolean)
          : [],
        procedures: formData.procedures
          ? formData.procedures.split('\n').map((p) => p.trim()).filter(Boolean)
          : [],
      };

      if (editingService) {
        await updateService(editingService._id, payload);
        toast.success('Service updated successfully');
      } else {
        await createService(payload);
        toast.success('Service added successfully');
      }

      setModalOpen(false);
      fetchServices();
    } catch (err) {
      toast.dismiss('upload-toast');
      toast.error(err?.response?.data?.message || 'Failed to save service.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (row) => {
    setDeleteDialog({ isOpen: true, id: row._id });
  };

  const confirmDelete = async () => {
    try {
      await deleteService(deleteDialog.id);
      setServices((prev) => prev.filter((s) => s._id !== deleteDialog.id));
      toast.success('Service deleted successfully');
    } catch (err) {
      toast.error('Failed to delete service.');
    } finally {
      setDeleteDialog({ isOpen: false, id: null });
    }
  };

  const columns = [
    {
      key: 'image',
      label: 'Image',
      render: (val, row) => (
        <div className="w-12 h-9 rounded overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-200">
          {val ? (
            <img src={val} alt={row.title} className="w-full h-full object-cover" />
          ) : (
            <span className="text-xs text-gray-400 font-bold">N/A</span>
          )}
        </div>
      ),
    },
    { key: 'title', label: 'Service Title', sortable: true },
    {
      key: 'shortDescription',
      label: 'Short Summary',
      render: (val) => <span className="truncate block max-w-xs text-sm text-gray-600" title={val}>{val}</span>,
    },
    { key: 'order', label: 'Order', sortable: true },
    {
      key: 'isActive',
      label: 'Status',
      render: (val) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            val ? 'bg-sky-100 text-[#1880B8]' : 'bg-red-100 text-red-800'
          }`}
        >
          {val ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Services Management</h2>
          <p className="text-sm text-gray-500">Add, edit, or manage therapies and clinic clinical services</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-lg transition-colors shadow-sm cursor-pointer font-medium text-sm"
        >
          <Plus size={18} />
          <span>Add Core Service</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={services}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
        loading={loading}
      />

      {/* Add / Edit Service Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => !submitting && setModalOpen(false)}
        title={editingService ? `Edit Core Service: ${editingService.title}` : 'Add New Core Service'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleFormChange}
                placeholder="e.g. Varmam Therapy"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1880B8] focus:border-[#1880B8]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Short Summary / Overview <span className="text-red-500">*</span>
              </label>
              <textarea
                name="shortDescription"
                rows="2"
                value={formData.shortDescription}
                onChange={handleFormChange}
                placeholder="Brief summary shown on services list cards..."
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1880B8] focus:border-[#1880B8]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Description & Details
              </label>
              <textarea
                name="fullDescription"
                rows="4"
                value={formData.fullDescription}
                onChange={handleFormChange}
                placeholder="In-depth details of what the service covers, healing theory, techniques used..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1880B8] focus:border-[#1880B8]"
              />
            </div>

            <div className="sm:col-span-2">
              <ImageUploader
                label="Service Image"
                currentImage={formData.image}
                onImageSelect={(fileOrUrl) => {
                  if (fileOrUrl instanceof File) {
                    setSelectedFile(fileOrUrl);
                  } else {
                    setSelectedFile(null);
                    setFormData((prev) => ({ ...prev, image: fileOrUrl || '' }));
                  }
                }}
                onUrlChange={(url) => {
                  setSelectedFile(null);
                  setFormData((prev) => ({ ...prev, image: url }));
                }}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Key Benefits (one per line)
              </label>
              <textarea
                name="benefits"
                rows="3"
                value={formData.benefits}
                onChange={handleFormChange}
                placeholder="Relieves neuromuscular pain&#10;Stimulates vitality and energy points&#10;Non-invasive natural treatment"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1880B8] focus:border-[#1880B8]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Treatment Procedures (one per line)
              </label>
              <textarea
                name="procedures"
                rows="3"
                value={formData.procedures}
                onChange={handleFormChange}
                placeholder="Initial diagnosis and nadi examination&#10;Targeted varmam point stimulation&#10;Post-therapy relaxation and herbal guidance"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1880B8] focus:border-[#1880B8]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Order
              </label>
              <input
                type="number"
                name="order"
                value={formData.order}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1880B8] focus:border-[#1880B8]"
              />
            </div>

            <div className="flex items-center pt-6">
              <label className="inline-flex items-center cursor-pointer gap-2">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleFormChange}
                  className="rounded text-[#1880B8] focus:ring-[#1880B8] h-4 w-4"
                />
                <span className="text-sm font-medium text-gray-700">Active (Visible on Website)</span>
              </label>
            </div>
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
              className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-70 cursor-pointer"
            >
              {submitting ? 'Saving Service...' : editingService ? 'Update Service' : 'Create Service'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, id: null })}
        onConfirm={confirmDelete}
        title="Delete Service"
        message="Are you sure you want to delete this service? This action cannot be undone."
      />
    </div>
  );
};

export default Services;
