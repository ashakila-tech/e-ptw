import { useEffect, useState, useCallback } from 'react';
import { 
  fetchAllApplications, 
  fetchPermitTypes, 
  fetchLocations, 
  fetchUsers, 
  fetchCompanies 
} from '../../../shared/services/api';

export function usePermits() {
  const [permits, setPermits] = useState<any[]>([]);
  const [permitTypes, setPermitTypes] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refetch = useCallback(() => setRefreshKey((k) => k + 1), []);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const [permitsData, typesData, locsData, usersData, companiesData] = await Promise.all([
          fetchAllApplications(),
          fetchPermitTypes(),
          fetchLocations(),
          fetchUsers(),
          fetchCompanies()
        ]);

        if (!mounted) return;

        setPermits(permitsData);
        setPermitTypes(typesData);
        setLocations(locsData);
        setApplicants(Array.isArray(usersData) ? usersData : (usersData.results || []));
        setCompanies(companiesData);
      } catch (err: any) {
        if (!mounted) return;
        setError(err.message || 'Failed to load permits data');
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [refreshKey]);

  return { 
    permits, permitTypes, locations, applicants, companies, 
    loading, error, refetch 
  };
}