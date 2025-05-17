import React, { useState, useEffect } from 'react';
import MangaGrid from './MangaGrid';
import { useSearchParams, useNavigate } from 'react-router-dom';
import './homePage.css';

function HomePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(() => {
    return parseInt(searchParams.get('page')) || 1;
  });
  const [totalMangaCount, setTotalMangaCount] = useState(0);
  const [filterData] = useState({
    selectedGenres: [],
    minChapters: 0,
    currentSort: 'newest',
    itemsPerPage: 10
  });

  useEffect(() => {
    navigate(`?page=${currentPage}`, { replace: true });
  }, [currentPage]);

  return (
    <div className="home-page">
      <MangaGrid 
        currentPage={currentPage} 
        filterData={filterData}
      />
      <button 
        className="home-more-button" 
        onClick={() => navigate('/advancesearch', { state: { initialPage: currentPage } })}
      >
        More
      </button>
    </div>
  );
}

export default HomePage;