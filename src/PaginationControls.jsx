import React from 'react';
import { 
  KeyboardDoubleArrowLeft, 
  KeyboardArrowLeft,
  KeyboardArrowRight,
  KeyboardDoubleArrowRight,
  FirstPage,
  LastPage 
} from '@mui/icons-material';
import './paginationControls.css';

function PaginationControls({ 
  currentPage, 
  totalPages, 
  onPageChange,
  itemsPerPage,
  onItemsPerPageChange 
}) {
  return (
    <div className="pagination-container">
      <div className="items-per-page-container">
        <span>Show:</span>
        <select
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          className="items-per-page-selector"
        >
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
        </select>
      </div>

      {/* First Page Button */}
      <button 
        className="pagination-btn first-last-btn"
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
      >
        <FirstPage />
        <span>First</span>
      </button>

      <button 
        className="pagination-btn"
        onClick={() => onPageChange(Math.max(1, currentPage - 2))}
        disabled={currentPage <= 1}
      >
        <KeyboardDoubleArrowLeft />
      </button>

      <button 
        className="pagination-btn"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        <KeyboardArrowLeft />
      </button>

      <div className="page-info">
        Page {currentPage} of {totalPages}
      </div>

      <button 
        className="pagination-btn"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        <KeyboardArrowRight />
      </button>

      <button 
        className="pagination-btn"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 2))}
        disabled={currentPage >= totalPages}
      >
        <KeyboardDoubleArrowRight />
      </button>

      {/* Last Page Button */}
      <button 
        className="pagination-btn first-last-btn"
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
      >
        <span>Last</span>
        <LastPage />
      </button>
    </div>
  );
}

export default PaginationControls;