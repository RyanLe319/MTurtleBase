import React from 'react';
import { useNavigate } from 'react-router-dom';
import './MangaCardResult.css';

function MangaCardResult({ manga, onClick }) {
  const navigate = useNavigate();

    // Ensure you're not accidentally calling navigate twice
    const handleClick = (e) => {
        e.preventDefault();
        e.stopPropagation(); // Add this to prevent bubbling
        navigate(`/manga/${manga.manga_id}`); // SINGLE navigate call
    };

  return (
    <div 
      className="manga-card-result"
      onClick={handleClick}
    >
      <div className="cover-container">
        <img
          src={manga.cover_art_url || "https://via.placeholder.com/100x140"}
          alt={manga.title}
          className="cover-image"
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/100x140";
          }}
        />
      </div>
      
      <div className="info-container">
        <h2 className="manga-title">{manga.title}</h2>
        {manga.alternative_title && (
          <p className="alternative-title">{manga.alternative_title}</p>
        )}
        <p className="chapter-info">
          Latest: Ch. {manga.latest_chapter || "N/A"}
        </p>
      </div>
    </div>
  );
}

export default MangaCardResult;