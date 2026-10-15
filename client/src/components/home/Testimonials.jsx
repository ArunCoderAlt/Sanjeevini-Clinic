import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { Star, Quote } from 'lucide-react';
import { Link } from 'react-router-dom';
import Container from '../common/Container';
import SectionTitle from '../common/SectionTitle';
import Button from '../common/Button';
import { getTestimonials } from '../../services/testimonialService';

const fallbackTestimonials = [
  { name: 'Karthik R.', text: 'The Varmam therapy worked wonders for my chronic back pain. Dr. Thiagarajan is truly exceptional.', rating: 5 },
  { name: 'Lakshmi S.', text: 'Authentic Ayurveda treatment. Dr. Subashini takes time to understand the root cause. Highly recommended.', rating: 5 },
  { name: 'Meena K.', text: 'Very clean clinic, polite staff, and the herbal medicines provided immediate relief for my skin condition.', rating: 4 }
];

const Testimonials = () => {
  const [items, setItems] = useState(fallbackTestimonials);

  useEffect(() => {
    getTestimonials()
      .then((res) => {
        const data = res.data.data || res.data || [];
        if (Array.isArray(data) && data.length > 0) {
          // Map DB items (review -> text)
          const mapped = data.map(d => ({
            id: d._id || d.id,
            name: d.name,
            text: d.review || d.content || d.text,
            rating: d.rating || 5,
            location: d.location
          }));
          setItems(mapped);
        }
      })
      .catch(() => {
        // Fallback on error
      });
  }, []);

  return (
    <section className="py-24 bg-white">
      <Container>
        <SectionTitle 
          title="What Our Patients Say" 
          subtitle="Real stories of healing and recovery."
        />
        
        <div className="mt-12 max-w-5xl mx-auto">
          <Swiper
            modules={[Autoplay, Pagination]}
            spaceBetween={30}
            slidesPerView={1}
            breakpoints={{
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 }
            }}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            className="pb-16"
          >
            {items.map((t, idx) => (
              <SwiperSlide key={t.id || idx}>
                <div className="bg-cream p-8 rounded-2xl h-full flex flex-col relative mt-6">
                  <div className="absolute -top-6 left-8 bg-gold w-12 h-12 rounded-full flex items-center justify-center text-white shadow-md">
                    <Quote className="w-5 h-5" fill="currentColor" />
                  </div>
                  <div className="flex gap-1 mb-4 mt-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < t.rating ? 'text-gold fill-gold' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 flex-grow italic">"{t.text}"</p>
                  <h4 className="font-serif text-primary-700 font-semibold">— {t.name}</h4>
                  {t.location && <span className="text-xs text-gray-500 mt-1">{t.location}</span>}
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        <div className="text-center mt-6">
          <Button to="/testimonials" variant="outline">
            View All Testimonials & Share Your Story
          </Button>
        </div>
      </Container>
    </section>
  );
};

export default Testimonials;
