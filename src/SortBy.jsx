import React, {useState} from 'react';
import './sortBy.css'; // We'll create this

function SortBy({ currentSort, onSortChange }) {
  const sortOptions = {
    'a-z': 'A-Z',
    'newest': 'Recently Added',
    'updated': 'Recently Updated',
    'chapters': 'Most Chapters',
    'unread': 'Most Unread'
  };

  return (
    <div className="sort-by-container">
      <h2 className="sort-by-title">{sortOptions[currentSort]}</h2>
      <div className='sort-by-right'>
        <label className="sort-by-label">Sort by:</label>
        <select
          className="sort-by-select"
          value={currentSort}
          onChange={(e) => 
            {onSortChange(e.target.value)
              setSortBy(e.target.value)
            }}
        >
          <option value="a-z">A-Z</option>
          <option value="newest">Recently Added</option>
          <option value="updated">Recently Updated</option>
          <option value="chapters">Most Chapters</option>
          <option value="unread">Most Unread</option>
        </select>
      </div>
    </div>
  );
}

export default SortBy;