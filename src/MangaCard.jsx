import React, { useState } from "react";
import PropTypes from 'prop-types';
import "./mangaCard0.css";
import { Link } from "react-router-dom";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';


function MangaCard({ manga , onDeleteSuccess }) {

  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  // Safely calculate unread chapters
  const unreadChapters = Math.max(0, 
    (manga.latest_chapter || 0) - (manga.last_chapter_read || 0)
  );

  // Format dates safely
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return '';
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${manga.title}"?`
    );
    if (!confirmDelete) return;
  
    setIsDeleting(true);
    setError(null);
  
    try {
      const response = await fetch(`https://mturtlebase.onrender.com/api/manga/${manga.manga_id}`, {
        method: 'DELETE'
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete manga');
      }
  
      onDeleteSuccess(); // Now refetches the list properly
    } catch (err) {
      console.error('Delete failed:', err);
      setError(err.message);
    } finally {
      setIsDeleting(false);
    }
  };
  


  return (
    <div className="manga-card">
      <div className="manga-card-image">
        <img 
          src={manga.cover_art_url || "https://media1.tenor.com/m/UNpuEsjDH_MAAAAC/one-piece-one-piece-zoro.gif"} 
          alt={manga.title} 
          onError={(e) => {
            e.target.src = "https://media1.tenor.com/m/UNpuEsjDH_MAAAAC/one-piece-one-piece-zoro.gif";
          }}
        />
      </div>
      <div className="manga-card-info">
        <div className="corner-badge">{manga.status}</div>
        <div className="title-group">
          <h2 className="main-title">{manga.title}</h2>
          {manga.alternative_title && (
            <p className="alt-title">{manga.alternative_title}</p>
          )}
        </div>
        <div className="chapter-group">
          <h2 className="sub-titles">
            Last Chapter Read: {manga.last_chapter_read || "0"}
            {manga.date_added_to_watchlist && ` (${formatDate(manga.date_added_to_watchlist)})`}
          </h2>
          <p className="chapter-difference">
            Unread: {unreadChapters}
          </p>
          <h2 className="sub-titles">
            Latest Chapter Available: {manga.latest_chapter || "0"}
            {manga.latest_chapter_date && ` (${formatDate(manga.latest_chapter_date)})`}
          </h2>
        </div>
        {manga.description && (
          <div className="description-group">
            <h2 className="description-title">Description: </h2>
            <p>{manga.description}</p>
          </div>
        )}
        <div className="button-group">
          <Link to={`/mangadetails/${manga.manga_id}`} className="edit">
            <button><EditIcon /></button>
          </Link>
          <button 
              className="delete"
              onClick={handleDelete}
          >
              <DeleteIcon />
          </button>
          {error && (
              <div className="error-message">
                  {error}
              </div>
          )}
          <Link to={`/mangadetails/${manga.manga_id}`} className="more">More</Link>
        </div>
      </div>
    </div>
  );
}

MangaCard.propTypes = {
  manga: PropTypes.shape({
    manga_id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    alternative_title: PropTypes.string,
    cover_art_url: PropTypes.string,
    status: PropTypes.string,
    description: PropTypes.string,
    latest_chapter: PropTypes.number,
    latest_chapter_date: PropTypes.string,
    last_chapter_read: PropTypes.number,
    date_added_to_watchlist: PropTypes.string
  }).isRequired
};

export default MangaCard;