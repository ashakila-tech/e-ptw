import React from 'react';
import { deleteApplication } from '../../../shared/services/api';
import PermitTable from '../components/tables/PermitTable';
import { usePermits } from '../hooks/usePermits';

const Permits: React.FC = () => {
  const { permits, permitTypes, locations, applicants, companies, loading, error, refetch } = usePermits();

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this permit?')) return;
    try {
      await deleteApplication(id);
      refetch();
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
        onRefresh={refetch}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default Permits;