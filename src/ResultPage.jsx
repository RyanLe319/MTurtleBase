import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import MangaGrid from "./MangaGrid";
import GenreList from "./GenreList";
import SortBy from "./SortBy";
import PaginationControls from "./PaginationControls";
import "./resultPage.css";

function ResultPage() {

const sortOptions = {
    'a-z': 'A-Z',
    'newest': 'Recently Added', 
    'updated': 'Recently Updated',
    'chapters': 'Most Chapters',
    'unread': 'Most Unread'
    };
    
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // State management
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [currentSort, setCurrentSort] = useState('newest');
  
  // Get search query from URL parameters
  const searchQuery = searchParams.get('query') || '';

  // Filter data state
  const [filterData, setFilterData] = useState({
    selectedGenres: [],
    minChapters: 0,
    searchQuery: searchQuery,
    itemsPerPage: 10
  });

  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  // Update filter data when URL parameters change
  useEffect(() => {
    const pageFromUrl = parseInt(searchParams.get('page')) || 1;
    setCurrentPage(pageFromUrl);
    
    setFilterData(prev => ({
      ...prev,
      searchQuery: searchQuery,
      // Reset filters when search query changes
      selectedGenres: searchQuery !== prev.searchQuery ? [] : prev.selectedGenres,
      minChapters: searchQuery !== prev.searchQuery ? 0 : prev.minChapters
    }));
  }, [searchParams, searchQuery]);

  // Fetch total pages and manage pagination
  useEffect(() => {
    const fetchTotalPages = async () => {
      try {
        const query = new URLSearchParams({
          page: 1,
          limit: filterData.itemsPerPage,
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
          navigate(`?query=${encodeURIComponent(filterData.searchQuery)}&page=1`, { replace: true });
        }
      } catch (err) {
        console.error("Error fetching total pages:", err);
      }
    };

    fetchTotalPages();
  }, [filterData, currentSort, currentPage, navigate, BASE_URL]);

  // Handle page changes
  const handlePageChange = (newPage) => {
    const validatedPage = Math.max(1, Math.min(newPage, totalPages));
    setCurrentPage(validatedPage);
    navigate(`?query=${encodeURIComponent(filterData.searchQuery)}&page=${validatedPage}`);
  };

  // Handle items per page changes
  const handleItemsPerPageChange = (newItemsPerPage) => {
    setFilterData(prev => ({
      ...prev,
      itemsPerPage: newItemsPerPage
    }));
    setCurrentPage(1);
    navigate(`?query=${encodeURIComponent(filterData.searchQuery)}&page=1`);
  };

  // Handle filter changes from GenreList
  const handleFilterData = (data) => {
    setFilterData(prev => ({
      ...prev,
      selectedGenres: Array.isArray(data.selectedGenres) ? data.selectedGenres : [],
      minChapters: Number(data.minChapters) || 1
    }));
    setCurrentPage(1);
    navigate(`?query=${encodeURIComponent(filterData.searchQuery)}&page=1`);
  };

  return (
    <div className="result-page-container">

        <GenreList 
            onSubmitData={handleFilterData} 
            initialGenres={filterData.selectedGenres}
            initialMinChapters={filterData.minChapters}
        />
        <div className="search-results-header">
        <h1>Search Results for: {filterData.searchQuery}</h1>
      </div>
      <div className="result-page-content">
        <div className="results-main">
          <div className="results-controls">
            <h2>{sortOptions[currentSort]}</h2>
            <SortBy onSortChange={setCurrentSort} />
          </div>
          
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
      </div>
    </div>
  );
}

export default ResultPage;