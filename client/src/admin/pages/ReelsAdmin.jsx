import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  Film,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  Play,
  Eye,
  Heart,
  Sparkles,
  Instagram,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
} from 'lucide-react';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import ImageUploader from '../components/ImageUploader';
import {
  getReels,
  createReel,
  updateReel,
  deleteReel,
} from '../../services/reelService';
import { uploadImage } from '../../services/uploadService';
import { clinicInfo } from '../../data/clinicInfo';

const predefinedTags = [
  'Panchakarma & Siddha',
  'Ayush Certified',
  'Siddha Diagnosis',
  'Energy Locks & Varmam',
  'Natural Pharmacy',
  'Doctor Insights',
  'Patient Recovery',
  'General Wellness',
];

const ReelsAdmin = () => {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReel, setEditingReel] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null });
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [tag, setTag] = useState('Panchakarma & Siddha');
  const [customTag, setCustomTag] = useState('');
  const [videoInput, setVideoInput] = useState('');
  const [startSec, setStartSec] = useState(0);
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [desc, setDesc] = useState('');
  const [likes, setLikes] = useState('2.5K');
  const [views, setViews] = useState('15.4K');
  const [instagramUrl, setInstagramUrl] = useState(clinicInfo.socialLinks.instagram);
  const [isActive, setIsActive] = useState(true);

  // Fetch Reels
  const fetchAllReels = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getReels({ all: 'true' });
      setReels(res.data.data || []);
    } catch (err) {
      if (err.response?.status !== 401) {
        toast.error('Failed to load reels.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllReels();
  }, [fetchAllReels]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingReel(null);
    setTitle('');
    setTag('Panchakarma & Siddha');
    setCustomTag('');
    setVideoInput('8oLZSitF20E');
    setStartSec(0);
    setThumbnailUrl('');
    setSelectedFile(null);
    setDesc('');
    setLikes('2.5K');
    setViews('15.4K');
    setInstagramUrl(clinicInfo.socialLinks.instagram);
    setIsActive(true);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (reel) => {
    setEditingReel(reel);
    setTitle(reel.title || '');
    if (predefinedTags.includes(reel.tag)) {
      setTag(reel.tag);
      setCustomTag('');
    } else {
      setTag('Other');
      setCustomTag(reel.tag || '');
    }
    setVideoInput(reel.videoId || '');
    setStartSec(reel.start || 0);
    setThumbnailUrl(reel.thumbnail || '');
    setSelectedFile(null);
    setDesc(reel.desc || '');
    setLikes(reel.likes || '2.5K');
    setViews(reel.views || '15.4K');
    setInstagramUrl(reel.instagramUrl || clinicInfo.socialLinks.instagram);
    setIsActive(reel.isActive !== false);
    setIsModalOpen(true);
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      return toast.error('Please enter a title for the reel.');
    }

    setSubmitting(true);
    try {
      let finalThumbnail = thumbnailUrl.trim();
      if (selectedFile instanceof File) {
        toast.loading('Uploading thumbnail image...', { id: 'reel-upload-toast' });
        finalThumbnail = await uploadImage(selectedFile);
        toast.dismiss('reel-upload-toast');
      }

      // Extract YouTube Video ID if full URL pasted
      let cleanVideoId = videoInput.trim();
      const ytMatch = cleanVideoId.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([\w-]{11})/);
      if (ytMatch && ytMatch[1]) {
        cleanVideoId = ytMatch[1];
      }

      if (!finalThumbnail && cleanVideoId) {
        finalThumbnail = `https://i.ytimg.com/vi/${cleanVideoId}/hq720.jpg`;
      }

      const finalTag = tag === 'Other' ? (customTag.trim() || 'Siddha Wellness') : tag;

      const payload = {
        title: title.trim(),
        tag: finalTag,
        videoId: cleanVideoId || '8oLZSitF20E',
        start: Number(startSec) || 0,
        thumbnail: finalThumbnail,
        desc: desc.trim(),
        likes: likes.trim() || '2.0K',
        views: views.trim() || '12.0K',
        instagramUrl: instagramUrl.trim() || clinicInfo.socialLinks.instagram,
        isActive,
      };

      if (editingReel) {
        await updateReel(editingReel.id || editingReel._id, payload);
        toast.success('Reel updated successfully!');
      } else {
        await createReel(payload);
        toast.success('New reel published! It is now the first reel on the website.');
      }

      setIsModalOpen(false);
      fetchAllReels();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save reel.');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Handler
  const handleDeleteConfirm = async () => {
    if (!deleteDialog.id) return;
    try {
      await deleteReel(deleteDialog.id);
      toast.success('Reel deleted successfully.');
      fetchAllReels();
    } catch (err) {
      toast.error('Failed to delete reel.');
    } finally {
      setDeleteDialog({ isOpen: false, id: null });
    }
  };

  // Toggle Active Status
  const handleToggleActive = async (reel) => {
    try {
      const updatedStatus = !reel.isActive;
      await updateReel(reel.id || reel._id, { isActive: updatedStatus });
      toast.success(updatedStatus ? 'Reel is now visible on website' : 'Reel is now hidden');
      fetchAllReels();
    } catch (err) {
      toast.error('Failed to update reel status.');
    }
  };

  const filteredReels = selectedTag === 'all'
    ? reels
    : reels.filter((r) => r.tag === selectedTag);

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-primary-900 via-primary-800 to-primary-900 p-6 md:p-8 rounded-2xl text-white shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold mb-3 border border-white/20">
            <Instagram className="w-3.5 h-3.5 text-pink-400" />
            <span>Website Instagram Reels Management</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-white">
            Instagram Reels
          </h1>
          <p className="text-white/80 text-sm mt-1 max-w-xl">
            Publish and manage video reels for the home page and gallery page. <strong className="text-gold">Newly posted reels automatically appear first in the carousel!</strong>
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gold hover:bg-gold/90 text-dark font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer flex-shrink-0"
        >
          <Plus className="w-5 h-5" />
          <span>Publish New Reel</span>
        </button>
      </div>

      {/* Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedTag('all')}
          className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
            selectedTag === 'all'
              ? 'bg-primary-700 text-white shadow-sm'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          All Reels ({reels.length})
        </button>
        {predefinedTags.map((t) => {
          const count = reels.filter((r) => r.tag === t).length;
          if (count === 0) return null;
          return (
            <button
              key={t}
              onClick={() => setSelectedTag(t)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                selectedTag === t
                  ? 'bg-primary-700 text-white shadow-sm'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {t} ({count})
            </button>
          );
        })}
      </div>

      {/* Reels Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-white rounded-2xl p-4 shadow-sm animate-pulse space-y-4">
              <div className="aspect-[9/16] bg-gray-200 rounded-xl" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredReels.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
          <Film className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-800">No reels found</h3>
          <p className="text-gray-500 text-sm mt-1 max-w-sm mx-auto">
            Click "Publish New Reel" above to add your first video reel to the website.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredReels.map((reel, index) => {
            const isFirst = index === 0;
            return (
              <div
                key={reel.id || reel._id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 flex flex-col group relative"
              >
                {/* 9:16 Preview Card */}
                <div className="relative aspect-[9/16] bg-neutral-900 overflow-hidden">
                  <img
                    src={reel.thumbnail || `https://i.ytimg.com/vi/${reel.videoId}/hq720.jpg`}
                    alt={reel.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/30" />

                  {/* Order / First Badge */}
                  {isFirst && (
                    <div className="absolute top-3 left-3 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500 text-white text-[10px] font-bold shadow-md uppercase tracking-wider">
                      <Sparkles className="w-3 h-3" />
                      <span>First in Carousel</span>
                    </div>
                  )}

                  {/* Active / Hidden Status Pill */}
                  <button
                    onClick={() => handleToggleActive(reel)}
                    className={`absolute top-3 right-3 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium backdrop-blur-md cursor-pointer transition-all ${
                      reel.isActive !== false
                        ? 'bg-emerald-500/90 text-white'
                        : 'bg-gray-800/90 text-gray-300'
                    }`}
                    title="Click to toggle visibility"
                  >
                    {reel.isActive !== false ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Active</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3" />
                        <span>Hidden</span>
                      </>
                    )}
                  </button>

                  {/* Middle Play Preview */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-white shadow-lg">
                      <Play className="w-6 h-6 ml-0.5" fill="white" />
                    </div>
                  </div>

                  {/* Bottom Reel Card Meta */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 z-10 text-white">
                    <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-amber-300 mb-1">
                      {reel.tag}
                    </span>
                    <h4 className="text-sm font-semibold line-clamp-2 leading-snug">
                      {reel.title}
                    </h4>
                    <div className="flex items-center gap-3 text-[11px] text-white/70 mt-1.5">
                      <span>{reel.views} views</span>
                      <span>•</span>
                      <span>{reel.likes} likes</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Card Actions */}
                <div className="p-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between mt-auto">
                  <a
                    href={reel.instagramUrl || clinicInfo.socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary-700 hover:text-primary-800 font-medium inline-flex items-center gap-1"
                    title="Open in Instagram"
                  >
                    <Instagram className="w-3.5 h-3.5 text-pink-500" />
                    <span>Instagram</span>
                  </a>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(reel)}
                      className="p-1.5 text-gray-500 hover:text-primary-700 hover:bg-white rounded-lg transition-colors cursor-pointer"
                      title="Edit Reel"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteDialog({ isOpen: true, id: reel.id || reel._id })}
                      className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
                      title="Delete Reel"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingReel ? 'Edit Instagram Reel' : 'Publish New Instagram Reel'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Instant Ordering:</strong> Newly published reels automatically appear at the <strong>very beginning (first position)</strong> of the carousel on the website.
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Reel Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Traditional Herbal Medicine & Pulse Diagnosis"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-600 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Category / Tag *
              </label>
              <select
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-600 text-sm bg-white"
              >
                {predefinedTags.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
                <option value="Other">Other (Custom Tag)</option>
              </select>
              {tag === 'Other' && (
                <input
                  type="text"
                  required
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  placeholder="Enter custom tag"
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-600 text-sm mt-2"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Video ID or YouTube / Shorts URL *
              </label>
              <input
                type="text"
                required
                value={videoInput}
                onChange={(e) => setVideoInput(e.target.value)}
                placeholder="e.g. 8oLZSitF20E or https://youtu.be/..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-600 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Start Time (Seconds)
              </label>
              <input
                type="number"
                min="0"
                value={startSec}
                onChange={(e) => setStartSec(e.target.value)}
                placeholder="0"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-600 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Likes Counter
              </label>
              <input
                type="text"
                value={likes}
                onChange={(e) => setLikes(e.target.value)}
                placeholder="e.g. 2.4K"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-600 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Views Counter
              </label>
              <input
                type="text"
                value={views}
                onChange={(e) => setViews(e.target.value)}
                placeholder="e.g. 18.5K"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-600 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Thumbnail Image (Upload File or Enter URL)
            </label>
            <div className="space-y-2">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedFile(e.target.files[0] || null)}
                className="text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 cursor-pointer"
              />
              <input
                type="url"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                placeholder="Or paste direct image URL (optional, auto-generates if empty)"
                className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-600 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Description / Doctor Note
            </label>
            <textarea
              rows={2}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Short description displayed on the reel card overlay..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-600 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Instagram Post or Profile URL
            </label>
            <input
              type="url"
              value={instagramUrl}
              onChange={(e) => setInstagramUrl(e.target.value)}
              placeholder="https://www.instagram.com/sami_thiagarajan"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-600 text-sm"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isActiveCheck"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500 cursor-pointer"
            />
            <label htmlFor="isActiveCheck" className="text-sm text-gray-700 cursor-pointer">
              Active (Visible immediately on the website)
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-primary-700 hover:bg-primary-800 text-white text-sm font-semibold shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Publishing...' : editingReel ? 'Update Reel' : 'Publish Reel Now'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Delete Instagram Reel"
        message="Are you sure you want to delete this reel? It will be removed from both the home page and gallery page."
        confirmText="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteDialog({ isOpen: false, id: null })}
      />
    </div>
  );
};

export default ReelsAdmin;
