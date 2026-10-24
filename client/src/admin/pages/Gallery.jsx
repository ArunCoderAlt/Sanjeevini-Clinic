import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Trash2, Edit2, Upload, Plus } from 'lucide-react';
import ImageUploader from '../components/ImageUploader';
import ConfirmDialog from '../components/ConfirmDialog';
import Modal from '../components/Modal';
import {
  getGallery,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
} from '../../services/galleryService';
import { uploadImage } from '../../services/uploadService';

const categories = ['clinic', 'treatment', 'team', 'event'];

const Gallery = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null });

  // Upload Form State
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState('clinic');
  const [uploadOrder, setUploadOrder] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('clinic');
  const [editOrder, setEditOrder] = useState(0);
  const [editIsActive, setEditIsActive] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchGallery = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getGallery(filter === 'all' ? undefined : filter, { all: 'true' });
      const data = res.data.data || [];
      setImages(
        data.map((item) => ({
          id: item._id,
          url: item.image,
          title: item.title || 'Clinic photo',
          category: item.category || 'clinic',
          order: item.order || 0,
          isActive: item.isActive ?? true,
        }))
      );
    } catch (err) {
      if (err.response?.status !== 401) {
        toast.error(err.response?.data?.message || 'Failed to load gallery items.');
      }
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchGallery();
  }, [fetchGallery]);

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile && !imageUrlInput) {
      return toast.error('Please select an image file to upload or enter an image URL.');
    }

    setIsUploading(true);
    try {
      let finalUrl = imageUrlInput;
      if (selectedFile instanceof File) {
        toast.loading('Uploading image...', { id: 'gallery-upload-toast' });
        finalUrl = await uploadImage(selectedFile);
        toast.dismiss('gallery-upload-toast');
      }

      if (!finalUrl) {
        throw new Error('Could not obtain image URL.');
      }

      await createGalleryItem({
        title: uploadTitle.trim() || 'Clinic Photo',
        category: uploadCategory,
        image: finalUrl,
        order: Number(uploadOrder) || 0,
        isActive: true,
      });

      toast.success('Image added to gallery!');
      setUploadTitle('');
      setUploadCategory('clinic');
      setUploadOrder(0);
      setSelectedFile(null);
      setImageUrlInput('');
      fetchGallery();
    } catch (err) {
      toast.dismiss('gallery-upload-toast');
      toast.error(err?.response?.data?.message || err?.message || 'Failed to upload image.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleOpenEdit = (img) => {
    setEditingItem(img);
    setEditTitle(img.title || '');
    setEditCategory(img.category || 'clinic');
    setEditOrder(img.order || 0);
    setEditIsActive(img.isActive ?? true);
    setEditModalOpen(true);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!editingItem) return;

    setIsUpdating(true);
    try {
      await updateGalleryItem(editingItem.id, {
        title: editTitle.trim(),
        category: editCategory,
        order: Number(editOrder) || 0,
        isActive: editIsActive,
      });
      toast.success('Gallery item updated');
      setEditModalOpen(false);
      fetchGallery();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update item.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = (id) => {
    setDeleteDialog({ isOpen: true, id });
  };

  const confirmDelete = async () => {
    try {
      await deleteGalleryItem(deleteDialog.id);
      setImages((prev) => prev.filter((img) => img.id !== deleteDialog.id));
      toast.success('Image deleted from gallery');
    } catch (err) {
      toast.error('Failed to delete image.');
    } finally {
      setDeleteDialog({ isOpen: false, id: null });
    }
  };

  const filterTabs = ['all', ...categories];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Gallery Management</h2>
          <p className="text-sm text-gray-500">Upload facility photos, treatments, and events to the gallery</p>
        </div>
      </div>

      {/* Upload Area */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Upload size={18} className="text-primary-600" />
          <span>Upload New Image</span>
        </h3>

        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <ImageUploader
            label="Select Photo"
            currentImage={imageUrlInput}
            onImageSelect={(fileOrUrl) => {
              if (fileOrUrl instanceof File) {
                setSelectedFile(fileOrUrl);
                setImageUrlInput('');
              } else {
                setSelectedFile(null);
                setImageUrlInput(fileOrUrl || '');
              }
            }}
            onUrlChange={(url) => {
              setSelectedFile(null);
              setImageUrlInput(url);
            }}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title / Caption
              </label>
              <input
                type="text"
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                placeholder="e.g. Traditional Therapy Room"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1880B8] focus:border-[#1880B8]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={uploadCategory}
                onChange={(e) => setUploadCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1880B8] focus:border-[#1880B8] capitalize"
              >
                {categories.map((c) => (
                  <option key={c} value={c} className="capitalize">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Order
              </label>
              <input
                type="number"
                value={uploadOrder}
                onChange={(e) => setUploadOrder(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1880B8] focus:border-[#1880B8]"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isUploading || (!selectedFile && !imageUrlInput)}
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
            >
              <Plus size={18} />
              <span>{isUploading ? 'Uploading...' : 'Save to Gallery'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {filterTabs.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize whitespace-nowrap cursor-pointer transition-colors ${
              filter === c
                ? 'bg-primary-600 text-white shadow-xs'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Gallery Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading gallery items...</div>
      ) : images.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200 text-gray-500">
          No gallery images found for category "{filter}". Upload an image above to get started!
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {images.map((img) => (
            <div
              key={img.id}
              className="bg-white rounded-xl shadow-xs overflow-hidden border border-gray-200 group transition-all hover:shadow-md"
            >
              <div className="relative h-48 bg-gray-100">
                <img
                  src={img.url}
                  alt={img.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/images/front-image.jpg';
                  }}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    onClick={() => handleOpenEdit(img)}
                    aria-label="Edit image details"
                    className="p-2 bg-white rounded-full text-gray-700 hover:text-primary-600 cursor-pointer transition-colors shadow-sm"
                    title="Edit"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(img.id)}
                    aria-label="Delete image"
                    className="p-2 bg-white rounded-full text-red-600 hover:text-red-800 cursor-pointer transition-colors shadow-sm"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="p-3.5 flex justify-between items-center">
                <div className="min-w-0 pr-2">
                  <h4 className="font-medium text-gray-900 truncate text-sm">{img.title}</h4>
                  <span className="text-xs text-gray-500 capitalize">{img.category}</span>
                </div>
                {!img.isActive && (
                  <span className="shrink-0 text-[10px] bg-red-100 text-red-700 font-medium px-2 py-0.5 rounded-full">
                    Hidden
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Gallery Item Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Gallery Image"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleUpdateSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title / Caption
            </label>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1880B8] focus:border-[#1880B8]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={editCategory}
              onChange={(e) => setEditCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1880B8] focus:border-[#1880B8] capitalize"
            >
              {categories.map((c) => (
                <option key={c} value={c} className="capitalize">
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Display Order
            </label>
            <input
              type="number"
              value={editOrder}
              onChange={(e) => setEditOrder(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1880B8] focus:border-[#1880B8]"
            />
          </div>

          <div className="pt-2">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={editIsActive}
                onChange={(e) => setEditIsActive(e.target.checked)}
                className="rounded text-[#1880B8] focus:ring-[#1880B8] h-4 w-4"
              />
              <span className="text-sm font-medium text-gray-700">Active (Visible in Gallery)</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setEditModalOpen(false)}
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm cursor-pointer disabled:opacity-70"
            >
              {isUpdating ? 'Saving...' : 'Update Details'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, id: null })}
        onConfirm={confirmDelete}
        title="Delete Image"
        message="Are you sure you want to delete this image from the gallery? This action cannot be undone."
      />
    </div>
  );
};

export default Gallery;
