import React from 'react';
import { 
  KeyboardDoubleArrowLeft, 
  KeyboardArrowLeft,
  KeyboardArrowRight,
  KeyboardDoubleArrowRight 
} from '@mui/icons-material';
import './paginationControls.css';

function PaginationControls({ currentPage, totalPages, onPageChange }) {
  return (
    <div className="pagination-container">
      {/* Section 1: Double left arrow (back 2 pages) */}
      <button 
        className="pagination-btn"
        onClick={() => onPageChange(Math.max(1, currentPage - 2))}
        disabled={currentPage <= 1}
      >
        <KeyboardDoubleArrowLeft />
      </button>

      {/* Section 2: Single left arrow (back 1 page) */}
      <button 
        className="pagination-btn"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        <KeyboardArrowLeft />
      </button>

      {/* Section 3: Current page display */}
      <div className="page-info">
        Page {currentPage} of {totalPages}
      </div>

      {/* Section 4: Single right arrow (next page) */}
      <button 
        className="pagination-btn"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        <KeyboardArrowRight />
      </button>

      {/* Section 5: Double right arrow (forward 2 pages) */}
      <button 
        className="pagination-btn"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 2))}
        disabled={currentPage >= totalPages}
      >
        <KeyboardDoubleArrowRight />
      </button>
    </div>
  );
}

export default PaginationControls;