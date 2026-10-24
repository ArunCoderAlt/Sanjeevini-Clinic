import React, { useState, useEffect, useCallback } from 'react';
import DataTable from '../components/DataTable';
import ConfirmDialog from '../components/ConfirmDialog';
import Modal from '../components/Modal';
import ImageUploader from '../components/ImageUploader';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getDoctors, createDoctor, updateDoctor, deleteDoctor } from '../../services/doctorService';
import { uploadImage } from '../../services/uploadService';

const initialDoctorForm = {
  name: '',
  qualification: '',
  specialization: '',
  experience: '',
  consultationHours: 'Monday – Saturday, 5:00 PM – 9:30 PM',
  bio: '',
  languages: 'Tamil, English',
  achievements: '',
  image: '',
  order: 0,
  isActive: true,
};

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [formData, setFormData] = useState(initialDoctorForm);
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    try {
      // Pass all=true to show all doctors (both active & inactive) to admin
      const res = await getDoctors({ all: 'true' });
      setDoctors(res.data.data || []);
    } catch (err) {
      if (err.response?.status !== 401) {
        toast.error(err.response?.data?.message || 'Failed to load doctors.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const handleOpenAdd = () => {
    setEditingDoctor(null);
    setFormData(initialDoctorForm);
    setSelectedFile(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (doctor) => {
    setEditingDoctor(doctor);
    setFormData({
      name: doctor.name || '',
      qualification: doctor.qualification || '',
      specialization: doctor.specialization || '',
      experience: doctor.experience ?? '',
      consultationHours: doctor.consultationHours || '',
      bio: doctor.bio || '',
      languages: Array.isArray(doctor.languages) ? doctor.languages.join(', ') : (doctor.languages || ''),
      achievements: Array.isArray(doctor.achievements) ? doctor.achievements.join('\n') : (doctor.achievements || ''),
      image: doctor.image || '',
      order: doctor.order ?? 0,
      isActive: doctor.isActive ?? true,
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
    if (!formData.name.trim()) return toast.error('Doctor name is required');
    if (!formData.qualification.trim()) return toast.error('Qualification is required');
    if (!formData.specialization.trim()) return toast.error('Specialization is required');
    if (formData.experience === '' || isNaN(formData.experience)) return toast.error('Valid experience in years is required');

    setSubmitting(true);
    try {
      let finalImageUrl = formData.image;
      if (selectedFile instanceof File) {
        toast.loading('Uploading doctor image...', { id: 'upload-toast' });
        finalImageUrl = await uploadImage(selectedFile);
        toast.dismiss('upload-toast');
      }

      const payload = {
        name: formData.name.trim(),
        qualification: formData.qualification.trim(),
        specialization: formData.specialization.trim(),
        experience: Number(formData.experience),
        consultationHours: formData.consultationHours.trim(),
        bio: formData.bio.trim(),
        image: finalImageUrl || '',
        order: Number(formData.order) || 0,
        isActive: Boolean(formData.isActive),
        languages: formData.languages
          ? formData.languages.split(',').map((l) => l.trim()).filter(Boolean)
          : [],
        achievements: formData.achievements
          ? formData.achievements.split('\n').map((a) => a.trim()).filter(Boolean)
          : [],
      };

      if (editingDoctor) {
        await updateDoctor(editingDoctor._id, payload);
        toast.success('Doctor updated successfully');
      } else {
        await createDoctor(payload);
        toast.success('Doctor added successfully');
      }

      setModalOpen(false);
      fetchDoctors();
    } catch (err) {
      toast.dismiss('upload-toast');
      toast.error(err?.response?.data?.message || 'Failed to save doctor.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (row) => {
    setDeleteDialog({ isOpen: true, id: row._id });
  };

  const confirmDelete = async () => {
    try {
      await deleteDoctor(deleteDialog.id);
      setDoctors((prev) => prev.filter((d) => d._id !== deleteDialog.id));
      toast.success('Doctor deleted successfully');
    } catch (err) {
      toast.error('Failed to delete doctor.');
    } finally {
      setDeleteDialog({ isOpen: false, id: null });
    }
  };

  const columns = [
    {
      key: 'image',
      label: 'Photo',
      render: (val, row) => (
        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-200">
          {val ? (
            <img src={val} alt={row.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-xs text-gray-400 font-bold">{row.name?.charAt(0) || 'D'}</span>
          )}
        </div>
      ),
    },
    { key: 'name', label: 'Doctor Name', sortable: true },
    { key: 'qualification', label: 'Qualification' },
    { key: 'specialization', label: 'Specialization' },
    { key: 'experience', label: 'Experience', sortable: true },
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
          <h2 className="text-2xl font-bold text-gray-800">Doctors Management</h2>
          <p className="text-sm text-gray-500">Add, edit, or manage clinic doctors & specialists</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-lg transition-colors shadow-sm cursor-pointer font-medium text-sm"
        >
          <Plus size={18} />
          <span>Add Medical Team Doctor</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={doctors}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
        loading={loading}
      />

      {/* Add / Edit Doctor Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => !submitting && setModalOpen(false)}
        title={editingDoctor ? `Edit Medical Team Doctor: ${editingDoctor.name}` : 'Add Medical Team Doctor'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Doctor Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                placeholder="e.g. Dr. Thiagarajan Saminadane"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1880B8] focus:border-[#1880B8]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Qualification <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="qualification"
                value={formData.qualification}
                onChange={handleFormChange}
                placeholder="e.g. BSMS, MD(Siddha)"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1880B8] focus:border-[#1880B8]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Specialization <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="specialization"
                value={formData.specialization}
                onChange={handleFormChange}
                placeholder="e.g. Varmam & Chronic Disorders"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1880B8] focus:border-[#1880B8]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Experience (Years) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="experience"
                min="0"
                value={formData.experience}
                onChange={handleFormChange}
                placeholder="e.g. 15"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1880B8] focus:border-[#1880B8]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Consultation Hours
              </label>
              <input
                type="text"
                name="consultationHours"
                value={formData.consultationHours}
                onChange={handleFormChange}
                placeholder="e.g. Mon – Sat, 5:00 PM – 9:30 PM"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1880B8] focus:border-[#1880B8]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Languages (comma-separated)
              </label>
              <input
                type="text"
                name="languages"
                value={formData.languages}
                onChange={handleFormChange}
                placeholder="Tamil, English"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1880B8] focus:border-[#1880B8]"
              />
            </div>

            <div className="sm:col-span-2">
              <ImageUploader
                label="Doctor Photo"
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
                About Doctor / Biography
              </label>
              <textarea
                name="bio"
                rows="3"
                value={formData.bio}
                onChange={handleFormChange}
                placeholder="Detailed background, research, clinical focus..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1880B8] focus:border-[#1880B8]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Achievements & Awards (one per line)
              </label>
              <textarea
                name="achievements"
                rows="2"
                value={formData.achievements}
                onChange={handleFormChange}
                placeholder="Gold medalist in Siddha Medicine&#10;Published 15+ peer-reviewed papers"
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
              {submitting ? 'Saving Doctor...' : editingDoctor ? 'Update Doctor' : 'Create Doctor'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, id: null })}
        onConfirm={confirmDelete}
        title="Delete Doctor"
        message="Are you sure you want to delete this doctor? This action cannot be undone."
      />
    </div>
  );
};

export default Doctors;
