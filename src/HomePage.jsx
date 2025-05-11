import React, { useState, useEffect } from "react";
import MangaGrid from "./MangaGrid";
import { useNavigate } from "react-router-dom";
import "./homePage.css";

function HomePage() {
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;
  console.log("BASE URL IN HOMEpage: ", BASE_URL);
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(() => {
    if (localStorage.getItem('reloadingAfterAdd')) {
      localStorage.removeItem('reloadingAfterAdd');
      return parseInt(localStorage.getItem('lastMangaPage')) || 1;
    }
    return 1;
  });
  const [totalMangaCount, setTotalMangaCount] = useState(0);
  const [filterData] = useState({
    selectedGenres: [],
    minChapters: 0,
    currentSort: 'newest'
  });

  useEffect(() => {
    localStorage.setItem('lastMangaPage', currentPage);
  }, [currentPage]);

  useEffect(() => {
    const fetchTotalCount = async () => {
      const url = `${BASE_URL}/api/manga?page=1&limit=1`;
      console.log("🌐 [DEBUG] Full Request URL:", url);
      
      try {
        console.time('API Request Timer');
        const response = await fetch(url);
        console.timeEnd('API Request Timer');

        console.log("📦 [DEBUG] Response Headers:", [...response.headers.entries()]);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("❌ [DEBUG] Non-OK Response:", {
            status: response.status,
            statusText: response.statusText,
            body: errorText.slice(0, 200) // First 200 chars
          });
          throw new Error(`HTTP ${response.status}`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType?.includes('application/json')) {
          const text = await response.text();
          console.error("⚠️ [DEBUG] Non-JSON Response:", text.slice(0, 200));
          throw new Error(`Expected JSON, got ${contentType}`);
        }

        const data = await response.json();
        console.log("✅ [DEBUG] Successful Response:", {
          pagination: data.pagination,
          dataLength: data.data?.length
        });
        setTotalMangaCount(data.pagination.total);
      } catch (err) {
        console.error("🔥 [DEBUG] Fetch Error:", {
          error: err.message,
          stack: err.stack,
          timestamp: new Date().toISOString()
        });
      }
    };
    fetchTotalCount();
  }, []);
  

  const handleMoreClick = () => {
    const initialPage = Math.ceil(totalMangaCount / 10);
    navigate('/advancesearch', { state: { initialPage } });
  };

  return (
    <div className="home-page">
      <MangaGrid 
        currentPage={currentPage} 
        filterData={filterData}
      />
      <button 
        className="home-more-button" 
        onClick={handleMoreClick}
      >
        More
      </button>
    </div>
  );
}

export default HomePage;