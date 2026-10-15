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
  'gastritis': {
    name: 'Gastritis & Ulcer Care',
    category: 'Gastrointestinal',
    conditions: ['Acid Peptic Disease', 'Gastric & Duodenal Ulcers', 'Chronic Acidity', 'GERD & Heartburn'],
    approaches: ['Herbal pitta-pacifying formulations', 'Mucosal healing decoctions', 'Personalized dietary guidelines', 'Stress-reduction therapies']
  },
  'ibs': {
    name: 'Irritable Bowel Syndrome (IBS)',
    category: 'Gastrointestinal',
    conditions: ['Chronic Indigestion', 'Altered Bowel Habits', 'Abdominal Cramping & Bloating', 'Food Intolerances'],
    approaches: ['Gut microbiome rejuvenation', 'Medicated Takradhara therapy', 'Digestive enzyme stimulation', 'Herbal gut stabilizers']
  },
  'psoriasis': {
    name: 'Psoriasis & Eczema Care',
    category: 'Dermatology',
    conditions: ['Plaque Psoriasis', 'Chronic Atopic Eczema', 'Scalp Psoriasis', 'Dry Skin Dermatitis'],
    approaches: ['Deep cellular blood purification', 'Traditional medicated herbal oils', 'Pitta-Raktha balancing herbal regimens', 'Strict natural dietary protocol']
  },
  'pcos': {
    name: 'PCOS & Women’s Health',
    category: 'Women\'s Health',
    conditions: ['Polycystic Ovarian Syndrome (PCOS)', 'Irregular Menstrual Cycles', 'Hormonal Imbalance', 'Weight Fluctuations'],
    approaches: ['Endocrine-balancing herbal formulas', 'Metabolic correction regimens', 'Uterine tonics', 'Holistic nutrition and cycle tracking']
  },
  'arthritis': {
    name: 'Arthritis & Joint Pain Management',
    category: 'Musculoskeletal',
    conditions: ['Osteoarthritis', 'Rheumatoid Arthritis', 'Cervical & Lumbar Spondylosis', 'Chronic Knee & Back Pain'],
    approaches: ['Traditional Varmam vital-point therapy', 'Thokkanam medicated oil massage', 'Cartilage-strengthening herbal decoctions', 'Gentle rehabilitative movement']
  },
  'kidney-stones': {
    name: 'Kidney Stones Management',
    category: 'Kidney',
    conditions: ['Renal Calculi', 'Ureteric Stones', 'Urinary Tract Discomfort', 'Recurrent Stone Formation'],
    approaches: ['Stone-dissolving (Lithotriptic) herbal formulations', 'Natural diuretic decoctions', 'Fluid-balance counseling', 'Preventive lifestyle counseling']
  },
  'asthma': {
    name: 'Asthma & Respiratory Care',
    category: 'Respiratory',
    conditions: ['Bronchial Asthma', 'Chronic Allergic Bronchitis', 'Seasonal Wheezing', 'Chronic Sinusitis'],
    approaches: ['Airway clearance herbal formulations', 'Kapha-balancing steam inhalation', 'Immunity-modulating rasayanas', 'Pranayama breathing guidance']
  },
  'migraine': {
    name: 'Migraine & Neurological Relief',
    category: 'Neurology',
    conditions: ['Chronic Migraine', 'Tension Headaches', 'Trigeminal Neuralgia', 'Stress-Induced Headaches'],
    approaches: ['Nasya herbal nasal administration', 'Shirodhara oil therapy', 'Nervous system soothing herbs', 'Identification and control of triggers']
  },
  'piles': {
    name: 'Anorectal Care (Piles, Fissure, Fistula)',
    category: 'Anorectal',
    conditions: ['Hemorrhoids (Piles)', 'Anal Fissures', 'Fistula in Ano', 'Chronic Constipation'],
    approaches: ['Non-surgical traditional Siddha medications', 'Medicated sitz baths (Avagaha sweda)', 'Digestive fire optimization', 'Topical healing oils and herbal pastes']
  },
  'diabetes': {
    name: 'Diabetes & Metabolic Wellness',
    category: 'Other',
    conditions: ['Type 2 Diabetes Mellitus', 'Prediabetes & Insulin Resistance', 'Metabolic Syndrome', 'Diabetic Neuropathy Symptoms'],
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
            conditions: data.conditions?.length ? data.conditions : ['Chronic symptoms', 'Acute flare-ups', 'Underlying elemental imbalance'],
            approaches: data.approaches?.length ? data.approaches : ['Holistic Siddha diagnosis', 'Customized herbal formulations', 'Targeted therapy and dietary care']
          });
        } else {
          // Check fallback
          const key = slug.toLowerCase();
          const fallback = fallbackTreatments[key] || {
            name: slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            category: 'General Healthcare',
            conditions: ['Individualized symptom assessment', 'Elemental Dosha imbalance'],
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
          conditions: ['Individualized symptom assessment', 'Elemental Dosha imbalance'],
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
