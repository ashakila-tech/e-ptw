import React from 'react';
import { deleteApplication, createSafetyEquipment, deleteSafetyEquipment, updateSafetyEquipment, createLocation, deleteLocation, createPermitType, deletePermitType } from '../../../shared/services/api';
import PermitTable from '../components/tables/PermitTable';
import { usePermits } from '../hooks/usePermits';
import ManageList from '../components/ManageList';

const Permits: React.FC = () => {
  const { permits, permitTypes, locations, applicants, companies, safetyEquipment, loading, error, refetch } = usePermits();

  const handleAddSafetyEquipment = async () => {
    const name = window.prompt("Enter new safety equipment name:");
    if (!name) return;
    try {
      await createSafetyEquipment(name);
      refetch();
    } catch (e: any) {
      alert(e.message || 'Failed to create safety equipment');
    }
  };

  const handleEditSafetyEquipment = async (item: any) => {
    const name = window.prompt("Edit safety equipment name:", item.name);
    if (!name || name === item.name) return;
    try {
      await updateSafetyEquipment(item.id, name);
      refetch();
    } catch (e: any) {
      alert(e.message || 'Failed to update safety equipment');
    }
  };

  const handleRemoveSafetyEquipment = async (id: number) => {
    if (!window.confirm('Are you sure you want to remove this safety equipment?')) return;
    try {
      await deleteSafetyEquipment(id);
      refetch();
    } catch (e: any) {
      alert(e.message || 'Failed to delete safety equipment');
    }
  };

  // Location handlers
  const handleAddLocation = async () => {
    const name = window.prompt("Enter new location name:");
    if (!name) return;
    try {
      await createLocation(name);
      refetch();
    } catch (e: any) {
      alert(e.message || 'Failed to create location');
    }
  };

  const handleRemoveLocation = async (id: number) => {
    if (!window.confirm('Are you sure you want to remove this location?')) return;
    try {
      await deleteLocation(id);
      refetch();
    } catch (e: any) {
      alert(e.message || 'Failed to delete location');
    }
  };

  // Permit Type handlers
  const handleAddPermitType = async () => {
    const name = window.prompt("Enter new permit type name:");
    if (!name) return;
    try {
      await createPermitType(name);
      refetch();
    } catch (e: any) {
      alert(e.message || 'Failed to create permit type');
    }
  };

  const handleRemovePermitType = async (id: number) => {
    if (!window.confirm('Are you sure you want to remove this permit type?')) return;
    try {
      await deletePermitType(id);
      refetch();
    } catch (e: any) {
      alert(e.message || 'Failed to delete permit type');
    }
  };

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

  const handleEditItem = (type: 'location' | 'permit', item: any) => {
    alert(`Edit ${type}: ${item.name} (Functionality to be implemented)`);
  };

  // Remove first 3 placeholder entries (development artifacts) before rendering
  const visibleLocations = (locations || []).slice(3);
  const visiblePermitTypes = (permitTypes || []).slice(3);

  return (
    <div className="content-area">
      <h1 className="page-title">Permits Management</h1>

      <ManageList
        title="Safety Equipment"
        items={safetyEquipment || []}
        loading={loading}
        onAdd={handleAddSafetyEquipment}
        onEdit={handleEditSafetyEquipment}
        onDelete={handleRemoveSafetyEquipment}
      />

      <ManageList
        title="Locations"
        items={visibleLocations}
        loading={loading}
        onAdd={handleAddLocation}
        onEdit={(item) => handleEditItem('location', item)}
        onDelete={handleRemoveLocation}
      />

      <ManageList
        title="Permit Types"
        items={visiblePermitTypes}
        loading={loading}
        onAdd={handleAddPermitType}
        onEdit={(item) => handleEditItem('permit', item)}
        onDelete={handleRemovePermitType}
      />

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