import React from 'react';
import { classNames } from '../../utils/helpers';

export default function Container({ children, className = '' }) {
  return (
    <div className={classNames('max-w-7xl mx-auto px-4 sm:px-6 lg:px-8', className)}>
      {children}
    </div>
  );
}
