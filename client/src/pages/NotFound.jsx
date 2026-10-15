import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import PageTransition from '../components/common/PageTransition';
import Button from '../components/common/Button';

const NotFound = () => {
  return (
    <PageTransition>
      <Helmet>
        <title>Page Not Found | Sanjeevini</title>
      </Helmet>
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-cream text-center px-4">
        <h1 className="text-8xl font-serif text-primary-700 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Page Not Found</h2>
        <p className="text-gray-600 mb-8 max-w-md">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Button to="/" variant="primary">
          Return to Home
        </Button>
      </div>
    </PageTransition>
  );
};

export default NotFound;
