import React, { useState } from 'react';
import { deleteApplication, createSafetyEquipment, deleteSafetyEquipment, updateSafetyEquipment, createLocation, updateLocation, deleteLocation, createPermitType, updatePermitType, deletePermitType } from '../../../shared/services/api';
import PermitTable from '../components/tables/PermitTable';
import { usePermits } from '../hooks/usePermits';
import ManageList from '../components/ManageList';
import ManagerAssignmentModal from '../components/modals/ManagerAssignmentModal';

const Permits: React.FC = () => {
  const { permits, permitTypes, locations, applicants, companies, safetyEquipment, loading, error, refetch } = usePermits();

  // Assignment Modal State
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
  const [assignmentType, setAssignmentType] = useState<'location' | 'permit_type'>('location');
  const [assignmentItem, setAssignmentItem] = useState<{ id: number; name: string } | null>(null);

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

  const handleEditLocation = async (item: any) => {
    const name = window.prompt("Edit location name:", item.name);
    if (!name || name === item.name) return;
    try {
      await updateLocation(item.id, name);
      refetch();
    } catch (e: any) {
      alert(e.message || 'Failed to update location');
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

  const handleEditPermitType = async (item: any) => {
    const name = window.prompt("Edit permit type name:", item.name);
    if (!name || name === item.name) return;
    try {
      await updatePermitType(item.id, name);
      refetch();
    } catch (e: any) {
      alert(e.message || 'Failed to update permit type');
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

  const handleAssignLocation = (item: any) => {
    setAssignmentType('location');
    setAssignmentItem(item);
    setAssignmentModalOpen(true);
  };

  const handleAssignPermitType = (item: any) => {
    setAssignmentType('permit_type');
    setAssignmentItem(item);
    setAssignmentModalOpen(true);
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
        onEdit={handleEditLocation}
        onDelete={handleRemoveLocation}
        onAssign={handleAssignLocation}
      />

      <ManageList
        title="Permit Types"
        items={visiblePermitTypes}
        loading={loading}
        onAdd={handleAddPermitType}
        onEdit={handleEditPermitType}
        onDelete={handleRemovePermitType}
        onAssign={handleAssignPermitType}
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

      <ManagerAssignmentModal
        open={assignmentModalOpen}
        onClose={() => setAssignmentModalOpen(false)}
        type={assignmentType}
        item={assignmentItem}
        allUsers={applicants}
      />
    </div>
  );
};

export default Permits;