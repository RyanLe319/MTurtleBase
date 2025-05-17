import React from 'react';
import MangaCardResult from './MangaCardResult';
import './SearchDropDown.css';
import { useNavigate } from 'react-router-dom';

function SearchDropDown({ results, isLoading, onResultClick, searchQuery, onViewAllResults }) {
  const maxPreviewResults = 5;
  const navigate = useNavigate();

  const handleViewAllResults = () => {
    onViewAllResults();
    setTimeout(() => {
      navigate(`/search-results?query=${encodeURIComponent(searchQuery)}&page=1`, {
        replace: true
      });
    }, 150);
  };

  return (
    <div className="search-dropdown">
      {isLoading ? (
        <div className="dropdown-loading">Loading...</div>
      ) : results.length > 0 ? (
        <>
          <div className="dropdown-results">
            {results.slice(0, maxPreviewResults).map((manga) => (
              <MangaCardResult 
                key={manga.manga_id} 
                manga={manga}
                onClick={() => onResultClick(manga)}
              />
            ))}
          </div>
          <div className="dropdown-footer">
            <span className="results-count">
            </span>
            <button 
              className="more-button"
              onClick={handleViewAllResults}
            >
              View All Results
            </button>
          </div>
        </>
      ) : (
        <div className="dropdown-empty">No results found</div>
      )}
    </div>
  );
}

export default SearchDropDown;