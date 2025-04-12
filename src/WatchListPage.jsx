import React, { useState, useEffect } from "react";
import MangaGrid from "./MangaGrid";
import PaginationControls from "./PaginationControls";
import "./watchListPage.css";

function WatchListPage() {
  const [currentPage, setCurrentPage] = useState(() => {
    if (localStorage.getItem('reloadingAfterAdd')) {
      localStorage.removeItem('reloadingAfterAdd');
      return parseInt(localStorage.getItem('lastMangaPage')) || 1;
    }
    return 1;
  });
  const [totalPages, setTotalPages] = useState(1);
  const [filterData] = useState({
    selectedGenres: [],
    minChapters: 1,
    currentSort: 'newest'
  });

  useEffect(() => {
    localStorage.setItem('lastMangaPage', currentPage);
  }, [currentPage]);

  useEffect(() => {
    const fetchTotalPages = async () => {
      try {
        const response = await fetch(
          `https://mturtlebase.onrender.com/10000/api/watchlist?page=1&limit=10`
        );
        if (!response.ok) throw new Error("Failed to fetch watchlist");

        const data = await response.json();
        setTotalPages(Math.ceil(data.pagination.total / 10));
      } catch (err) {
        console.error("Error fetching watchlist:", err);
      }
    };

    fetchTotalPages();
  }, []);

  const handlePageChange = (newPage) => {
    setCurrentPage(Math.max(1, Math.min(newPage, totalPages)));
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
      />
    </div>
  );
}

export default WatchListPage;