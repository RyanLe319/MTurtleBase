import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./mangaDetails.css";
import Rating from './Rating.jsx';

function MangaDetails() {
  const { manga_id } = useParams();
  const navigate = useNavigate();
  const [manga, setManga] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [tempValue, setTempValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [genreInput, setGenreInput] = useState("");
  const [allGenres, setAllGenres] = useState([]);
  const [filteredGenres, setFilteredGenres] = useState([]);
  const [showGenreDropdown, setShowGenreDropdown] = useState(false);
  const genreDropdownRef = useRef(null);
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;
  const [currentTier, setCurrentTier] = useState('');
  const [coverArtTempUrl, setCoverArtTempUrl] = useState("");


  useEffect(() => {
    const fetchMangaDetails = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/manga/${manga_id}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setManga(data);
        setCurrentTier(data.tier || '');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchGenres = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/genres`);
        if (response.ok) {
          const data = await response.json();
          setAllGenres(data.map(genre => genre.genre_name));
        }
      } catch (error) {
        console.error("Error fetching genres:", error);
      }
    };

    fetchMangaDetails();
    fetchGenres();
  }, [manga_id, BASE_URL]);

  useEffect(() => {
    if (genreInput.trim() === "") {
      setFilteredGenres(allGenres);
    } else {
      setFilteredGenres(
        allGenres.filter(genre =>
          genre.toLowerCase().includes(genreInput.toLowerCase())
        )
      );
    }
  }, [genreInput, allGenres]);

  const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('en-US').format(date);
  };

  const handleEditStart = (fieldName, currentValue) => {
    setEditingField(fieldName);
    setTempValue(currentValue || '');
    if (fieldName === 'genres') {
      setGenreInput("");
    }
  };

  const handleEditCancel = () => {
    setEditingField(null);
    setTempValue('');
    setGenreInput("");
    setShowGenreDropdown(false);
  };

  const handleEditSave = async () => {
    if (!editingField) return;
    
    setManga(prev => {
      if (editingField === 'genres') {
        return {
          ...prev,
          genres: tempValue.split(',').map(g => g.trim()).filter(g => g)
                         .map(genre_name => ({ genre_name }))
        };
      }
      return { ...prev, [editingField]: tempValue };
    });

    setIsSaving(true);
    try {
      const payload = { [editingField]: tempValue };
      
      if (editingField === 'genres') {
        payload.genres = tempValue.split(',').map(g => g.trim()).filter(g => g);
      }

      const response = await fetch(`${BASE_URL}/api/manga/${manga_id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Update failed');

      const updatedManga = await response.json();
      setManga(prev => ({ ...prev, ...updatedManga }));
      
      setEditingField(null);
      setTempValue('');
      setGenreInput("");
    } catch (err) {
      setError(err.message);
      setManga(prev => ({ ...prev }));
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

  const handleTierChange = async (newTier) => {
    const previousTier = currentTier;
    setCurrentTier(newTier);  // Optimistic update to the UI
  
    try {
      const response = await fetch(`${BASE_URL}/api/manga/${manga_id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tier: newTier }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to update tier');
      }
  
      const updatedManga = await response.json();
      setManga(prev => ({ ...prev, tier: updatedManga.tier }));
  
    } catch (err) {
      console.error("Error updating tier:", err);
      setCurrentTier(previousTier);  // Revert if the update fails
      alert("Failed to update tier. Please try again.");
    }
  };
  

  const renderEditableField = (label, fieldName, value, isDate = false, editable = true) => {
    if (editable && editingField === fieldName && fieldName !== 'genres') {
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
      <div 
        className={`view-field ${!editable ? 'non-editable' : ''}`} 
        onClick={() => editable && handleEditStart(fieldName, value)}
      >
        <span className="field-label">{label}</span>
        <span className="field-value">
          {isDate ? formatDate(value) : (value !== null && value !== undefined ? value : 'N/A')}
        </span>
      </div>
    );
  };


  const renderGenres = () => {
    if (editingField === 'genres') {
      const currentGenres = tempValue ? tempValue.split(',').map(g => g.trim()).filter(g => g) : [];
      
      const handleAddGenre = (genre) => {
        const genreToAdd = genre || genreInput.trim();
        if (!genreToAdd || currentGenres.includes(genreToAdd)) {
          setGenreInput("");
          setShowGenreDropdown(false);
          return;
        }
      
        const newGenres = [...currentGenres, genreToAdd];
        setTempValue(newGenres.join(", "));
        setGenreInput("");
        setShowGenreDropdown(false);
      };
      
      const handleRemoveGenre = (genreToRemove) => {
        const newGenres = currentGenres.filter(g => g !== genreToRemove);
        setTempValue(newGenres.join(", "));
      };

      const handleGenreKeyDown = (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleAddGenre();
        }
      };

      return (
        <div className="editing-field genres-editing" ref={genreDropdownRef}>
          <label>Genres</label>
          <div className="genre-input-container">
            <input
              type="text"
              value={genreInput}
              onChange={(e) => {
                setGenreInput(e.target.value);
                setShowGenreDropdown(true);
              }}
              onFocus={() => setShowGenreDropdown(true)}
              onKeyDown={handleGenreKeyDown}
              placeholder="Type to search or add genre"
            />
            <button
              type="button"
              className="add-genre-btn"
              onClick={() => handleAddGenre()}
              disabled={!genreInput.trim()}
            >
              Add
            </button>
            
            {showGenreDropdown && filteredGenres.length > 0 && (
              <div className="genre-dropdown">
                {filteredGenres.map(genre => (
                  <div
                    key={genre}
                    className="genre-dropdown-item"
                    onClick={() => handleAddGenre(genre)}
                  >
                    {genre}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="genre-tags-container">
            {currentGenres.map((genre) => (
              <span key={genre} className="genre-tag">
                {genre}
                <button
                  type="button"
                  className="remove-genre-btn"
                  onClick={() => handleRemoveGenre(genre)}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          
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
      <div className="genres-section" onClick={() => {
        const genresString = manga.genres?.map(g => g.genre_name).join(", ") || "";
        handleEditStart('genres', genresString);
      }}>
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


  const handleCoverArtSave = async () => {
    if (editingField !== "cover_art_url") return;
    
    setIsSaving(true);
    try {
      const img = new Image();
      img.src = coverArtTempUrl;
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error('Invalid image URL'));
      });
  
      const response = await fetch(`${BASE_URL}/api/manga/${manga_id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cover_art_url: coverArtTempUrl }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update cover art');
      }
  
      const responseData = await response.json();
      
      setManga(prev => ({
        ...prev,
        cover_art_url: responseData.manga.cover_art_url
      }));
      
      setEditingField(null);
      setCoverArtTempUrl("");
    } catch (err) {
      setError(err.message);
      setManga(prev => ({
        ...prev,
        cover_art_url: "https://media1.tenor.com/m/UNpuEsjDH_MAAAAC/one-piece-one-piece-zoro.gif"
      }));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="page-container">
      <div className="content-container">
        <button className="back-button" onClick={() => navigate(-1)}>
          ← Back
        </button>

        <div className="manga-header">
        
        <div className="cover-art">
          {editingField === "cover_art_url" ? (
            <div className="image-edit-container">
              <input
                type="text"
                value={coverArtTempUrl}
                onChange={(e) => setCoverArtTempUrl(e.target.value)}
                placeholder="Enter new image URL"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCoverArtSave();
                  } else if (e.key === 'Escape') {
                    handleEditCancel();
                  }
                }}
              />
              <div className="edit-buttons">
                <button
                  onClick={handleCoverArtSave}
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={handleEditCancel}
                  disabled={isSaving}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <img
              src={manga.cover_art_url || "https://media1.tenor.com/m/UNpuEsjDH_MAAAAC/one-piece-one-piece-zoro.gif"}
              alt={manga.title}
              onClick={() => {
                handleEditStart("cover_art_url", manga.cover_art_url || "");
                setCoverArtTempUrl(manga.cover_art_url || "");
              }}
              onError={(e) => {
                e.target.src = "https://media1.tenor.com/m/UNpuEsjDH_MAAAAC/one-piece-one-piece-zoro.gif";
              }}
            />
          )}
        </div>

          <div className="title-section">
            <div className="title-header">
              {renderEditableField("Title", "title", manga.title)}
            </div>
            
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
            
            <div className="tier-section">
              <Rating currentTier={currentTier} onTierChange={handleTierChange} />
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
                {renderEditableField("Record Created", "record_created", manga.record_created, true, false)}
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