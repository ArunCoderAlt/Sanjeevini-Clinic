import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import PageTransition from '../components/common/PageTransition';
import Container from '../components/common/Container';
import TreatmentSearch from '../components/treatments/TreatmentSearch';
import TreatmentGrid from '../components/treatments/TreatmentGrid';
import TreatmentCategory from '../components/treatments/TreatmentCategory';

const Treatments = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');

  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState(categoryParam || 'All');

  useEffect(() => {
    if (categoryParam) {
      setActiveCategory(categoryParam);
    }
  }, [categoryParam]);

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    if (cat === 'All') {
      searchParams.delete('category');
      setSearchParams(searchParams, { replace: true });
    } else {
      setSearchParams({ category: cat }, { replace: true });
    }
  };

  return (
    <PageTransition>
      <Helmet>
        <title>Treatments | Sanjeevini Siddha & Ayurveda</title>
        <meta name="description" content="Explore our holistic Siddha and Ayurveda treatments designed for specific health conditions." />
      </Helmet>
      <div className="py-20 bg-cream min-h-screen">
        <Container>
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-serif text-primary-700 mb-4">Treatments</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">Explore our holistic treatments designed for specific health conditions.</p>
          </div>

          <TreatmentSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

          <TreatmentCategory
            activeCategory={activeCategory}
            setActiveCategory={handleCategoryChange}
          />

          <TreatmentGrid
            searchTerm={searchTerm}
            activeCategory={activeCategory}
          />
        </Container>
      </div>
    </PageTransition>
  );
};

export default Treatments;
