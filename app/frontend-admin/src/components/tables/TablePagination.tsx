import React from 'react';

interface Props {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const TablePagination: React.FC<Props> = ({ currentPage, totalPages, onPageChange }) => {
  // if (totalPages <= 1) return null;

  return (
    <div className="pagination-controls">
      <button
        className="manage-btn"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Prev
      </button>
      <span>Page {currentPage} of {totalPages}</span>
      <button
        className="manage-btn"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next
      </button>
    </div>
  );
};

export default TablePagination;