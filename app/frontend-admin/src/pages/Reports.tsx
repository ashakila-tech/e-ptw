import React, { useState } from 'react';
import { useReportsData } from '../hooks/useReports';
import ReportTable, { type Report } from '../components/tables/ReportTable';
import ReportModal from '../components/modals/ReportModal';

const Reports: React.FC = () => {
  const { loading, error, data, refetch } = useReportsData();
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleView = (report: Report) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  return (
    <div className="content-area">
      <h1 className="page-title">Near Miss / Hazardous Incident Report</h1>
      
      {error && <div className="form-error-text" style={{ marginBottom: 10 }}>{error}</div>}

      <ReportTable 
        reports={data}
        loading={loading}
        error={error}
        onRefresh={refetch}
        onView={handleView}
      />

      <ReportModal 
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        report={selectedReport}
      />
    </div>
  );
};

export default Reports;