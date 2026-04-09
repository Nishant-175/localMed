import { useState, useCallback } from 'react';
import api from '../services/api';

export function useSearch() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchDoctors = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      let endpoint = '/doctors';
      
      if (params.specialization) {
        endpoint = `/doctors/specialization/${params.specialization}`;
      } else if (params.query) {
        endpoint = `/doctors/search?query=${params.query}`;
      } else if (params.latitude && params.longitude) {
        endpoint = `/doctors/nearby?latitude=${params.latitude}&longitude=${params.longitude}&radius=${params.radius || 5}`;
      }

      const response = await api.get(endpoint);
      setDoctors(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { doctors, setDoctors, loading, error, searchDoctors };
}
