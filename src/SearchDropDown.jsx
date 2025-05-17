import React from 'react';
import MangaCardResult from './MangaCardResult';
import './SearchDropDown.css';

function SearchDropDown({ results, isLoading, onResultClick }) {
  return (
    <div className="search-dropdown">
      {isLoading ? (
        <div className="dropdown-loading">Loading...</div>
      ) : results.length > 0 ? (
        <>
          <div className="dropdown-results">
            {results.map((manga) => (
              <MangaCardResult 
                key={manga.manga_id} 
                manga={manga}
                onClick={onResultClick} // Pass the click handler
              />
            ))}
          </div>
          <div className="dropdown-footer">
            <span>Total Results: {results.length}</span>
            <span className="more-link">More</span>
          </div>
        </>
      ) : (
        <div className="dropdown-empty">No results found</div>
      )}
    </div>
  );
}

export default SearchDropDown;