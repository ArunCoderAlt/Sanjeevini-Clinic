import React, { useState, useEffect, useCallback } from 'react';
import DataTable from '../components/DataTable';
import ConfirmDialog from '../components/ConfirmDialog';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import {
  getAppointments,
  updateStatus,
  deleteAppointment,
} from '../../services/appointmentService';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null });
  const [viewModal, setViewModal] = useState({ isOpen: false, data: null });

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAppointments();
      const data = res.data.data || [];
      setAppointments(data);
    } catch (err) {
      if (err.response?.status !== 401) {
        toast.error(err.response?.data?.message || 'Failed to load appointments.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateStatus(id, newStatus.toLowerCase());
      setAppointments((prev) =>
        prev.map((a) => (a._id === id ? { ...a, status: newStatus.toLowerCase() } : a))
      );
      if (viewModal.data && viewModal.data._id === id) {
        setViewModal((prev) => ({
          ...prev,
          data: { ...prev.data, status: newStatus.toLowerCase() },
        }));
      }
      toast.success(`Status updated to ${newStatus}`);
    } catch (err) {
      toast.error('Failed to update status.');
    }
  };

  const handleDelete = (row) => {
    setDeleteDialog({ isOpen: true, id: row._id });
  };

  const confirmDelete = async () => {
    try {
      await deleteAppointment(deleteDialog.id);
      setAppointments((prev) => prev.filter((a) => a._id !== deleteDialog.id));
      toast.success('Appointment deleted successfully');
    } catch (err) {
      toast.error('Failed to delete appointment.');
    } finally {
      setDeleteDialog({ isOpen: false, id: null });
    }
  };

  const handleView = (row) => {
    setViewModal({ isOpen: true, data: row });
  };

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'phone', label: 'Phone' },
    { key: 'service', label: 'Service' },
    {
      key: 'preferredDate',
      label: 'Date',
      sortable: true,
      render: (val) => (val ? new Date(val).toLocaleDateString('en-IN') : '—'),
    },
    { key: 'preferredTime', label: 'Time', render: (val) => val || '—' },
    {
      key: 'status',
      label: 'Status',
      render: (val, row) => (
        <select
          value={val ? val.charAt(0).toUpperCase() + val.slice(1) : 'Pending'}
          onChange={(e) => handleStatusChange(row._id, e.target.value)}
          className={`text-sm rounded-md border-gray-300 shadow-xs focus:border-[#1B5E3B] focus:ring focus:ring-[#1B5E3B] focus:ring-opacity-50 py-1 pl-2 pr-8 ${
            val === 'pending'
              ? 'bg-yellow-50 text-yellow-800 border-yellow-200'
              : val === 'confirmed'
              ? 'bg-blue-50 text-blue-800 border-blue-200'
              : val === 'completed'
              ? 'bg-green-50 text-green-800 border-green-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          <option value="Pending">Pending</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      ),
    },
  ];

  const tabs = ['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'];

  const filteredData =
    filter === 'All'
      ? appointments
      : appointments.filter((a) => a.status === filter.toLowerCase());

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Appointments Management</h2>
          <p className="text-sm text-gray-500">Review patient consultation requests and schedule appointments</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-1.5 rounded-lg shadow-xs border border-gray-200 inline-flex overflow-x-auto max-w-full">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
              filter === tab
                ? 'bg-[#EAF4EE] text-[#1B5E3B]'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={filteredData}
        onView={handleView}
        onDelete={handleDelete}
        loading={loading}
      />

      {/* View Appointment Details Modal */}
      <Modal
        isOpen={viewModal.isOpen}
        onClose={() => setViewModal({ isOpen: false, data: null })}
        title="Appointment Consultation Details"
        maxWidth="max-w-lg"
      >
        {viewModal.data && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Patient Name</span>
                <p className="text-base font-semibold text-gray-900 mt-0.5">{viewModal.data.name}</p>
              </div>
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</span>
                <p className="text-sm font-medium text-gray-800 mt-0.5">
                  <a href={`tel:${viewModal.data.phone}`} className="text-[#1B5E3B] hover:underline">
                    {viewModal.data.phone}
                  </a>
                </p>
              </div>
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</span>
                <p className="text-sm text-gray-700 mt-0.5">{viewModal.data.email || '—'}</p>
              </div>
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Age</span>
                <p className="text-sm text-gray-700 mt-0.5">{viewModal.data.age ? `${viewModal.data.age} yrs` : '—'}</p>
              </div>
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Selected Service</span>
                <p className="text-sm font-medium text-gray-900 mt-0.5">{viewModal.data.service}</p>
              </div>
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Preferred Date & Time</span>
                <p className="text-sm text-gray-700 mt-0.5">
                  {viewModal.data.preferredDate
                    ? new Date(viewModal.data.preferredDate).toLocaleDateString('en-IN')
                    : '—'}
                  {' '}({viewModal.data.preferredTime || 'Any'})
                </p>
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Health Concern / Message</span>
              <div className="mt-1 p-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {viewModal.data.message || 'No additional message provided.'}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Change Status:</span>
                <select
                  value={viewModal.data.status ? viewModal.data.status.charAt(0).toUpperCase() + viewModal.data.status.slice(1) : 'Pending'}
                  onChange={(e) => handleStatusChange(viewModal.data._id, e.target.value)}
                  className="text-sm border border-gray-300 rounded-md py-1 px-2.5"
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <button
                type="button"
                onClick={() => setViewModal({ isOpen: false, data: null })}
                className="bg-[#1B5E3B] hover:bg-[#2E7D5B] text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
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
        title="Delete Appointment"
        message="Are you sure you want to delete this appointment? This action cannot be undone."
      />
    </div>
  );
};

export default Appointments;
