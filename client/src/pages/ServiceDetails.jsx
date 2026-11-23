import { useState, useMemo, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Clock, MapPin, ShieldCheck, HeartHandshake, Sparkles, CheckCircle2 } from 'lucide-react';
import { useService } from '../hooks/useQueries';
import PageTransition from '../components/common/PageTransition';
import Container from '../components/common/Container';
import Loading from '../components/common/Loading';
import { clinicInfo } from '../data/clinicInfo';
import { getImageUrl, getDefaultServiceImage, isValidImage } from '../utils/helpers';

const serviceCatalog = {
  'varmam-therapy': {
    title: 'Varmam Therapy',
    shortDescription: 'Traditional therapeutic vital point stimulation for rapid pain relief, neuromuscular restoration, and energy balance.',
    fullDescription: '',
    benefits: [
      'Relief from chronic spinal, back, and neck pain',
      'Neuromuscular stimulation for stroke rehabilitation',
      'Migraine and tension headache relief',
      'Joint mobility restoration without invasive procedures'
    ],
    image: '/images/hero/slide-4.png'
  },
  'varmam': {
    title: 'Varmam Therapy',
    shortDescription: 'Traditional therapeutic vital point stimulation for rapid pain relief, neuromuscular restoration, and energy balance.',
    fullDescription: '',
    benefits: [
      'Relief from chronic spinal, back, and neck pain',
      'Neuromuscular stimulation for stroke rehabilitation',
      'Migraine and tension headache relief',
      'Joint mobility restoration without invasive procedures'
    ],
    image: '/images/hero/slide-4.png'
  },
  'thokkanam-therapy': {
    title: 'Thokkanam Therapy',
    shortDescription: 'Traditional Siddha physical manipulation and medicated oil massage for neuromuscular rehabilitation.',
    fullDescription: '',
    benefits: [
      'Alleviation of deep muscle fatigue and spasm',
      'Nourishment of arthritic and stiff joints',
      'Re-establishment of healthy blood and lymphatic flow',
      'Balancing of Vatha humor across the nervous system'
    ],
    image: '/images/hero/slide-3.png'
  },
  'thokkanam': {
    title: 'Thokkanam Therapy',
    shortDescription: 'Traditional Siddha physical manipulation and medicated oil massage for neuromuscular rehabilitation.',
    fullDescription: '',
    benefits: [
      'Alleviation of deep muscle fatigue and spasm',
      'Nourishment of arthritic and stiff joints',
      'Re-establishment of healthy blood and lymphatic flow',
      'Balancing of Vatha humor across the nervous system'
    ],
    image: '/images/hero/slide-3.png'
  },
  'swedanam-therapy': {
    title: 'Swedanam Therapy',
    shortDescription: 'Traditional herbal steam and sudation therapy to open microchannels, relieve deep muscle stiffness, and eliminate metabolic toxins.',
    fullDescription: '',
    benefits: [
      'Relief from muscular stiffness and joint rigidity',
      'Enhanced blood circulation and tissue oxygenation',
      'Deep cellular detoxification through perspiration',
      'Restoration of bodily lightness and flexibility'
    ],
    image: '/images/hero/slide-3.png'
  },
  'swedanam': {
    title: 'Swedanam Therapy',
    shortDescription: 'Traditional herbal steam and sudation therapy to open microchannels, relieve deep muscle stiffness, and eliminate metabolic toxins.',
    fullDescription: '',
    benefits: [
      'Relief from muscular stiffness and joint rigidity',
      'Enhanced blood circulation and tissue oxygenation',
      'Deep cellular detoxification through perspiration',
      'Restoration of bodily lightness and flexibility'
    ],
    image: '/images/hero/slide-3.png'
  },
  'wellness-support': {
    title: 'Holistic Wellness Support',
    shortDescription: 'Personalized preventive care programs, dietary counseling, and customized herbal regimens.',
    fullDescription: `True wellness extends beyond treating illness—it is the continuous preservation of vitality, immunity, and inner calm. Our wellness support programs harmonize your daily routine with nature’s rhythms.\n\nWe provide personalized dietary guidelines (Pathya Aaharam), seasonal cleansing regimens, stress management practices, and rejuvenative herbal tonics (Rasayana Chikitsa) designed to build natural disease resistance.`,
    benefits: [
      'Personalized constitution analysis (Vatha, Pitha, Kapha balance)',
      'Customized dietary counseling (Pathya Aaharam)',
      'Seasonal detox and Rasayana rejuvenation protocols',
      'Long-term natural disease resistance building'
    ],
    image: '/images/hero/slide-1.png'
  },
  'wellness': {
    title: 'Holistic Wellness Support',
    shortDescription: 'Personalized preventive care programs, dietary counseling, and customized herbal regimens.',
    fullDescription: `True wellness extends beyond treating illness—it is the continuous preservation of vitality, immunity, and inner calm. Our wellness support programs harmonize your daily routine with nature’s rhythms.\n\nWe provide personalized dietary guidelines (Pathya Aaharam), seasonal cleansing regimens, stress management practices, and rejuvenative herbal tonics (Rasayana Chikitsa) designed to build natural disease resistance.`,
    benefits: [
      'Personalized constitution analysis (Vatha, Pitha, Kapha balance)',
      'Customized dietary counseling (Pathya Aaharam)',
      'Seasonal detox and Rasayana rejuvenation protocols',
      'Long-term natural disease resistance building'
    ],
    image: '/images/hero/slide-1.png'
  }
};

export default function ServiceDetails() {
  const { slug } = useParams();
  const [imgError, setImgError] = useState(false);

  if (slug?.toLowerCase() === 'consultation') {
    return <Navigate to="/services" replace />;
  }

  const { data: rawService, isLoading } = useService(slug);

  const service = useMemo(() => {
    const slugKey = slug?.toLowerCase() || '';
    const rawTitle = (rawService?.title || '').toLowerCase();
    const isSwedanam = rawTitle.includes('swedan') || slugKey.includes('swedan');

    const fallback = isSwedanam
      ? (serviceCatalog['swedanam'] || serviceCatalog['swedanam-therapy'])
      : (
          serviceCatalog[slugKey] || 
          serviceCatalog[slugKey.replace('-therapy', '').replace('-support', '')] ||
          serviceCatalog[`${slugKey}-therapy`] ||
          serviceCatalog[`${slugKey}-support`] ||
          null
        );

    const previewDefaultImg = getDefaultServiceImage(slugKey);

    const baseImage = isValidImage(rawService?.image)
      ? rawService.image
      : (isValidImage(fallback?.image) ? fallback.image : previewDefaultImg);

    const isExcludedDesc = isSwedanam || 
      ['varmam', 'varmam-therapy', 'thokkanam', 'thokkanam-therapy', 'swedanam', 'swedanam-therapy'].includes(slugKey) ||
      ['varmam', 'thokkanam', 'swedan'].some((k) => rawTitle.includes(k) || slugKey.includes(k));

    if (rawService && rawService.title) {
      return {
        ...rawService,
        shortDescription: rawService.shortDescription || fallback?.shortDescription,
        fullDescription: isExcludedDesc ? '' : (rawService.fullDescription || fallback?.fullDescription || ''),
        benefits: rawService.benefits?.length ? rawService.benefits : fallback?.benefits,
        image: baseImage
      };
    }
    if (fallback) {
      return {
        ...fallback,
        fullDescription: isExcludedDesc ? '' : (fallback.fullDescription || ''),
        image: fallback.image || previewDefaultImg
      };
    }
    return null;
  }, [rawService, slug]);

  useEffect(() => {
    setImgError(false);
  }, [slug, rawService?.image]);

  const previewDefaultImg = getDefaultServiceImage(slug);
  const resolvedImage = !imgError && isValidImage(service?.image) ? service.image : previewDefaultImg;
  const displayImage = resolvedImage ? getImageUrl(resolvedImage) : null;

  const loading = isLoading && !service;
  const error = !loading && !service ? 'Service not found' : null;

  if (loading) return <PageTransition><Loading fullPage /></PageTransition>;

  if (error || !service) return (
    <PageTransition>
      <Container className="py-20 text-center">
        <h1 className="text-4xl font-serif text-primary-700 mb-4">Service Not Found</h1>
        <p className="text-gray-600 mb-8">The service you are looking for does not exist.</p>
        <Link to="/services" className="text-dark-blue-gradient font-semibold hover:opacity-80">← Back to Services</Link>
      </Container>
    </PageTransition>
  );

  const benefitsList = service.benefits || [
    'Authentic Siddha & Ayurveda therapeutic methods',
    'Root cause diagnosis through ancient principles',
    'Natural and time-tested herbal formulations',
    'Compassionate personalized care'
  ];

  return (
    <PageTransition>
      <Helmet>
        <title>{service.title} | Sanjeevini Siddha & Ayurveda</title>
        <meta name="description" content={`${service.shortDescription || service.title} at Sanjeevini Siddha & Ayurveda Medical Centre in Karaikal.`} />
      </Helmet>
      <section className="py-16 md:py-24 bg-cream min-h-screen">
        <Container>
          <Link to="/services" className="inline-flex items-center text-[#144979] hover:text-[#0C2B4B] mb-8 transition-colors font-semibold text-sm">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to All Services
          </Link>
          <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden">
              <div className="grid lg:grid-cols-5 gap-0">
                {/* Left Content */}
                <div className="lg:col-span-3 p-8 md:p-12 lg:p-14 flex flex-col justify-between">
                  <div>
                    <span className="inline-block px-3.5 py-1 rounded-full bg-[#E3EFF9] text-[#0C2B4B] text-xs font-bold uppercase tracking-wider mb-4">
                      Sanjeevini Medical Centre
                    </span>
                    <h1 className="text-3xl md:text-5xl font-serif text-[#0C2B4B] font-bold mb-5 leading-tight">
                      {service.title}
                    </h1>
                    <p className="text-base md:text-lg text-slate-600 leading-relaxed mb-6 font-normal">
                      {service.shortDescription}
                    </p>

                    {displayImage && (
                      <div className="aspect-[16/10] sm:aspect-[16/9] w-full rounded-2xl overflow-hidden mb-8 shadow-md border border-slate-200/90 bg-slate-100 relative group">
                        <img
                          src={displayImage}
                          alt={service.title}
                          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-102"
                          loading="eager"
                          onError={() => setImgError(true)}
                        />
                      </div>
                    )}
                    
                    {service.fullDescription && (
                      <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-sm md:text-base mb-8 whitespace-pre-line">
                        {service.fullDescription}
                      </div>
                    )}

                    {/* Key Benefits */}
                    <div className="p-5 sm:p-6 bg-[#F0F6FC] rounded-2xl border border-[#D5E5F5] space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#144979]">
                        Clinical Highlights & Benefits
                      </h4>
                      <div className="space-y-2">
                        {benefitsList.map((b, i) => (
                          <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                            <CheckCircle2 className="w-4 h-4 text-[#144979] shrink-0 mt-0.5" />
                            <span>{b}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Panel */}
                <div className="lg:col-span-2 bg-[#EAF2F8] p-8 md:p-10 flex flex-col gap-6 justify-between border-t lg:border-t-0 lg:border-l border-slate-200/80">
                  <div className="bg-white p-7 rounded-2xl shadow-sm border border-slate-200">
                    <div className="w-12 h-12 rounded-xl bg-[#E8F2FA] text-[#144979] flex items-center justify-center mb-4">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-serif text-[#0C2B4B] font-bold mb-2">
                      Inquire About This Service
                    </h3>
                    <p className="text-slate-600 mb-6 text-xs sm:text-sm leading-relaxed">
                      Consult with Dr. Thiagarajan Saminadane (MD Siddha) and Dr. Subashini Ganesan (BAMS Ayurveda) for an individualized treatment plan.
                    </p>
                    <Link 
                      to="/contact" 
                      className="block w-full text-center bg-[#144979] text-white px-6 py-3.5 rounded-full font-bold hover:bg-[#0C2B4B] transition-colors shadow-sm text-sm"
                    >
                      Contact Us
                    </Link>
                  </div>

                  <div className="space-y-3 text-xs text-slate-600 bg-white/70 p-5 rounded-2xl border border-slate-200/60">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#144979] shrink-0" />
                      <span>Monday – Saturday: 5:00 PM – 9:30 PM</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#144979] shrink-0" />
                      <span>No. 22, Dr. Ambedkar Street, Karaikal</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#144979] shrink-0" />
                      <span>Over 2 Decades of Traditional Clinical Excellence</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </PageTransition>
  );
}