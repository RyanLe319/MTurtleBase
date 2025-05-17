import React, { useState, useEffect } from 'react';
import MangaGrid from './MangaGrid';
import PaginationControls from './PaginationControls';
import { useSearchParams, useNavigate } from 'react-router-dom';
import './watchListPage.css';

function WatchListPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(() => {
    return parseInt(searchParams.get('page')) || 1;
  });
  const [totalPages, setTotalPages] = useState(1);
  const [filterData, setFilterData] = useState({
    selectedGenres: [],
    minChapters: 1,
    currentSort: 'newest',
    itemsPerPage: 10
  });

  useEffect(() => {
    const fetchTotalPages = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/api/watchlist?page=1&limit=${filterData.itemsPerPage}`
        );
        const data = await response.json();
        setTotalPages(Math.ceil(data.pagination.total / filterData.itemsPerPage));
      } catch (err) {
        console.error("Error:", err);
      }
    };

    fetchTotalPages();
    navigate(`?page=${currentPage}`, { replace: true });
  }, [filterData.itemsPerPage, currentPage]);

  const handlePageChange = (newPage) => {
    setCurrentPage(Math.max(1, Math.min(newPage, totalPages)));
  };

  const handleItemsPerPageChange = (newValue) => {
    setFilterData(prev => ({
      ...prev,
      itemsPerPage: newValue
    }));
    setCurrentPage(1);
  };

  return (
    <div className="watchlist-container">
      <h1>Your Watchlist</h1>
      <MangaGrid 
        currentPage={currentPage} 
        isWatchlist={true}
        filterData={filterData}
      />
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        itemsPerPage={filterData.itemsPerPage}
        onItemsPerPageChange={handleItemsPerPageChange}
      />
    </div>
  );
}

export default WatchListPage;