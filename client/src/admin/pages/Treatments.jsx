import React, { useState, useEffect, useCallback } from 'react';
import DataTable from '../components/DataTable';
import ConfirmDialog from '../components/ConfirmDialog';
import Modal from '../components/Modal';
import ImageUploader from '../components/ImageUploader';
import { Plus, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getTreatments,
  createTreatment,
  updateTreatment,
  deleteTreatment,
} from '../../services/treatmentService';
import { uploadImage } from '../../services/uploadService';

const categories = [
  'Gastrointestinal',
  'Dermatology',
  "Women's Health",
  'Kidney',
  'Musculoskeletal',
  'Pediatrics',
  'Respiratory',
  'Neurology',
  'Anorectal',
  "Men's Health",
  'Other',
];

const initialTreatmentForm = {
  name: '',
  category: 'Gastrointestinal',
  description: '',
  conditions: '',
  symptoms: '',
  approaches: '',
  image: '',
  order: 0,
  isActive: true,
};

const Treatments = () => {
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null });
  const [categoryFilter, setCategoryFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTreatment, setEditingTreatment] = useState(null);
  const [formData, setFormData] = useState(initialTreatmentForm);
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchTreatments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getTreatments(categoryFilter || undefined, { all: 'true' });
      setTreatments(res.data.data || []);
    } catch (err) {
      if (err.response?.status !== 401) {
        toast.error(err.response?.data?.message || 'Failed to load treatments.');
      }
    } finally {
      setLoading(false);
    }
  }, [categoryFilter]);

  useEffect(() => {
    fetchTreatments();
  }, [fetchTreatments]);

  const handleOpenAdd = () => {
    setEditingTreatment(null);
    setFormData(initialTreatmentForm);
    setSelectedFile(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (treatment) => {
    setEditingTreatment(treatment);
    setFormData({
      name: treatment.name || '',
      category: treatment.category || 'Gastrointestinal',
      description: treatment.description || '',
      conditions: Array.isArray(treatment.conditions) ? treatment.conditions.join(', ') : (treatment.conditions || ''),
      symptoms: Array.isArray(treatment.symptoms) ? treatment.symptoms.join('\n') : (treatment.symptoms || ''),
      approaches: Array.isArray(treatment.approaches) ? treatment.approaches.join('\n') : (treatment.approaches || ''),
      image: treatment.image || '',
      order: treatment.order ?? 0,
      isActive: treatment.isActive ?? true,
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
    if (!formData.name.trim()) return toast.error('Treatment name is required');
    if (!formData.category) return toast.error('Treatment category is required');
    if (!formData.description.trim()) return toast.error('Description is required');

    setSubmitting(true);
    try {
      let finalImageUrl = formData.image;
      if (selectedFile instanceof File) {
        toast.loading('Uploading treatment image...', { id: 'upload-toast' });
        finalImageUrl = await uploadImage(selectedFile);
        toast.dismiss('upload-toast');
      }

      const payload = {
        name: formData.name.trim(),
        category: formData.category,
        description: formData.description.trim(),
        image: finalImageUrl || '',
        order: Number(formData.order) || 0,
        isActive: Boolean(formData.isActive),
        conditions: formData.conditions
          ? formData.conditions.split(',').map((c) => c.trim()).filter(Boolean)
          : [],
        symptoms: formData.symptoms
          ? formData.symptoms.split('\n').map((s) => s.trim()).filter(Boolean)
          : [],
        approaches: formData.approaches
          ? formData.approaches.split('\n').map((a) => a.trim()).filter(Boolean)
          : [],
      };

      if (editingTreatment) {
        await updateTreatment(editingTreatment._id, payload);
        toast.success('Treatment updated successfully');
      } else {
        await createTreatment(payload);
        toast.success('Treatment created successfully');
      }

      setModalOpen(false);
      fetchTreatments();
    } catch (err) {
      toast.dismiss('upload-toast');
      toast.error(err?.response?.data?.message || 'Failed to save treatment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (row) => setDeleteDialog({ isOpen: true, id: row._id });

  const confirmDelete = async () => {
    try {
      await deleteTreatment(deleteDialog.id);
      setTreatments((prev) => prev.filter((t) => t._id !== deleteDialog.id));
      toast.success('Treatment deleted successfully');
    } catch (err) {
      toast.error('Failed to delete treatment.');
    } finally {
      setDeleteDialog({ isOpen: false, id: null });
    }
  };

  const columns = [
    {
      key: 'image',
      label: 'Image',
      render: (val, row) => (
        <div className="w-10 h-10 rounded overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-200">
          {val ? (
            <img src={val} alt={row.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-xs text-gray-400 font-bold">N/A</span>
          )}
        </div>
      ),
    },
    { key: 'name', label: 'Treatment Name', sortable: true },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      render: (val) => (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary-700">
          {val}
        </span>
      ),
    },
    {
      key: 'conditions',
      label: 'Common Conditions',
      render: (val) => (
        <span className="truncate block max-w-xs text-xs text-gray-500">
          {Array.isArray(val) ? val.slice(0, 3).join(', ') : '—'}
        </span>
      ),
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
          <h2 className="text-2xl font-bold text-gray-800">Treatments Management</h2>
          <p className="text-sm text-gray-500">Manage specialized conditions and Ayurvedic/Siddha treatment protocols</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-lg transition-colors shadow-sm cursor-pointer font-medium text-sm"
        >
          <Plus size={18} />
          <span>Add Specialized Treatment</span>
        </button>
      </div>

      <div className="bg-white p-3.5 rounded-lg shadow-sm border border-gray-200 flex items-center gap-3">
        <Filter size={18} className="text-gray-500 shrink-0" />
        <span className="text-sm font-medium text-gray-600">Filter Category:</span>
        <select
          className="text-sm rounded-md border-gray-300 shadow-xs focus:border-[#1880B8] focus:ring focus:ring-[#1880B8] focus:ring-opacity-50 border py-1.5 px-3"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <DataTable
        columns={columns}
        data={treatments}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
        loading={loading}
      />

      {/* Add / Edit Treatment Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => !submitting && setModalOpen(false)}
        title={editingTreatment ? `Edit Specialized Treatment: ${editingTreatment.name}` : 'Add New Specialized Treatment'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Treatment Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                placeholder="e.g. Acid Peptic Disease (Gastritis)"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1880B8] focus:border-[#1880B8]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleFormChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1880B8] focus:border-[#1880B8]"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description & Healing Philosophy <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleFormChange}
                placeholder="Root cause, holistic perspective, and how Siddha/Ayurveda addresses it..."
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1880B8] focus:border-[#1880B8]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Common Conditions (comma-separated)
              </label>
              <input
                type="text"
                name="conditions"
                value={formData.conditions}
                onChange={handleFormChange}
                placeholder="Acid reflux, GERD, Heartburn, Dyspepsia"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1880B8] focus:border-[#1880B8]"
              />
            </div>

            <div className="sm:col-span-2">
              <ImageUploader
                label="Treatment Image"
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
                Common Symptoms (one per line)
              </label>
              <textarea
                name="symptoms"
                rows="2"
                value={formData.symptoms}
                onChange={handleFormChange}
                placeholder="Upper abdominal pain&#10;Nausea and bloating&#10;Loss of appetite"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1880B8] focus:border-[#1880B8]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Treatment Approach (one per line)
              </label>
              <textarea
                name="approaches"
                rows="2"
                value={formData.approaches}
                onChange={handleFormChange}
                placeholder="Herbal cooling decoctions&#10;Dietary lifestyle modifications (Pathyam)&#10;Stress relaxation & gentle Varmam points"
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
              {submitting ? 'Saving Treatment...' : editingTreatment ? 'Update Treatment' : 'Create Treatment'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, id: null })}
        onConfirm={confirmDelete}
        title="Delete Treatment"
        message="Are you sure you want to delete this treatment? This action cannot be undone."
      />
    </div>
  );
};

export default Treatments;
