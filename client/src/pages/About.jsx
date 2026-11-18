import { Helmet } from 'react-helmet-async';
import PageTransition from '../components/common/PageTransition';
import AboutHero from '../components/about/AboutHero';
import Philosophy from '../components/about/Philosophy';
import MissionVision from '../components/about/MissionVision';
import Experience from '../components/about/Experience';

const About = () => {
  return (
    <PageTransition>
      <Helmet>
        <title>About Us | Sanjeevini Siddha & Ayurveda Medical Centre</title>
        <meta name="description" content="Learn about our philosophy, mission, and holistic healing experience at Sanjeevini Siddha & Ayurveda Medical Centre." />
      </Helmet>
      <AboutHero />
      <Philosophy />
      <MissionVision />
      <Experience />
    </PageTransition>
  );
};

export default About;
