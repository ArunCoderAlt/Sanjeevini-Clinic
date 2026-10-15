import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import TestimonialCard from './TestimonialCard';

const TestimonialSlider = ({ testimonials }) => {
  return (
    <Swiper
      modules={[Autoplay, Pagination]}
      spaceBetween={30}
      slidesPerView={1}
      breakpoints={{
        768: { slidesPerView: 2 },
        1024: { slidesPerView: 3 }
      }}
      autoplay={{ delay: 4000, disableOnInteraction: false }}
      pagination={{ clickable: true }}
      className="pb-16"
    >
      {testimonials.map(t => (
        <SwiperSlide key={t.id} className="pt-6">
          <TestimonialCard testimonial={t} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default TestimonialSlider;
