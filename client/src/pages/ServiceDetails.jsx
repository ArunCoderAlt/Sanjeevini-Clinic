import React, { useEffect, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Activity, Image } from 'lucide-react';
import { getServiceBySlug } from '../services/serviceService';
import PageTransition from '../components/common/PageTransition';
import Container from '../components/common/Container';
import Loading from '../components/common/Loading';

const serviceCatalog = {
  'varmam-therapy': {
    title: 'Varmam Therapy',
    shortDescription: 'Traditional therapeutic vital point stimulation for rapid pain relief, neuromuscular restoration, and energy balance.',
    fullDescription: `Varmam is a specialized, ancient Tamil healing science that targets vital points where physical and subtle energy pathways converge. When these points are blocked or traumatized by stress, injury, or wear-and-tear, severe musculoskeletal and nervous disorders arise.\n\nOur expert practitioners apply measured, precise manual pressure to specific Varmam points to release trapped energy, restore nervous conductivity, and provide fast, lasting relief from spinal, joint, and nerve pain without surgery.`,
    image: '/images/services/varmam.jpg',
    procedures: [
      'Anatomical assessment of restricted movement and pain triggers',
      'Precise finger-pressure stimulation of designated Varmam points',
      'Application of specialized classical medicated herbal oils',
      'Instruction on post-therapy movement and rest protocols'
    ]
  },
  'thokkanam-therapy': {
    title: 'Thokkanam Therapy',
    shortDescription: 'Traditional Siddha physical manipulation and medicated oil massage for neuromuscular rehabilitation.',
    fullDescription: `Thokkanam is the physical manipulation therapy of the Siddha medicine system. Employing nine distinct therapeutic manual techniques—including kneading, tapping, gliding, and passive stretching—alongside warm medicated herbal oils.\n\nThokkanam effectively penetrates deep muscular layers to disperse lactic acid, nourish dry joints, reduce inflammatory stiffness, and re-establish harmonious blood and lymph circulation throughout the body.`,
    image: '/images/services/thokkanam.jpg',
    procedures: [
      'Constitution-based selection of medicated Siddha herbal oils',
      'Nine classical strokes applied systematically over energy meridians',
      'Targeted warm fomentation (Swedana) over affected joint areas',
      'Post-treatment relaxation and hydration guidance'
    ]
  },
  'wellness-support': {
    title: 'Holistic Wellness Support',
    shortDescription: 'Personalized preventive care programs, dietary counseling, and customized herbal regimens.',
    fullDescription: `True wellness extends beyond treating illness—it is the continuous preservation of vitality, immunity, and inner calm. Our wellness support programs harmonize your daily routine with nature’s rhythms.\n\nWe provide personalized dietary guidelines (Pathya Aaharam), seasonal cleansing regimens, stress management practices, and rejuvenative herbal tonics (Rasayana Chikitsa) designed to build natural disease resistance.`,
    image: '/images/services/wellness.jpg',
    procedures: [
      'Comprehensive Dosha and metabolic type assessment',
      'Personalized dietary roadmap specifying compatible foods',
      'Prescription of seasonal tonics and rejuvenative herbs',
      'Periodic progress reviews and regimen fine-tuning'
    ]
  }
};

export default function ServiceDetails() {
  const { slug } = useParams();

  if (slug?.toLowerCase() === 'consultation') {
    return <Navigate to="/services" replace />;
  }

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);

    const fallback = serviceCatalog[slug.toLowerCase()] || 
      serviceCatalog[slug.toLowerCase().replace('-therapy', '').replace('-support', '')] ||
      null;

    getServiceBySlug(slug)
      .then((res) => {
        const data = res.data.data || res.data;
        if (data && data.title) {
          setService({
            ...data,
            shortDescription: data.shortDescription || fallback?.shortDescription,
            fullDescription: data.fullDescription || fallback?.fullDescription,
            image: data.image || fallback?.image,
            procedures: data.procedures?.length ? data.procedures : (fallback?.procedures || [])
          });
          setError(null);
        } else if (fallback) {
          setService(fallback);
          setError(null);
        } else {
          setError('Service not found');
        }
      })
      .catch(() => {
        if (fallback) {
          setService(fallback);
          setError(null);
        } else {
          setError('Service not found');
        }
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <PageTransition><Loading fullPage /></PageTransition>;

  if (error || !service) return (
    <PageTransition>
      <Container className="py-20 text-center">
        <h1 className="text-4xl font-serif text-primary-700 mb-4">Service Not Found</h1>
        <p className="text-gray-600 mb-8">The service you are looking for does not exist.</p>
        <Link to="/services" className="text-gold font-medium hover:text-primary-600">← Back to Services</Link>
      </Container>
    </PageTransition>
  );

  return (
    <PageTransition>
      <Helmet>
        <title>{service.title} | Sanjeevini Siddha & Ayurveda</title>
        <meta name="description" content={`${service.shortDescription || service.title} at Sanjeevini Siddha & Ayurveda Medical Centre in Karaikal.`} />
      </Helmet>
      <section className="py-16 md:py-24 bg-cream">
        <Container>
          <Link to="/services" className="inline-flex items-center text-primary-700 hover:text-gold mb-8 transition-colors font-medium">
            <ArrowLeft className="w-5 h-5 mr-2" /> Back to Services
          </Link>
          <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-3xl shadow-sm border border-sage overflow-hidden">
              <div className="grid lg:grid-cols-5 gap-0">
                <div className="lg:col-span-3 p-8 md:p-12 lg:p-16 flex flex-col justify-between">
                  <div>
                    <h1 className="text-4xl md:text-5xl font-serif text-primary-700 mb-6 leading-tight">{service.title}</h1>
                    <p className="text-lg md:text-xl text-gray-600 leading-relaxed mb-8 font-light">{service.shortDescription}</p>
                    
                    {service.fullDescription && (
                      <div className="prose prose-lg text-gray-600 leading-relaxed mb-10 whitespace-pre-line">{service.fullDescription}</div>
                    )}

                    {service.procedures?.length > 0 && (
                      <div className="p-6 md:p-8 bg-sage/40 rounded-2xl border border-sage">
                        <h2 className="text-2xl font-serif text-primary-700 mb-5 flex items-center">
                          <Activity className="w-6 h-6 mr-3 text-primary-600 shrink-0" />
                          Treatment Procedures
                        </h2>
                        <ul className="space-y-3.5">
                          {service.procedures.map((p, i) => (
                            <li key={i} className="flex items-start text-gray-700 text-sm md:text-base">
                              <span className="w-2 h-2 rounded-full bg-primary-600 mr-3 shrink-0 mt-2" />
                              <span className="leading-relaxed">{p}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                <div className="lg:col-span-2 bg-sage p-8 md:p-12 flex flex-col gap-8 justify-between">
                  <div>
                    {service.image ? (
                      <img src={service.image} alt={service.title} className="w-full h-64 md:h-72 object-cover rounded-2xl shadow-md" />
                    ) : (
                      <div className="w-full h-64 md:h-72 bg-white/60 rounded-2xl flex items-center justify-center">
                        <Image className="w-16 h-16 text-primary-600" />
                      </div>
                    )}
                  </div>

                  <div className="bg-white p-8 rounded-2xl shadow-sm border border-sage/60">
                    <h3 className="text-2xl font-serif text-primary-700 mb-3">Inquire About This Service</h3>
                    <p className="text-gray-600 mb-6 text-sm">
                      Experience authentic traditional care tailored to your specific wellness needs.
                    </p>
                    <Link to="/contact" className="inline-block w-full text-center bg-primary-700 text-white px-8 py-3.5 rounded-full font-medium hover:bg-gold transition-colors shadow-sm">
                      Contact Us / Inquire
                    </Link>
                  </div>

                  <div className="text-xs text-gray-500 space-y-1">
                    <p>• Authentic Siddha & Ayurveda practitioners</p>
                    <p>• Mon – Sat: 5:00 PM – 9:30 PM (Karaikal)</p>
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
