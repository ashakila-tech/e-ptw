import React, { useEffect, useState, useCallback } from 'react';
import { fetchAllApplications, deleteApplication, fetchPermitTypes, fetchLocations, fetchUsers, fetchCompanies } from '../../../shared/services/api';
import PermitTable from '../components/PermitTable';

const Permits: React.FC = () => {
  const [permits, setPermits] = useState<any[]>([]);
  const [permitTypes, setPermitTypes] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPermits = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [permitsData, typesData, locsData, usersData, companiesData] = await Promise.all([
        fetchAllApplications(),
        fetchPermitTypes(),
        fetchLocations(),
        fetchUsers(),
        fetchCompanies()
      ]);
      setPermits(permitsData);
      setPermitTypes(typesData);
      setLocations(locsData);
      setApplicants(Array.isArray(usersData) ? usersData : (usersData.results || []));
      setCompanies(companiesData);
    } catch (e: any) {
      setError(e.message || 'Failed to load permits');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPermits();
  }, [loadPermits]);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this permit?')) return;
    try {
      await deleteApplication(id);
      loadPermits();
    } catch (e: any) {
      alert(e.message || 'Failed to delete permit');
    }
  };

  const handleEdit = (permit: any) => {
    // Placeholder for edit functionality
    console.log('Edit permit', permit);
    alert(`Edit permit: ${permit.name} (Functionality to be implemented)`);
  };

  return (
    <div className="content-area">
      <h1 className="page-title">Permits Management</h1>
      <PermitTable
        permits={permits}
        loading={loading}
        error={error}
        allCompanies={companies}
        permitTypes={permitTypes}
        locations={locations}
        applicants={applicants}
        onRefresh={loadPermits}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default Permits;