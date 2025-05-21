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
  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo(0, 0); // Instant jump
    // Alternative: document.documentElement.scrollTop = 0;
  };

  // Wrapped handlers with scroll to top
  const handlePageChange = (page) => {
    onPageChange(page);
    scrollToTop();
  };

  const handleItemsPerPageChange = (value) => {
    onItemsPerPageChange(value);
    scrollToTop();
  };

  return (
    <div className="pagination-container">
      <div className="items-per-page-container">
        <span>Show:</span>
        <select
          value={itemsPerPage}
          onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
          className="items-per-page-selector"
        >
          <option value="20">20</option>
          <option value="50">50</option>
          <option value="75">75</option>
        </select>
      </div>

      {/* First Page Button */}
      <button 
        className="pagination-btn first-last-btn"
        onClick={() => handlePageChange(1)}
        disabled={currentPage === 1}
      >
        <FirstPage />
        <span>First</span>
      </button>

      <button 
        className="pagination-btn"
        onClick={() => handlePageChange(Math.max(1, currentPage - 2))}
        disabled={currentPage <= 1}
      >
        <KeyboardDoubleArrowLeft />
      </button>

      <button 
        className="pagination-btn"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        <KeyboardArrowLeft />
      </button>

      <div className="page-info">
        Page {currentPage} of {totalPages}
      </div>

      <button 
        className="pagination-btn"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        <KeyboardArrowRight />
      </button>

      <button 
        className="pagination-btn"
        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 2))}
        disabled={currentPage >= totalPages}
      >
        <KeyboardDoubleArrowRight />
      </button>

      {/* Last Page Button */}
      <button 
        className="pagination-btn first-last-btn"
        onClick={() => handlePageChange(totalPages)}
        disabled={currentPage === totalPages}
      >
        <span>Last</span>
        <LastPage />
      </button>
    </div>
  );
}

export default PaginationControls;