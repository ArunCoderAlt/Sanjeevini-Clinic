import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Calendar, 
  Clock, 
  MapPin, 
  Sparkles, 
  CheckCircle2, 
  Star,
  Search,
  Filter
} from 'lucide-react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import toast from 'react-hot-toast';
import { 
  getSwarnaBinduSchedule, 
  createSwarnaBinduScheduleItem, 
  updateSwarnaBinduScheduleItem, 
  deleteSwarnaBinduScheduleItem 
} from '../../services/swarnaBinduService';

const initialScheduleForm = {
  month: 'November',
  date: '2026-11-28',
  day: 'Saturday',
  nakshatra: 'Pushya (Poosam)',
  timings: '5:00 PM – 9:30 PM',
  venue: 'Sanjeevini Medical Centre, Karaikal',
  status: 'Upcoming',
  notes: 'Registration Open',
  order: 13,
  isActive: true
};

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const SwarnaBinduAdmin = () => {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState(initialScheduleForm);
  const [submitting, setSubmitting] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null });
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchSchedule = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getSwarnaBinduSchedule({ all: 'true' });
      const data = res.data?.data || [];
      setSchedule(data);
    } catch (err) {
      toast.error('Failed to load schedule dates.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  const handleDateChange = (val) => {
    const updated = { ...formData, date: val };
    try {
      const parsedDate = new Date(val);
      if (!isNaN(parsedDate.getTime())) {
        const dayName = DAYS_OF_WEEK[parsedDate.getDay()];
        const monthName = MONTHS[parsedDate.getMonth()];
        updated.day = dayName;
        updated.month = monthName;
      }
    } catch (e) {
      // Keep manual if parse fails
    }
    setFormData(updated);
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      ...initialScheduleForm,
      order: schedule.length + 1
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      month: item.month || 'November',
      date: item.date || '',
      day: item.day || 'Saturday',
      nakshatra: item.nakshatra || 'Pushya (Poosam)',
      timings: item.timings || '5:00 PM – 9:30 PM',
      venue: item.venue || 'Sanjeevini Medical Centre, Karaikal',
      status: item.status || 'Upcoming',
      notes: item.notes || '',
      order: item.order !== undefined ? item.order : 1,
      isActive: item.isActive !== undefined ? item.isActive : true
    });
    setModalOpen(true);
  };

  const handleQuickMarkNext = async (item, e) => {
    e?.stopPropagation();
    try {
      // First update current items so no other is "Next Camp"
      const updatedList = schedule.map((s) => {
        const id = s.id || s._id;
        const currentId = item.id || item._id;
        if (id === currentId) {
          return { ...s, status: 'Next Camp' };
        } else if (s.status === 'Next Camp') {
          return { ...s, status: 'Upcoming' };
        }
        return s;
      });
      setSchedule(updatedList);

      await updateSwarnaBinduScheduleItem(item.id || item._id, {
        ...item,
        status: 'Next Camp'
      });
      toast.success(`Marked ${item.date} as Next Camp!`);
    } catch (err) {
      toast.error('Failed to update status.');
      fetchSchedule();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.month || !formData.date || !formData.day) {
      toast.error('Month, Date, and Day are required fields.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingItem) {
        const id = editingItem.id || editingItem._id;
        await updateSwarnaBinduScheduleItem(id, formData);
        toast.success('Pushya Nakshatra schedule entry updated!');
      } else {
        await createSwarnaBinduScheduleItem(formData);
        toast.success('New schedule entry added successfully!');
      }

      setModalOpen(false);
      fetchSchedule();
    } catch (err) {
      toast.error('Failed to save schedule. Please check inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (row) => {
    setDeleteDialog({ isOpen: true, id: row.id || row._id });
  };

  const confirmDelete = async () => {
    try {
      await deleteSwarnaBinduScheduleItem(deleteDialog.id);
      toast.success('Schedule entry deleted successfully');
      setSchedule((prev) => prev.filter((item) => (item.id || item._id) !== deleteDialog.id));
    } catch (err) {
      toast.error('Failed to delete schedule entry.');
    } finally {
      setDeleteDialog({ isOpen: false, id: null });
    }
  };

  const filteredSchedule = schedule.filter((item) => {
    if (statusFilter === 'all') return true;
    return item.status === statusFilter;
  });

  const columns = [
    {
      key: 'month',
      label: 'Month',
      sortable: true,
      render: (val, row) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#144979]" />
          <span className="font-bold text-slate-900">{val}</span>
        </div>
      )
    },
    {
      key: 'date',
      label: 'Camp Date & Day',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="font-semibold text-slate-900 block">{val}</span>
          <span className="text-xs text-slate-500 font-medium">{row.day}</span>
        </div>
      )
    },
    {
      key: 'nakshatra',
      label: 'Auspicious Star',
      render: (val) => (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-200">
          <Sparkles className="w-3 h-3 text-amber-600" />
          {val || 'Pushya (Poosam)'}
        </span>
      )
    },
    {
      key: 'timings',
      label: 'Camp Timings',
      render: (val) => (
        <span className="text-xs font-medium text-slate-700 flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          {val || '5:00 PM – 9:30 PM'}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (val, row) => {
        if (val === 'Next Camp') {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-400 text-slate-950 shadow-xs">
              <Star className="w-3 h-3 fill-slate-950" />
              Next Camp
            </span>
          );
        }
        if (val === 'Upcoming') {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 border border-sky-200">
              Upcoming
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Completed
          </span>
        );
      }
    },
    {
      key: 'notes',
      label: 'Particulars / Notes',
      render: (val, row) => (
        <div className="max-w-xs">
          <p className="text-xs text-slate-700 truncate" title={val || '—'}>{val || '—'}</p>
          <p className="text-[11px] text-slate-400 truncate" title={row.venue}>{row.venue}</p>
        </div>
      )
    },
    {
      key: 'quickAction',
      label: 'Spotlight',
      render: (_, row) => {
        if (row.status === 'Next Camp') {
          return (
            <span className="text-xs font-bold text-amber-600">Current Spotlight</span>
          );
        }
        return (
          <button
            onClick={(e) => handleQuickMarkNext(row, e)}
            className="text-xs font-semibold text-[#144979] hover:text-[#0C2B4B] hover:underline cursor-pointer"
            title="Set as the featured Next Camp on website"
          >
            Set as Next
          </button>
        );
      }
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-500" />
            Pushya Nakshatra Schedule Particulars
          </h2>
          <p className="text-sm text-slate-500">
            Manage monthly Swarna Bindu Prashana camp dates, timings, venues, and status shown on the public tab
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#144979] text-white rounded-lg font-medium shadow-sm hover:bg-[#0C2B4B] transition-colors cursor-pointer"
          >
            <Plus size={18} />
            <span>Add Camp Date</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <span className="text-xs font-semibold text-slate-500 mr-2 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> Filter by Status:
        </span>
        {['all', 'Next Camp', 'Upcoming', 'Completed'].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              statusFilter === s 
                ? 'bg-[#144979] text-white' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {s === 'all' ? 'All Dates' : s}
          </button>
        ))}
      </div>

      {/* Schedule DataTable */}
      <DataTable
        columns={columns}
        data={filteredSchedule}
        loading={loading}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
        emptyMessage="No Pushya Nakshatra schedule dates configured."
      />

      {/* Add / Edit Schedule Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingItem ? 'Edit Pushya Nakshatra Camp Particulars' : 'Add New Pushya Nakshatra Date'}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Camp Date *
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg text-sm border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#144979]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Day of Week *
              </label>
              <select
                value={formData.day}
                onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg text-sm border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#144979]"
              >
                {DAYS_OF_WEEK.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Month Name *
              </label>
              <select
                value={formData.month}
                onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg text-sm border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#144979]"
              >
                {MONTHS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Auspicious Star / Nakshatra
              </label>
              <input
                type="text"
                placeholder="e.g. Pushya (Poosam)"
                value={formData.nakshatra}
                onChange={(e) => setFormData({ ...formData, nakshatra: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg text-sm border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#144979]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Camp Timings *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 5:00 PM – 9:30 PM or All Day"
                value={formData.timings}
                onChange={(e) => setFormData({ ...formData, timings: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg text-sm border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#144979]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Camp Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg text-sm border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#144979]"
              >
                <option value="Next Camp">Next Camp (Featured Spotlight)</option>
                <option value="Upcoming">Upcoming</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Venue / Location Particulars
            </label>
            <input
              type="text"
              placeholder="e.g. Sanjeevini Medical Centre, Karaikal"
              value={formData.venue}
              onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg text-sm border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#144979]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Special Notes / Particulars (shown on schedule table)
            </label>
            <input
              type="text"
              placeholder="e.g. Mega Camp — Pre-registration open"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg text-sm border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#144979]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Display Order Sequence
              </label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
                className="w-full px-3.5 py-2.5 rounded-lg text-sm border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#144979]"
              />
            </div>

            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded text-[#144979] focus:ring-[#144979]"
                />
                <span className="text-xs font-semibold text-slate-700">Active (Visible on page)</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 text-sm font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-[#144979] text-white rounded-lg hover:bg-[#0C2B4B] text-sm font-semibold shadow-sm cursor-pointer"
            >
              {submitting ? 'Saving...' : editingItem ? 'Update Particulars' : 'Add to Schedule'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, id: null })}
        onConfirm={confirmDelete}
        title="Delete Schedule Entry"
        message="Are you sure you want to delete this Pushya Nakshatra date? It will be removed from the public schedule."
        confirmText="Delete Date"
        variant="danger"
      />
    </div>
  );
};

export default SwarnaBinduAdmin;