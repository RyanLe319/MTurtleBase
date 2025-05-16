// MangaCardResult.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "./MangaCardResult.css"; // Basic styling (will draft below)

function MangaCardResult({ manga }) {
  const navigate = useNavigate();

  return (
    <div 
      className="manga-card-result"
      onClick={() => navigate(`/manga/${manga.manga_id}`)} // Will connect later
    >
      <img
        src={manga.cover_art_url || "https://via.placeholder.com/50x70"}
        alt={manga.title}
        className="cover-art"
        onError={(e) => {
          e.target.src = "https://via.placeholder.com/50x70";
        }}
      />
      <div className="text-content">
        <h3 className="title">{manga.title}</h3>
        <p className="chapter">Ch. {manga.latest_chapter || "N/A"}</p>
      </div>
    </div>
  );
}

export default MangaCardResult;