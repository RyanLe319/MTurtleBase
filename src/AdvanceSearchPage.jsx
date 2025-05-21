import React, { useState, useEffect } from "react";
import MangaGrid from "./MangaGrid";
import PaginationControls from "./PaginationControls";
import { useSearchParams, useNavigate } from "react-router-dom";
import "./advanceSearchPage.css";
import GenreList from "./GenreList";
import SortBy from "./SortBy";

function AdvanceSearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Parse all filters from URL
  const getFiltersFromParams = () => {
    const genres = searchParams.get("genres")?.split(",").filter(Boolean) || [];
    const minChapters = Number(searchParams.get("minChapters")) || 0;
    const searchQuery = searchParams.get("search") || "";
    const itemsPerPage = Number(searchParams.get("itemsPerPage")) || 20;
    const currentSort = searchParams.get("sort") || "newest";
    const page = Number(searchParams.get("page")) || 1;
    return {
      selectedGenres: genres,
      minChapters,
      searchQuery,
      itemsPerPage,
      currentSort,
      page,
    };
  };

  const [filterData, setFilterData] = useState(getFiltersFromParams());
  const [currentPage, setCurrentPage] = useState(filterData.page);
  const [totalPages, setTotalPages] = useState(1);

  // Sync filterData and currentPage with URL changes
  useEffect(() => {
    const newFilters = getFiltersFromParams();
    setFilterData(newFilters);
    setCurrentPage(newFilters.page);
  }, [searchParams]);

  // Always update URL when filters/page change
  const updateURL = (nextFilterData, nextPage) => {
    const params = new URLSearchParams();
    if (nextFilterData.selectedGenres?.length)
      params.set("genres", nextFilterData.selectedGenres.join(","));
    if (nextFilterData.minChapters)
      params.set("minChapters", nextFilterData.minChapters);
    if (nextFilterData.searchQuery)
      params.set("search", nextFilterData.searchQuery);
    if (nextFilterData.itemsPerPage)
      params.set("itemsPerPage", nextFilterData.itemsPerPage);
    if (nextFilterData.currentSort)
      params.set("sort", nextFilterData.currentSort);
    params.set("page", nextPage);
    setSearchParams(params, { replace: true });
  };

  // When filters are changed (from GenreList/Search/SortBy)
  const handleFilterData = (data) => {
    const nextFilterData = {
      ...filterData,
      ...data,
    };
    setFilterData(nextFilterData);
    setCurrentPage(1);
    updateURL(nextFilterData, 1);
  };

  // When sort is changed
  const handleSortChange = (sortKey) => {
    const nextFilterData = { ...filterData, currentSort: sortKey };
    setFilterData(nextFilterData);
    setCurrentPage(1);
    updateURL(nextFilterData, 1);
  };

  // When items per page is changed
  const handleItemsPerPageChange = (newItemsPerPage) => {
    const nextFilterData = { ...filterData, itemsPerPage: newItemsPerPage };
    setFilterData(nextFilterData);
    setCurrentPage(1);
    updateURL(nextFilterData, 1);
  };

  // When page is changed
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    updateURL(filterData, newPage);
  };

  // Fetch total pages (whenever relevant filter changes)
  useEffect(() => {
    const fetchTotalPages = async () => {
      try {
        const params = new URLSearchParams();
        params.set("page", 1);
        params.set("limit", filterData.itemsPerPage);
        if (filterData.selectedGenres?.length)
          params.set("genres", filterData.selectedGenres.join(","));
        if (filterData.minChapters)
          params.set("minChapters", filterData.minChapters);
        if (filterData.currentSort)
          params.set("sort", filterData.currentSort);
        if (filterData.searchQuery)
          params.set("search", filterData.searchQuery);
        const BASE_URL = import.meta.env.VITE_BACKEND_URL;
        const response = await fetch(`${BASE_URL}/api/manga?${params.toString()}`);
        if (!response.ok) throw new Error("Failed to fetch total pages");
        const data = await response.json();
        const calculatedTotalPages = Math.ceil((data.pagination?.total || 0) / filterData.itemsPerPage);
        setTotalPages(calculatedTotalPages);
        // If current page exceeds new total, reset to 1
        if (currentPage > calculatedTotalPages) {
          handlePageChange(1);
        }
      } catch (err) {
        console.error("Error fetching total pages:", err);
      }
    };
    fetchTotalPages();
    // eslint-disable-next-line
  }, [
    filterData.selectedGenres,
    filterData.minChapters,
    filterData.itemsPerPage,
    filterData.currentSort,
    filterData.searchQuery,
  ]);

  return (
    <div className="advance-search-container">
      <GenreList
        onSubmitData={handleFilterData}
        initialGenres={filterData.selectedGenres}
        initialMinChapters={filterData.minChapters}
      />

      <SortBy currentSort={filterData.currentSort} onSortChange={handleSortChange} />

      <MangaGrid
        currentPage={currentPage}
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

export default AdvanceSearchPage;