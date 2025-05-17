import React from 'react';
import MangaGrid from './MangaGrid';
import { useNavigate } from 'react-router-dom';
import './homePage.css';

function HomePage() {
  const navigate = useNavigate();
  const [filterData] = React.useState({
    selectedGenres: [],
    minChapters: 0,
    currentSort: 'newest',
    itemsPerPage: 20 // Keep if used by MangaGrid
  });

  return (
    <div className="home-page">
      <MangaGrid 
        currentPage={1} // Default to first page
        filterData={filterData}
      />
      <button 
        className="home-more-button" 
        onClick={() => navigate('/advancesearch')}
      >
        More
      </button>
    </div>
  );
}

export default HomePage;