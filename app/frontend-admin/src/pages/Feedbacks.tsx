import React, { useState } from 'react';
import type { Feedback } from '../hooks/useFeedbacks';
import { useFeedbacks } from '../hooks/useFeedbacks';
import FeedbackTable from '../components/tables/FeedbackTable';
import FeedbackModal from '../components/modals/FeedbackModal';

const Feedbacks: React.FC = () => {
  const { feedbacks, loading, error, refetch } = useFeedbacks();
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleView = (feedback: Feedback) => {
    setSelectedFeedback(feedback);
    setIsModalOpen(true);
  };

  return (
    <div className="content-area">
      <h1 className="page-title">Feedbacks Management</h1>

      <FeedbackTable 
        feedbacks={feedbacks}
        loading={loading}
        error={error}
        onRefresh={refetch}
        onView={handleView}
      />

      <FeedbackModal 
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        feedback={selectedFeedback}
      />
    </div>
  );
};

export default Feedbacks;