import React from 'react';
import { AlertCircle } from 'lucide-react';
import Button from './Button';

export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-red-50 rounded-lg border border-red-100">
      <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
      <h3 className="text-lg font-heading font-semibold text-red-900 mb-2">Something went wrong</h3>
      <p className="text-red-600 mb-6 max-w-md">{message || 'An unexpected error occurred while loading this content.'}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry} size="sm">
          Try Again
        </Button>
      )}
    </div>
  );
}
