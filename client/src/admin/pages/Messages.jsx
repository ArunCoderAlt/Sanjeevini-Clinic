import React, { useState, useEffect, useCallback } from 'react';
import DataTable from '../components/DataTable';
import ConfirmDialog from '../components/ConfirmDialog';
import Modal from '../components/Modal';
import { Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null });
  const [viewMessage, setViewMessage] = useState(null);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/contact');
      setMessages(res.data.data || []);
    } catch (err) {
      if (err.response?.status !== 401) {
        toast.error(err.response?.data?.message || 'Failed to load messages.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const toggleRead = async (id, currentStatus) => {
    try {
      if (!currentStatus) {
        await api.put(`/contact/${id}/read`);
      }
      setMessages((prev) =>
        prev.map((m) => (m._id === id ? { ...m, isRead: !m.isRead } : m))
      );
      if (viewMessage && viewMessage._id === id) {
        setViewMessage((prev) => ({ ...prev, isRead: !prev.isRead }));
      }
    } catch (err) {
      toast.error('Failed to update message status.');
    }
  };

  const handleDelete = (row) => {
    setDeleteDialog({ isOpen: true, id: row._id });
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/contact/${deleteDialog.id}`);
      setMessages((prev) => prev.filter((m) => m._id !== deleteDialog.id));
      if (viewMessage && viewMessage._id === deleteDialog.id) {
        setViewMessage(null);
      }
      toast.success('Message deleted successfully');
    } catch (err) {
      toast.error('Failed to delete message.');
    } finally {
      setDeleteDialog({ isOpen: false, id: null });
    }
  };

  const handleView = (row) => {
    setViewMessage(row);
    if (!row.isRead) {
      toggleRead(row._id, false);
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Sender Name',
      render: (val, row) => (
        <span className={!row.isRead ? 'font-bold text-gray-900' : 'text-gray-700'}>
          {val}
        </span>
      ),
    },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone', render: (val) => val || '—' },
    { key: 'subject', label: 'Subject', render: (val) => val || '(No subject)' },
    {
      key: 'createdAt',
      label: 'Date',
      sortable: true,
      render: (val) => (val ? new Date(val).toLocaleDateString('en-IN') : '—'),
    },
    {
      key: 'isRead',
      label: 'Status',
      render: (val, row) => (
        <button
          onClick={() => toggleRead(row._id, val)}
          className={`px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${
            val ? 'bg-gray-100 text-gray-600' : 'bg-blue-100 text-blue-800 font-bold'
          }`}
        >
          {val ? 'Read' : 'New'}
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Messages & Inquiries</h2>
          <p className="text-sm text-gray-500">Contact form submissions from website visitors</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={messages}
        onView={handleView}
        onDelete={handleDelete}
        loading={loading}
      />

      {/* View Message Modal */}
      <Modal
        isOpen={Boolean(viewMessage)}
        onClose={() => setViewMessage(null)}
        title="Message Inquiry Details"
        maxWidth="max-w-lg"
      >
        {viewMessage && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-base font-bold text-gray-900">{viewMessage.name}</h4>
                  <p className="text-sm text-gray-600">
                    <a href={`mailto:${viewMessage.email}`} className="text-[#1B5E3B] hover:underline">
                      {viewMessage.email}
                    </a>
                    {viewMessage.phone && ` • ${viewMessage.phone}`}
                  </p>
                </div>
                <span className="text-xs text-gray-400">
                  {viewMessage.createdAt ? new Date(viewMessage.createdAt).toLocaleString('en-IN') : '—'}
                </span>
              </div>
              <div className="pt-2 border-t border-gray-200">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Subject</span>
                <p className="text-sm font-medium text-gray-800 mt-0.5">{viewMessage.subject || '(No subject)'}</p>
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Message Body</span>
              <div className="mt-1.5 p-3.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
                {viewMessage.message}
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-gray-100">
              <a
                href={`mailto:${viewMessage.email}?subject=Re: ${encodeURIComponent(viewMessage.subject || 'Inquiry')}`}
                className="inline-flex items-center gap-1.5 bg-[#1B5E3B] hover:bg-[#2E7D5B] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <Mail size={16} />
                <span>Reply via Email</span>
              </a>
              <button
                type="button"
                onClick={() => setViewMessage(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, id: null })}
        onConfirm={confirmDelete}
        title="Delete Message"
        message="Are you sure you want to delete this message? This action cannot be undone."
      />
    </div>
  );
};

export default Messages;
