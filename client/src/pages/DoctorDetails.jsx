import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft } from 'lucide-react';
import PageTransition from '../components/common/PageTransition';
import Container from '../components/common/Container';
import DoctorProfile from '../components/doctors/DoctorProfile';
import { getDoctorBySlug } from '../services/doctorService';
import Loading from '../components/common/Loading';

const fallbackDoctors = {
  'dr-thiagarajan-saminadane': {
    name: 'Dr. Thiagarajan Saminadane',
    qualification: 'MD (Siddha)',
    specialization: 'Siddha Medicine',
    experience: '15+ Years',
    languages: ['Tamil', 'English'],
    bio: 'Specialist in chronic lifestyle disorders, arthritis, skin diseases, and traditional Siddha pulse diagnosis (Nadi Parikshai). Experienced in individualized herbal formulations and Varmam therapeutic point stimulation.',
    achievements: [
      'Gold Medalist in Siddha Medicine',
      'Over 15,000 successful patient consultations',
      'Published research on traditional Varmam therapies'
    ]
  },
  'thiagarajan-saminadane': {
    name: 'Dr. Thiagarajan Saminadane',
    qualification: 'MD (Siddha)',
    specialization: 'Siddha Medicine',
    experience: '15+ Years',
    languages: ['Tamil', 'English'],
    bio: 'Specialist in chronic lifestyle disorders, arthritis, skin diseases, and traditional Siddha pulse diagnosis (Nadi Parikshai). Experienced in individualized herbal formulations and Varmam therapeutic point stimulation.',
    achievements: [
      'Gold Medalist in Siddha Medicine',
      'Over 15,000 successful patient consultations',
      'Published research on traditional Varmam therapies'
    ]
  },
  'dr-subashini-ganesan': {
    name: 'Dr. Subashini Ganesan',
    qualification: 'BAMS (Ayurveda)',
    specialization: 'Ayurveda',
    experience: '12+ Years',
    languages: ['Tamil', 'English', 'Hindi'],
    bio: 'Expert in classical Ayurvedic treatments, Panchakarma therapy, women’s reproductive health, digestive disorders, and stress management. Dedicated to balancing the Tridoshas through holistic lifestyle adjustments.',
    achievements: [
      'Certified Panchakarma Specialist',
      'Keynote speaker at National Ayurveda Summit',
      'Specialist in holistic maternal and postpartum wellness'
    ]
  },
  'subashini-ganesan': {
    name: 'Dr. Subashini Ganesan',
    qualification: 'BAMS (Ayurveda)',
    specialization: 'Ayurveda',
    experience: '12+ Years',
    languages: ['Tamil', 'English', 'Hindi'],
    bio: 'Expert in classical Ayurvedic treatments, Panchakarma therapy, women’s reproductive health, digestive disorders, and stress management. Dedicated to balancing the Tridoshas through holistic lifestyle adjustments.',
    achievements: [
      'Certified Panchakarma Specialist',
      'Keynote speaker at National Ayurveda Summit',
      'Specialist in holistic maternal and postpartum wellness'
    ]
  }
};

const DoctorDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);

    getDoctorBySlug(slug)
      .then((res) => {
        const data = res.data.data || res.data;
        if (data && data.name) {
          setDoctor(data);
        } else {
          // Check fallback
          const fallback = fallbackDoctors[slug.toLowerCase()] ||
            (slug.toLowerCase().includes('thiagarajan') ? fallbackDoctors['dr-thiagarajan-saminadane'] : null) ||
            (slug.toLowerCase().includes('subashini') ? fallbackDoctors['dr-subashini-ganesan'] : null);
          if (fallback) {
            setDoctor(fallback);
          } else {
            setError('Doctor profile not found.');
          }
        }
      })
      .catch(() => {
        // Fallback to established clinic doctor
        const fallback = fallbackDoctors[slug.toLowerCase()] ||
          (slug.toLowerCase().includes('thiagarajan') ? fallbackDoctors['dr-thiagarajan-saminadane'] : null) ||
          (slug.toLowerCase().includes('subashini') ? fallbackDoctors['dr-subashini-ganesan'] : null);
        if (fallback) {
          setDoctor(fallback);
        } else {
          setError('Doctor profile not found.');
        }
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <PageTransition><Loading fullPage /></PageTransition>;

  if (error || !doctor) {
    return (
      <PageTransition>
        <div className="bg-cream min-h-screen py-20">
          <Container>
            <button onClick={() => navigate('/doctors')} className="flex items-center text-primary-700 hover:text-primary-600 mb-8 transition-colors">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Team
            </button>
            <div className="text-center py-20">
              <h1 className="text-3xl font-serif text-primary-700 mb-4">Doctor Not Found</h1>
              <p className="text-gray-600">{error || 'The doctor profile you are looking for does not exist.'}</p>
            </div>
          </Container>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <Helmet>
        <title>{doctor.name} | Sanjeevini Medical Centre</title>
        <meta name="description" content={`Learn about ${doctor.name}, ${doctor.specialization} at Sanjeevini Siddha & Ayurveda Medical Centre.`} />
      </Helmet>
      <div className="bg-cream min-h-screen py-20">
        <Container>
          <button onClick={() => navigate('/doctors')} className="flex items-center text-primary-700 hover:text-primary-600 mb-8 transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Team
          </button>
          <DoctorProfile doctor={doctor} />
        </Container>
      </div>
    </PageTransition>
  );
};

export default DoctorDetails;
