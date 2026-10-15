import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Named export for: import { useAuth } from '../hooks/useAuth'
export { useAuth };

// Default export for: import useAuth from '../hooks/useAuth'
export default useAuth;
