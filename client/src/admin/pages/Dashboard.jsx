import React, { useState, useEffect } from 'react';
import { Calendar, Mail, MessageSquare, Stethoscope } from 'lucide-react';
import { Link } from 'react-router-dom';
import StatsCard from '../components/StatsCard';
import DataTable from '../components/DataTable';
import api from '../../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    appointments: 0,
    pendingAppointments: 0,
    messages: 0,
    unreadMessages: 0,
    testimonials: 0,
    doctors: 0
  });
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [recentMessages, setRecentMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [apptRes, msgRes, testRes, docRes] = await Promise.allSettled([
          api.get('/appointments'),
          api.get('/contact'),
          api.get('/testimonials'),
          api.get('/doctors'),
        ]);

        // Appointments
        if (apptRes.status === 'fulfilled') {
          const appts = apptRes.value.data.data || [];
          const pending = appts.filter(a => a.status === 'pending').length;
          setStats(prev => ({ ...prev, appointments: appts.length, pendingAppointments: pending }));
          setRecentAppointments(
            appts.slice(0, 5).map(a => ({
              id: a._id,
              name: a.name,
              date: a.preferredDate ? new Date(a.preferredDate).toLocaleDateString('en-IN') : '—',
              time: a.preferredTime || '—',
              status: a.status ? a.status.charAt(0).toUpperCase() + a.status.slice(1) : '—',
            }))
          );
        }

        // Messages
        if (msgRes.status === 'fulfilled') {
          const msgs = msgRes.value.data.data || [];
          const unread = msgs.filter(m => !m.isRead).length;
          setStats(prev => ({ ...prev, messages: msgs.length, unreadMessages: unread }));
          setRecentMessages(
            msgs.slice(0, 5).map(m => ({
              id: m._id,
              name: m.name,
              subject: m.subject || '(No subject)',
              date: m.createdAt ? new Date(m.createdAt).toLocaleDateString('en-IN') : '—',
            }))
          );
        }

        // Testimonials
        if (testRes.status === 'fulfilled') {
          const tests = testRes.value.data.data || [];
          setStats(prev => ({ ...prev, testimonials: tests.length }));
        }

        // Doctors
        if (docRes.status === 'fulfilled') {
          const docs = docRes.value.data.data || [];
          setStats(prev => ({ ...prev, doctors: docs.length }));
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const appointmentCols = [
    { key: 'name', label: 'Patient Name' },
    { key: 'date', label: 'Date' },
    { key: 'time', label: 'Time' },
    {
      key: 'status',
      label: 'Status',
      render: (val) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium
          ${val === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
            val === 'Confirmed' ? 'bg-sky-100 text-[#1880B8]' :
            val === 'Completed' ? 'bg-blue-100 text-blue-800' :
            'bg-gray-100 text-gray-800'}`}
        >
          {val}
        </span>
      )
    },
  ];

  const messageCols = [
    { key: 'name', label: 'Sender' },
    { key: 'subject', label: 'Subject' },
    { key: 'date', label: 'Date' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Appointments"
          value={stats.appointments}
          icon={Calendar}
          color="blue"
          change={`+${stats.pendingAppointments} pending`}
        />
        <StatsCard
          title="Total Messages"
          value={stats.messages}
          icon={Mail}
          color="orange"
          change={`+${stats.unreadMessages} unread`}
        />
        <StatsCard
          title="Testimonials"
          value={stats.testimonials}
          icon={MessageSquare}
          color="purple"
        />
        <StatsCard
          title="Active Doctors"
          value={stats.doctors}
          icon={Stethoscope}
          color="blue"
        />
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Recent Appointments</h3>
            <Link to="/admin/appointments" className="text-sm text-[#1880B8] hover:underline">View All</Link>
          </div>
          <DataTable
            columns={appointmentCols}
            data={recentAppointments}
            loading={loading}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Recent Messages</h3>
            <Link to="/admin/messages" className="text-sm text-[#1880B8] hover:underline">View All</Link>
          </div>
          <DataTable
            columns={messageCols}
            data={recentMessages}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
