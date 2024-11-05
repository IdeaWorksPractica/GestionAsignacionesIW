import React from 'react';
import './pagination.css';

interface PaginationProps {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  onPageChange: (pageNumber: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  totalItems,
  itemsPerPage,
  currentPage,
  onPageChange,
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className="pagination">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
        <button
          key={number}
          className={`page-button ${currentPage === number ? 'active' : ''}`}
          onClick={() => onPageChange(number)}
        >
          {number}
        </button>
      ))}
    </div>
  );
};
