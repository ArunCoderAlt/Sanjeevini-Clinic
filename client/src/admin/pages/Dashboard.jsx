import { useState, useEffect } from 'react';
import { Mail, MessageSquare, Stethoscope, Heart, Pill } from 'lucide-react';
import { Link } from 'react-router-dom';
import StatsCard from '../components/StatsCard';
import DataTable from '../components/DataTable';
import api from '../../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    messages: 0,
    unreadMessages: 0,
    services: 0,
    treatments: 0,
    doctors: 0,
    testimonials: 0
  });
  const [recentMessages, setRecentMessages] = useState([]);
  const [recentTestimonials, setRecentTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [msgRes, srvRes, trtRes, docRes, testRes] = await Promise.allSettled([
          api.get('/contact'),
          api.get('/services'),
          api.get('/treatments'),
          api.get('/doctors'),
          api.get('/testimonials'),
        ]);

        // Messages
        if (msgRes.status === 'fulfilled') {
          const msgs = msgRes.value.data.data || [];
          const unread = msgs.filter(m => !m.isRead).length;
          setStats(prev => ({ ...prev, messages: msgs.length, unreadMessages: unread }));
          setRecentMessages(
            msgs.slice(0, 5).map(m => ({
              id: m._id || m.id,
              name: m.name,
              subject: m.message ? (m.message.slice(0, 45) + (m.message.length > 45 ? '...' : '')) : '(No message)',
              date: m.createdAt ? new Date(m.createdAt).toLocaleDateString('en-IN') : '—',
            }))
          );
        }

        // Services
        if (srvRes.status === 'fulfilled') {
          const srvs = srvRes.value.data.data || [];
          setStats(prev => ({ ...prev, services: srvs.length }));
        }

        // Treatments
        if (trtRes.status === 'fulfilled') {
          const trts = trtRes.value.data.data || [];
          setStats(prev => ({ ...prev, treatments: trts.length }));
        }

        // Doctors
        if (docRes.status === 'fulfilled') {
          const docs = docRes.value.data.data || [];
          setStats(prev => ({ ...prev, doctors: docs.length }));
        }

        // Testimonials
        if (testRes.status === 'fulfilled') {
          const tests = testRes.value.data.data || [];
          setStats(prev => ({ ...prev, testimonials: tests.length }));
          setRecentTestimonials(
            tests.slice(0, 5).map(t => ({
              id: t._id || t.id,
              name: t.name,
              rating: `${t.rating || 5} ★`,
              review: t.review ? (t.review.slice(0, 45) + (t.review.length > 45 ? '...' : '')) : '—',
              date: t.createdAt ? new Date(t.createdAt).toLocaleDateString('en-IN') : '—',
            }))
          );
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const messageCols = [
    { key: 'name', label: 'Sender' },
    { key: 'subject', label: 'Inquiry' },
    { key: 'date', label: 'Date' },
  ];

  const testimonialCols = [
    { key: 'name', label: 'Patient' },
    { key: 'rating', label: 'Rating' },
    { key: 'review', label: 'Review' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Patient Inquiries"
          value={stats.messages}
          icon={Mail}
          color="blue"
          change={`+${stats.unreadMessages} unread`}
        />
        <StatsCard
          title="Clinical Services"
          value={stats.services}
          icon={Heart}
          color="blue"
        />
        <StatsCard
          title="Specialized Treatments"
          value={stats.treatments}
          icon={Pill}
          color="purple"
        />
        <StatsCard
          title="Active Doctors"
          value={stats.doctors}
          icon={Stethoscope}
          color="orange"
        />
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800" style={{ color: '#0F172A' }}>Recent Patient Inquiries</h3>
            <Link to="/admin/messages" className="text-sm font-semibold text-[#144979] hover:underline">View All</Link>
          </div>
          <DataTable
            columns={messageCols}
            data={recentMessages}
            loading={loading}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800" style={{ color: '#0F172A' }}>Recent Testimonials</h3>
            <Link to="/admin/testimonials" className="text-sm font-semibold text-[#144979] hover:underline">View All</Link>
          </div>
          <DataTable
            columns={testimonialCols}
            data={recentTestimonials}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
