import React, { useState, useEffect } from "react";
import MangaGrid from "./MangaGrid";
import PaginationControls from "./PaginationControls";
import { useSearchParams, useLocation } from "react-router-dom";
import "./advanceSearchPage.css";
import GenreList from "./GenreList";
import SortBy from "./SortBy";

function AdvanceSearchPage() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState(() => {
    if (localStorage.getItem('reloadingAfterAdd')) {
      localStorage.removeItem('reloadingAfterAdd');
      return parseInt(localStorage.getItem('lastMangaPage')) || 1;
    }
    return location.state?.initialPage || 1;
  });
  const [totalPages, setTotalPages] = useState(1);
  const [filterData, setFilterData] = useState({
    selectedGenres: [],
    minChapters: 0,
    searchQuery: searchParams.get("search") || ""
  });
  const [currentSort, setCurrentSort] = useState('newest');

  useEffect(() => {
    localStorage.setItem('lastMangaPage', currentPage);
  }, [currentPage]);

  useEffect(() => {
    setFilterData(prev => ({
      ...prev,
      searchQuery: searchParams.get("search") || ""
    }));
    if (searchParams.get("search")) {
      setCurrentPage(1);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchTotalPages = async () => {
      try {
        const query = new URLSearchParams({
          page: 1,
          limit: 10,
          genres: filterData.selectedGenres.join(','),
          minChapters: filterData.minChapters,
          sort: currentSort,
          ...(filterData.searchQuery && { search: filterData.searchQuery })
        });

        const response = await fetch(`https://mturtlebase.onrender.com/10000/api/manga?${query}`);
        if (!response.ok) throw new Error("Failed to fetch total pages");

        const data = await response.json();
        setTotalPages(Math.ceil(data.pagination.total / 10));
        
        if (currentPage > Math.ceil(data.pagination.total / 10)) {
          setCurrentPage(Math.ceil(data.pagination.total / 10));
        }
      } catch (err) {
        console.error("Error fetching total pages:", err);
      }
    };

    fetchTotalPages();
  }, [filterData, currentSort, currentPage]);

  const handlePageChange = (newPage) => {
    setCurrentPage(Math.max(1, Math.min(newPage, totalPages)));
  };

  const handleFilterData = (data) => {
    setFilterData(prev => ({
      ...prev,
      selectedGenres: Array.isArray(data.selectedGenres) ? data.selectedGenres : [],
      minChapters: Number(data.minChapters) || 1
    }));
    setCurrentPage(1);
  };

  return (
    <div className="advance-search-container">
      <GenreList 
        onSubmitData={handleFilterData} 
        initialGenres={filterData.selectedGenres}
        initialMinChapters={filterData.minChapters}
      />
      
      <SortBy currentSort={currentSort} onSortChange={setCurrentSort} />
      
      <MangaGrid 
        currentPage={currentPage} 
        filterData={{ ...filterData, currentSort }}
      />
      
      <PaginationControls 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}

export default AdvanceSearchPage;