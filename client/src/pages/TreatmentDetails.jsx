import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft } from 'lucide-react';
import PageTransition from '../components/common/PageTransition';
import Container from '../components/common/Container';
import TreatmentDetailsComponent from '../components/treatments/TreatmentDetails';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import { getTreatmentBySlug } from '../services/treatmentService';

const fallbackTreatments = {
  'gastrointestinal': {
    name: 'Gastrointestinal Treatments - வயிறு / குடல் சார்ந்த நோய்கள்',
    category: 'Gastrointestinal',
    image: '/uploads/GlowingGlassGastrointestinalSystem-1794425513998-591383.png',
    symptoms: ['Upper abdominal burning and ache', 'Nausea, bloating, and indigestion', 'Acid reflux and chest tightness', 'Loss of appetite'],
    approaches: ['Herbal pitta-pacifying formulations', 'Mucosal healing decoctions', 'Personalized dietary guidelines', 'Stress-reduction therapies']
  },
  'gastritis': {
    name: 'Gastritis & Ulcer Care',
    category: 'Gastrointestinal',
    image: '/uploads/GlowingGlassGastrointestinalSystem-1794425513998-591383.png',
    symptoms: ['Upper abdominal burning and ache', 'Nausea, bloating, and indigestion', 'Acid reflux and chest tightness', 'Loss of appetite'],
    approaches: ['Herbal pitta-pacifying formulations', 'Mucosal healing decoctions', 'Personalized dietary guidelines', 'Stress-reduction therapies']
  },
  'ibs': {
    name: 'Irritable Bowel Syndrome (IBS)',
    category: 'Gastrointestinal',
    symptoms: ['Abdominal cramping and bloating', 'Altered bowel habits and irregularity', 'Digestive gas and abdominal pressure', 'Food trigger sensitivity'],
    approaches: ['Gut microbiome rejuvenation', 'Medicated Takradhara therapy', 'Digestive enzyme stimulation', 'Herbal gut stabilizers']
  },
  'psoriasis': {
    name: 'Psoriasis & Eczema Care',
    category: 'Dermatology',
    symptoms: ['Dry, itchy, red patches on skin', 'Silvery scales and peeling', 'Skin inflammation and irritation', 'Cracked skin prone to bleeding'],
    approaches: ['Deep cellular blood purification', 'Traditional medicated herbal oils', 'Pitta-Raktha balancing herbal regimens', 'Strict natural dietary protocol']
  },
  'pcos': {
    name: 'PCOS & Women’s Health',
    category: 'Women\'s Health',
    symptoms: ['Irregular or delayed menstrual cycles', 'Hormonal weight fluctuations', 'Acne and unwanted facial hair', 'Fatigue and mood changes'],
    approaches: ['Endocrine-balancing herbal formulas', 'Metabolic correction regimens', 'Uterine tonics', 'Holistic nutrition and cycle tracking']
  },
  'arthritis': {
    name: 'Arthritis & Joint Pain Management',
    category: 'Musculoskeletal',
    symptoms: ['Joint stiffness, particularly in the morning', 'Chronic pain in knees, hips, or back', 'Swelling and reduced flexibility', 'Difficulty walking or bending'],
    approaches: ['Traditional Varmam vital-point therapy', 'Thokkanam medicated oil massage', 'Cartilage-strengthening herbal decoctions', 'Gentle rehabilitative movement']
  },
  'kidney-stones': {
    name: 'Kidney Stones Management',
    category: 'Kidney',
    symptoms: ['Sharp pain in lower back or side', 'Burning sensation during urination', 'Cloudy or discolored urine', 'Frequent urge to urinate'],
    approaches: ['Stone-dissolving (Lithotriptic) herbal formulations', 'Natural diuretic decoctions', 'Fluid-balance counseling', 'Preventive lifestyle counseling']
  },
  'asthma': {
    name: 'Asthma & Respiratory Care',
    category: 'Respiratory',
    symptoms: ['Shortness of breath and wheezing', 'Persistent dry or productive cough', 'Chest tightness and congestion', 'Sleep disruption due to breathing discomfort'],
    approaches: ['Airway clearance herbal formulations', 'Kapha-balancing steam inhalation', 'Immunity-modulating rasayanas', 'Pranayama breathing guidance']
  },
  'migraine': {
    name: 'Migraine & Neurological Relief',
    category: 'Neurology',
    symptoms: ['Throbbing pain on one side of head', 'Sensitivity to light and sound', 'Nausea, dizziness, or visual aura', 'Neck stiffness and fatigue'],
    approaches: ['Nasya herbal nasal administration', 'Shirodhara oil therapy', 'Nervous system soothing herbs', 'Identification and control of triggers']
  },
  'piles': {
    name: 'Anorectal Care (Piles, Fissure, Fistula)',
    category: 'Anorectal',
    symptoms: ['Pain or discomfort during bowel movements', 'Bleeding or swelling in anal region', 'Itching and persistent irritation', 'Chronic constipation and straining'],
    approaches: ['Non-surgical traditional Siddha medications', 'Medicated sitz baths (Avagaha sweda)', 'Digestive fire optimization', 'Topical healing oils and herbal pastes']
  },
  'diabetes': {
    name: 'Diabetes & Metabolic Wellness',
    category: 'Other',
    symptoms: ['Frequent urination and excessive thirst', 'Unexplained fatigue and low energy', 'Slow-healing cuts or skin sores', 'Tingling or numbness in hands/feet'],
    approaches: ['Insulin-sensitizing herbal preparations', 'Glycemic control through dietary herbs', 'Microvascular and nerve protection', 'Comprehensive lifestyle counseling']
  }
};

const TreatmentDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [treatment, setTreatment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);

    getTreatmentBySlug(slug)
      .then((res) => {
        const data = res.data.data || res.data;
        if (data && data.name) {
          setTreatment({
            ...data,
            symptoms: data.symptoms?.length ? data.symptoms : ['Discomfort & Persistent Irritation', 'Digestive or Bodily Imbalance', 'Fatigue or Disrupted Wellness'],
            approaches: data.approaches?.length ? data.approaches : ['Holistic Siddha & Ayurveda diagnosis', 'Customized herbal formulations', 'Targeted therapy and dietary care']
          });
        } else {
          // Check fallback
          const key = slug.toLowerCase();
          const fallback = fallbackTreatments[key] || {
            name: slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            category: 'General Healthcare',
            symptoms: ['Individualized symptom assessment', 'Elemental Dosha imbalance', 'Physical discomfort or fatigue'],
            approaches: ['Pulse examination (Nadi Parikshai)', 'Authentic herbal therapies', 'Lifestyle and dietary adjustments']
          };
          setTreatment(fallback);
        }
      })
      .catch(() => {
        // Fallback
        const key = slug.toLowerCase();
        const fallback = fallbackTreatments[key] || {
          name: slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          category: 'General Healthcare',
          symptoms: ['Individualized symptom assessment', 'Elemental Dosha imbalance', 'Physical discomfort or fatigue'],
          approaches: ['Pulse examination (Nadi Parikshai)', 'Authentic herbal therapies', 'Lifestyle and dietary adjustments']
        };
        setTreatment(fallback);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <PageTransition><Loading fullPage /></PageTransition>;

  if (error || !treatment) {
    return (
      <PageTransition>
        <div className="bg-sage min-h-screen py-20">
          <Container>
            <button onClick={() => navigate('/treatments')} className="flex items-center text-primary-700 hover:text-primary-600 mb-8 transition-colors">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Treatments
            </button>
            <div className="text-center py-20">
              <h1 className="text-3xl font-serif text-primary-700 mb-4">Treatment Not Found</h1>
              <p className="text-gray-600">{error || 'The treatment you are looking for does not exist.'}</p>
            </div>
          </Container>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <Helmet>
        <title>{treatment.name} Treatment | Sanjeevini</title>
        <meta name="description" content={`Learn about ${treatment.name} treatment at Sanjeevini Siddha & Ayurveda Medical Centre.`} />
      </Helmet>
      <div className="bg-sage min-h-screen py-20">
        <Container>
          <button onClick={() => navigate('/treatments')} className="flex items-center text-primary-700 hover:text-primary-600 mb-8 transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Treatments
          </button>
          <TreatmentDetailsComponent treatment={treatment} />

          <div className="mt-12 text-center">
            <Button to="/contact" variant="primary" size="lg">
              Contact Us for this Treatment
            </Button>
          </div>
        </Container>
      </div>
    </PageTransition>
  );
};

export default TreatmentDetails;
