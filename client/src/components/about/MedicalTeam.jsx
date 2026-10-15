import React from 'react';
import Container from '../common/Container';
import DoctorGrid from '../doctors/DoctorGrid';
import SectionTitle from '../common/SectionTitle';

const MedicalTeam = () => {
  return (
    <section className="py-24 bg-cream">
      <Container>
        <SectionTitle 
          title="Meet Our Experts" 
          subtitle="A dedicated team blending profound knowledge with compassionate care."
        />
        <div className="mt-12">
          <DoctorGrid />
        </div>
      </Container>
    </section>
  );
};

export default MedicalTeam;
