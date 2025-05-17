import React, { useState, useEffect } from "react";
import MangaGrid from "./MangaGrid";
import PaginationControls from "./PaginationControls";
import { useSearchParams, useLocation, useNavigate } from "react-router-dom";
import "./advanceSearchPage.css";
import GenreList from "./GenreList";
import SortBy from "./SortBy";

function AdvanceSearchPage() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterData, setFilterData] = useState({
    selectedGenres: [],
    minChapters: 0,
    searchQuery: location.state?.initialSearchQuery || searchParams.get("search") || "",
    itemsPerPage: 20 // Add itemsPerPage to filterData
  });
  const [currentSort, setCurrentSort] = useState('newest');
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  // Initialize page from URL or location state
  useEffect(() => {
    const pageFromUrl = parseInt(searchParams.get('page')) || location.state?.initialPage || 1;
    setCurrentPage(pageFromUrl);
  }, [searchParams, location.state]);

  // Fetch total pages and manga data
  useEffect(() => {
    const fetchTotalPages = async () => {
      try {
        const query = new URLSearchParams({
          page: 1,
          limit: filterData.itemsPerPage, // Use dynamic itemsPerPage
          genres: filterData.selectedGenres.join(','),
          minChapters: filterData.minChapters,
          sort: currentSort,
          ...(filterData.searchQuery && { search: filterData.searchQuery })
        });

        const response = await fetch(`${BASE_URL}/api/manga?${query}`);
        if (!response.ok) throw new Error("Failed to fetch total pages");

        const data = await response.json();
        const calculatedTotalPages = Math.ceil(data.pagination.total / filterData.itemsPerPage);
        setTotalPages(calculatedTotalPages);
        
        // Reset to page 1 if current page exceeds new total
        if (currentPage > calculatedTotalPages) {
          setCurrentPage(1);
          navigate(`?page=1`, { replace: true });
        }
      } catch (err) {
        console.error("Error fetching total pages:", err);
      }
    };

    fetchTotalPages();
    navigate(`?page=${currentPage}`, { replace: true });
  }, [filterData, currentSort, currentPage]);

  const handlePageChange = (newPage) => {
    const validatedPage = Math.max(1, Math.min(newPage, totalPages));
    setCurrentPage(validatedPage);
    navigate(`?page=${validatedPage}`);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setFilterData(prev => ({
      ...prev,
      itemsPerPage: newItemsPerPage
    }));
    setCurrentPage(1); // Reset to page 1 when changing items per page
    navigate(`?page=1`); // Update URL
  };

  const handleFilterData = (data) => {
    setFilterData(prev => ({
      ...prev,
      selectedGenres: Array.isArray(data.selectedGenres) ? data.selectedGenres : [],
      minChapters: Number(data.minChapters) || 1
    }));
    setCurrentPage(1);
    navigate(`?page=1`);
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
        itemsPerPage={filterData.itemsPerPage}
        onItemsPerPageChange={handleItemsPerPageChange}
      />
    </div>
  );
}

export default AdvanceSearchPage;