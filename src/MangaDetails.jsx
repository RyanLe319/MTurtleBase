import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./mangaDetails.css";

function MangaDetails() {
  const { manga_id } = useParams();
  const navigate = useNavigate();
  const [manga, setManga] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [tempValue, setTempValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchMangaDetails = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/manga/${manga_id}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setManga(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMangaDetails();
  }, [manga_id]);

  // Format ISO date string into MM/DD/YYYY
  const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('en-US').format(date);
  };


  const handleEditStart = (fieldName, currentValue) => {
    setEditingField(fieldName);
    setTempValue(currentValue || '');
  };

  const handleEditCancel = () => {
    setEditingField(null);
    setTempValue('');
  };

  const handleEditSave = async () => {
    if (!editingField) return;
    
    setIsSaving(true);
    try {
      const response = await fetch(`${BASE_URL}/api/manga/${manga_id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ [editingField]: tempValue }),
      });

      if (!response.ok) throw new Error('Update failed');

      setManga(prev => ({ ...prev, [editingField]: tempValue }));
      setEditingField(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (e) => {
    setTempValue(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleEditSave();
    } else if (e.key === 'Escape') {
      handleEditCancel();
    }
  };

  const renderEditableField = (label, fieldName, value, isDate = false) => {
    if (editingField === fieldName) {
      // Special case for status field
      if (fieldName === 'status') {
        return (
          <div className="editing-field status-editing">
            <label>{label}</label>
            <select
              value={tempValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              autoFocus
            >
              <option value="">Select status</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Completed">Completed</option>
              <option value="WatchList">WatchList</option>
              <option value="Dropped">Dropped</option>
            </select>
            <div className="edit-buttons">
              <button onClick={handleEditSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save'}
              </button>
              <button onClick={handleEditCancel} disabled={isSaving}>
                Cancel
              </button>
            </div>
          </div>
        );
      }
      
      // Default input for other fields
      return (
        <div className="editing-field">
          <label>{label}</label>
          {isDate ? (
            <input
              type="date"
              value={tempValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              autoFocus
            />
          ) : (
            <input
              type="text"
              value={tempValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              autoFocus
            />
          )}
          <div className="edit-buttons">
            <button onClick={handleEditSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save'}
            </button>
            <button onClick={handleEditCancel} disabled={isSaving}>
              Cancel
            </button>
          </div>
        </div>
      );
    }
  
    return (
      <div className="view-field" onClick={() => handleEditStart(fieldName, value)}>
        <span className="field-label">{label}</span>
        <span className="field-value">
          {isDate ? formatDate(value) : (value !== null && value !== undefined ? value : 'N/A')}
        </span>
      </div>
    );
  };

  const renderGenres = () => {
    if (editingField === 'genres') {
      return (
        <div className="editing-field">
          <label>Genres</label>
          <input
            type="text"
            value={tempValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Comma separated genres"
            autoFocus
          />
          <div className="edit-buttons">
            <button onClick={handleEditSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save'}
            </button>
            <button onClick={handleEditCancel} disabled={isSaving}>
              Cancel
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="genres-section" onClick={() => handleEditStart('genres', manga.genres?.map(g => g.genre_name).join(', '))}>
        <h3>Genres</h3>
        <div className="genres-list">
          {manga.genres && manga.genres.length > 0 ? (
            manga.genres.map(genre => (
              <span key={genre.genre_id} className="genre-tag">
                {genre.genre_name}
              </span>
            ))
          ) : (
            <span>No genres listed</span>
          )}
        </div>
      </div>
    );
  };

  if (loading) return <div className="loading-container">Loading manga details...</div>;
  if (error) return <div className="error-container">Error: {error}</div>;
  if (!manga) return <div className="not-found-container">Manga not found</div>;

  return (
    <div className="page-container">
      <div className="content-container">
        <button className="back-button" onClick={() => navigate(-1)}>
          ← Back
        </button>

        <div className="manga-header">
          <div className="cover-art">
            <img
              src={manga.cover_art_url || "https://via.placeholder.com/300x400"}
              alt={manga.title}
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/300x400";
              }}
            />
          </div>
          <div className="title-section">
            {renderEditableField("Title", "title", manga.title)}
            {manga.alternative_title && (
              <h2 className="alternative-title">
                {renderEditableField("Alternative Title", "alternative_title", manga.alternative_title)}
              </h2>
            )}
            <div 
              className={`status-badge ${editingField === 'status' ? 'editing' : ''}`} 
              data-status={editingField === 'status' ? '' : manga.status}
            >
              {renderEditableField("Status", "status", manga.status)}
            </div>
          </div>
        </div>

        <div className="manga-content">
          <div className="details-section">
            <h3>Details</h3>
            <div className="details-grid">
              <div className="detail-item">
                {renderEditableField("Year Published", "year_published", manga.year_published)}
              </div>
              <div className="detail-item">
              {renderEditableField("Latest Chapter", "latest_chapter", manga.latest_chapter)}

              </div>
              <div className="detail-item">
              {renderEditableField("Latest Chapter Date", "latest_chapter_date", manga.latest_chapter_date, true)}
              </div>
              <div className="detail-item">
                {renderEditableField("Last Chapter Read", "last_chapter_read", manga.last_chapter_read)}
              </div>
              <div className="detail-item">
                {renderEditableField("Added to Watchlist", "date_added_to_watchlist", manga.date_added_to_watchlist, true)}

              </div>
              <div className="detail-item">
              {renderEditableField("Record Created", "record_created", manga.record_created, true)}
              </div>
              <div className="detail-item">
                {renderEditableField("Last Updated", "record_updated_date", manga.record_updated_date, true)}
              </div>
              <div className="detail-item">
                <span className="detail-label">Chapters Behind:</span>
                <span>
                  {Math.max(0, (manga.latest_chapter || 0) - (manga.last_chapter_read || 0))}
                </span>
              </div>
            </div>
          </div>

          {renderGenres()}

          <div className="description-section">
            <h3>Description</h3>
            {renderEditableField("", "description", manga.description)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MangaDetails;