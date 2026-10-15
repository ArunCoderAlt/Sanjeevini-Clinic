import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export default function useFetch(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(url, options);
      setData(res.data.data || res.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [url]); // Intentionally omitting options to avoid loops if not memoized

  useEffect(() => {
    if (url) fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
