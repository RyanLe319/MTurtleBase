import React from "react";
import "./SearchDropDown.css";

function SearchDropDown({ results, isLoading, onResultClick }) {
  return (
    <div className="search-dropdown">
      {isLoading ? (
        <div className="dropdown-item">Loading...</div>
      ) : results.length > 0 ? (
        <>
          <div className="dropdown-results">
            {results.map((manga) => (
              <div
                key={manga.manga_id}
                className="dropdown-item"
                onClick={() => onResultClick(manga)}
              >
                {manga.title}
                {manga.alternative_title && (
                  <span className="alternative-title">
                    {manga.alternative_title}
                  </span>
                )}
              </div>
            ))}
          </div>
          <div className="dropdown-footer">
            <span>Total Results: {results.length}</span>
            <span className="more-link">More</span>
          </div>
        </>
      ) : (
        <div className="dropdown-item">No results found</div>
      )}
    </div>
  );
}

export default SearchDropDown;