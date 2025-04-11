import React, { useState, useEffect } from "react";
import "./mangaGrid.css";
import MangaCard from "./MangaCard";
import AddMangaForm from "./AddMangaForm";

function MangaGrid({ currentPage, filterData, isWatchlist = false }) {
  const [mangaList, setMangaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const limit = 10;

  useEffect(() => {
    const fetchManga = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          page: currentPage,
          limit: limit,
          sort: filterData.currentSort || 'newest',
          ...(filterData.minChapters > 0 && { minChapters: filterData.minChapters }),
          ...(filterData.searchQuery && { search: filterData.searchQuery })
        });

        if (filterData.selectedGenres?.length > 0) {
          params.append('genres', filterData.selectedGenres.join(','));
        }

        const endpoint = isWatchlist
          ? `http://localhost:3000/api/watchlist?${params}`
          : `http://localhost:3000/api/manga?${params}`;

        const response = await fetch(endpoint);

        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status}`);
        }

        const data = await response.json();
        setMangaList(data.data || []);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchManga, filterData.searchQuery ? 300 : 0);
    return () => clearTimeout(debounceTimer);
  }, [currentPage, isWatchlist, filterData.selectedGenres, filterData.minChapters, filterData.currentSort, filterData.searchQuery]);

  useEffect(() => {
    // Save current page to localStorage whenever it changes
    localStorage.setItem('lastMangaPage', currentPage);
  }, [currentPage]);

  const handleDeleteSuccess = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: limit,
        sort: filterData.currentSort || 'newest',
        ...(filterData.minChapters > 0 && { minChapters: filterData.minChapters }),
        ...(filterData.searchQuery && { search: filterData.searchQuery })
      });

      if (filterData.selectedGenres?.length > 0) {
        params.append('genres', filterData.selectedGenres.join(','));
      }

      const endpoint = isWatchlist
        ? `http://localhost:3000/api/watchlist?${params}`
        : `http://localhost:3000/api/manga?${params}`;

      const response = await fetch(endpoint);

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }

      const data = await response.json();
      setMangaList(data.data || []);
    } catch (err) {
      console.error("Fetch error in handleDeleteSuccess:", err);
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading manga...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <p>Error: {error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="retry-button"
        >
          Retry
        </button>
      </div>
    );
  }

  if (mangaList.length === 0) {
    return (
      <div className="empty-state">
        {filterData.searchQuery ? (
          <p>No manga found matching "{filterData.searchQuery}"</p>
        ) : (
          <p>No manga found with the current filters</p>
        )}
      </div>
    );
  }

 

  return (
    
    <div className="manga-grid">
      {mangaList.map((manga) => (
        <MangaCard
          key={manga.manga_id}
          manga={manga}
          onDeleteSuccess={handleDeleteSuccess}
        />
      ))}
    </div>
  );
}

export default MangaGrid;