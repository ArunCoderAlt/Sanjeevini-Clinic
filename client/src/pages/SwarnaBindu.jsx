import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  Sparkles, 
  Baby, 
  CheckCircle2
} from 'lucide-react';
import Container from '../components/common/Container';
import PageTransition from '../components/common/PageTransition';
import { defaultPushyaSchedule } from '../data/swarnaBinduData';
import { getSwarnaBinduSchedule } from '../services/swarnaBinduService';
import { useAppContext } from '../context/AppContext';

const SwarnaBindu = () => {
  const [schedule, setSchedule] = useState(defaultPushyaSchedule);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'upcoming', 'completed'
  const { dataVersion } = useAppContext();

  useEffect(() => {
    getSwarnaBinduSchedule()
      .then((res) => {
        const data = res.data?.data;
        if (Array.isArray(data) && data.length > 0) {
          setSchedule(data);
        }
      })
      .catch((err) => {
        console.warn('Loading fallback Swarna Bindu schedule:', err);
      })
      .finally(() => setLoading(false));
  }, [dataVersion]);

  const filteredSchedule = schedule.filter((item) => {
    if (filter === 'upcoming') {
      return item.status === 'Next Camp' || item.status === 'Upcoming';
    }
    if (filter === 'completed') {
      return item.status === 'Completed';
    }
    return true;
  });

  return (
    <PageTransition>
      <Helmet>
        <title>Swarna Bindu Drops (அமிர்த கனக சஞ்சீவி) Schedule 2026 | Sanjeevini Medical Centre</title>
        <meta name="description" content="Official Pushya Nakshatra Swarna Bindu Drops (அமிர்த கனக சஞ்சீவி) schedule and camp dates at Sanjeevini Siddha & Ayurveda Medical Centre, Karaikal." />
      </Helmet>

      {/* =========================================================================
          1. Clean Hero Header Section
          ========================================================================= */}
      <section className="relative pt-28 pb-16 md:pt-36 md:pb-20 bg-gradient-to-b from-[#0B233D] via-[#07192C] to-[#040E1A] text-white overflow-hidden">
        {/* Subtle radial glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-br from-amber-500/10 via-sky-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#38BDF8_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

        <Container className="relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs md:text-sm font-semibold tracking-wider uppercase mb-5"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Monthly Pediatric Immunisation Schedule</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-white tracking-tight mb-2 sm:mb-3"
          >
            Swarna Bindu <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500">Drops</span>
          </motion.h1>

          {/* Tamil Title: அமிர்த கனக சஞ்சீவி */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-sm sm:text-lg md:text-2xl font-bold tracking-wide mb-5 sm:mb-6 shadow-sm"
          >
            <span>அமிர்த கனக சஞ்சீவி</span>
          </motion.div>

          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-3xl mx-auto text-sm sm:text-base md:text-lg text-slate-300 font-light leading-relaxed mb-8"
          >
            An ancient pediatric Rasayana mentioned in <em>Kashyapa Samhita</em>, prepared with 24K purified Swarna Bhasma, Medhya herbs, cow ghee, and honey. Administered exclusively on auspicious <strong>Pushya Nakshatra</strong> days for children from birth to 16 years.
          </motion.p>

          {/* Quick Feature Badges */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto text-left"
          >
            <div className="bg-slate-900/60 backdrop-blur-md border border-slate-700/60 p-3.5 rounded-xl flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Formulation</p>
                <p className="text-xs sm:text-sm font-semibold text-white">24K Swarna Bhasma</p>
              </div>
            </div>

            <div className="bg-slate-900/60 backdrop-blur-md border border-slate-700/60 p-3.5 rounded-xl flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Frequency</p>
                <p className="text-xs sm:text-sm font-semibold text-white">Pushya Nakshatra</p>
              </div>
            </div>

            <div className="bg-slate-900/60 backdrop-blur-md border border-slate-700/60 p-3.5 rounded-xl flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <Baby className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Beneficiaries</p>
                <p className="text-xs sm:text-sm font-semibold text-white">Age 0 to 16 Years</p>
              </div>
            </div>

            <div className="bg-slate-900/60 backdrop-blur-md border border-slate-700/60 p-3.5 rounded-xl flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Supervision</p>
                <p className="text-xs sm:text-sm font-semibold text-white">Expert Physicians</p>
              </div>
            </div>
          </motion.div>
        </Container>
      </section>

      {/* =========================================================================
          2. Pushya Nakshatra Schedule Section (Table & Details)
          ========================================================================= */}
      <section className="py-16 md:py-20 bg-gradient-to-b from-[#F0F6FC] via-white to-[#E8F2FA]">
        <Container>
          <div className="max-w-5xl mx-auto">
            {/* Header & Filter Controls */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/80 border border-amber-300 text-amber-900 text-xs font-bold uppercase tracking-wider mb-2">
                  <Calendar className="w-3.5 h-3.5 text-amber-600" />
                  Vedic Calendar 2026
                </span>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-slate-900">
                  Pushya Nakshatra Schedule
                </h2>
                <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-xl">
                  Monthly camp schedule for Swarna Bindu Drops (அமிர்த கனக சஞ்சீவி) administration at Sanjeevini Medical Centre.
                </p>
              </div>

              {/* Status Filter Tabs */}
              <div className="inline-flex p-1 bg-slate-200/80 rounded-xl self-start md:self-auto">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    filter === 'all' 
                      ? 'bg-white text-slate-900 shadow-sm' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All Dates ({schedule.length})
                </button>
                <button
                  onClick={() => setFilter('upcoming')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    filter === 'upcoming' 
                      ? 'bg-[#144979] text-white shadow-sm' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Upcoming / Next
                </button>
                <button
                  onClick={() => setFilter('completed')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    filter === 'completed' 
                      ? 'bg-white text-slate-900 shadow-sm' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Completed
                </button>
              </div>
            </div>

            {/* Mobile swipe helper */}
            <div className="flex sm:hidden justify-end mb-2">
              <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                ← Swipe table horizontally →
              </span>
            </div>

            {/* Schedule Table */}
            <div className="bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-md">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-[#0B233D] text-white">
                    <tr>
                      <th className="py-3 sm:py-4 px-3 sm:px-6 font-semibold text-xs uppercase tracking-wider">Month</th>
                      <th className="py-3 sm:py-4 px-3 sm:px-6 font-semibold text-xs uppercase tracking-wider">Camp Date</th>
                      <th className="py-3 sm:py-4 px-3 sm:px-6 font-semibold text-xs uppercase tracking-wider">Day</th>
                      <th className="py-3 sm:py-4 px-3 sm:px-6 font-semibold text-xs uppercase tracking-wider">Star / Nakshatra</th>
                      <th className="py-3 sm:py-4 px-3 sm:px-6 font-semibold text-xs uppercase tracking-wider">Timings</th>
                      <th className="py-3 sm:py-4 px-3 sm:px-6 font-semibold text-xs uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {filteredSchedule.map((row, idx) => {
                      const isNext = row.status === 'Next Camp';
                      const isUpcoming = row.status === 'Upcoming';
                      const isCompleted = row.status === 'Completed';

                      return (
                        <tr 
                          key={row.id || idx} 
                          className={`transition-colors ${
                            isNext 
                              ? 'bg-amber-50/70 hover:bg-amber-50' 
                              : idx % 2 === 0 
                              ? 'bg-white hover:bg-sky-50/50' 
                              : 'bg-slate-50/50 hover:bg-sky-50/50'
                          }`}
                        >
                          {/* Month */}
                          <td className="py-3 sm:py-4 px-3 sm:px-6 font-bold text-[#144979] flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#144979]/30" />
                            <span>{row.month}</span>
                          </td>

                          {/* Camp Date */}
                          <td className="py-3 sm:py-4 px-3 sm:px-6 font-semibold text-slate-900">
                            {row.date}
                          </td>

                          {/* Day */}
                          <td className="py-3 sm:py-4 px-3 sm:px-6 text-slate-600">
                            {row.day}
                          </td>

                          {/* Nakshatra */}
                          <td className="py-3 sm:py-4 px-3 sm:px-6">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-200/60">
                              <Sparkles className="w-3 h-3 text-amber-600" />
                              {row.nakshatra}
                            </span>
                          </td>

                          {/* Timings */}
                          <td className="py-3 sm:py-4 px-3 sm:px-6 font-medium text-slate-700">
                            <span className="flex items-center gap-1 text-xs">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              {row.timings}
                            </span>
                          </td>

                          {/* Status & Particulars */}
                          <td className="py-3 sm:py-4 px-3 sm:px-6">
                            <div className="flex flex-col gap-1 items-start">
                              {isNext ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400 text-slate-950 shadow-xs animate-pulse">
                                  <span className="w-1.5 h-1.5 rounded-full bg-slate-950" />
                                  Next Camp
                                </span>
                              ) : isUpcoming ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-100 text-sky-800 border border-sky-200">
                                  Upcoming
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  Completed
                                </span>
                              )}
                              {row.notes && (
                                <span className="text-[11px] text-slate-500 max-w-[200px] truncate" title={row.notes}>
                                  {row.notes}
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {filteredSchedule.length === 0 && (
                <div className="py-12 text-center text-slate-500 text-sm">
                  No schedule entries found for the selected filter.
                </div>
              )}
            </div>
          </div>
        </Container>
      </section>
    </PageTransition>
  );
};

export default SwarnaBindu;