import React, { useState, useEffect, useRef } from "react";
import "./addMangaForm.css";

function AddMangaForm({ isOpen, onClose, onSuccess }) {
  const initialFormState = {
    title: "",
    lastChapterRead: 0,
    lastReadDate: "",
    status: "",
    latestChapter: 0,
    latestChapterDate: "",
    description: "",
    image: "",
    tier : "",
  };

  const [formData, setFormData] = useState(initialFormState);
  const [genreInput, setGenreInput] = useState("");
  const [genres, setGenres] = useState([]);
  const [allGenres, setAllGenres] = useState([]);
  const [filteredGenres, setFilteredGenres] = useState([]);
  const [showGenreDropdown, setShowGenreDropdown] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const popupRef = useRef(null);
  const genreDropdownRef = useRef(null);
  const [isFormValid, setIsFormValid] = useState(false);
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
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

    if (isOpen) {
      fetchGenres();
    }
  }, [isOpen, BASE_URL]);

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose();
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    const handleDropdownClickOutside = (event) => {
      if (genreDropdownRef.current && !genreDropdownRef.current.contains(event.target)) {
        setShowGenreDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleDropdownClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleDropdownClickOutside);
    };
  }, []);

  useEffect(() => {
    setIsFormValid(formData.title.trim().length > 0);
  }, [formData.title]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "description" && e.target.scrollHeight > e.target.clientHeight) {
      e.target.style.height = "auto";
      e.target.style.height = `${e.target.scrollHeight}px`;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleAddGenre = async (genre) => {
    const genreToAdd = genre || genreInput.trim();
    
    if (!genreToAdd) return;

    if (genres.includes(genreToAdd)) {
      setGenreInput("");
      setShowGenreDropdown(false);
      return;
    }

    if (!allGenres.includes(genreToAdd)) {
      try {
        const response = await fetch(`${BASE_URL}/api/genres`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ genre_name: genreToAdd }),
        });

        if (!response.ok) {
          throw new Error("Failed to add new genre");
        }

        const newGenre = await response.json();
        setAllGenres([...allGenres, newGenre.genre_name]);
      } catch (error) {
        console.error("Error adding new genre:", error);
        return;
      }
    }

    setGenres([...genres, genreToAdd]);
    setGenreInput("");
    setShowGenreDropdown(false);
  };

  const handleGenreInputChange = (e) => {
    setGenreInput(e.target.value);
    setShowGenreDropdown(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddGenre();
    }
  };

  const handleRemoveGenre = (genreToRemove) => {
    setGenres(genres.filter(genre => genre !== genreToRemove));
  };

  const handleSubmit = async (e) => { 
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData.title.trim()) { 
      setErrors({ title: "Title is required" }); 
      setIsSubmitting(false); 
      return; 
    }

    try {
      const response = await fetch(`${BASE_URL}/adding-manga`, { 
        method: "POST", 
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          genres: genres.length ? genres : null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json(); 
        throw new Error(errorData.error || "Failed to add manga"); 
      }

      const result = await response.json();
      console.log("Success:", result);

      setFormData(initialFormState);
      setGenres([]);
      onSuccess();
      onClose();
      localStorage.setItem('reloadingAfterAdd', 'true');
      window.location.reload();
    } catch (error) {
      console.error("Submission error:", error);
      setErrors({ submit: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`popup-overlay ${isOpen ? 'active' : ''}`}>
      <div className="popup-content" ref={popupRef} onClick={(e) => e.stopPropagation()}>
        <button
          className="close-btn"
          onClick={onClose}
          aria-label="Close form"
          disabled={isSubmitting}
        >
          ×
        </button>

        <h2>Add New Manga</h2>
        <button 
          className="clear-button"
          onClick={() => {
            setFormData(initialFormState);
            setGenreInput("");
            setGenres([]);
          }}
        >
          Clear
        </button>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">
              Title <span className="required">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={errors.title ? "error" : ""}
              disabled={isSubmitting}
            />
            {errors.title && (
              <span className="error-message">{errors.title}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="genre">Genres</label>
            <div className="genre-input-container" ref={genreDropdownRef}>
              <input
                type="text"
                id="genre"
                value={genreInput}
                onChange={handleGenreInputChange}
                onFocus={() => setShowGenreDropdown(true)}
                onKeyDown={handleKeyDown}
                placeholder="Type to search or add genre"
                disabled={isSubmitting}
              />
              <button
                type="button"
                className="add-genre-btn"
                onClick={() => handleAddGenre()}
                disabled={isSubmitting || !genreInput.trim()}
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
            
            {genres.length > 0 && (
              <div className="genre-tags-container">
                {genres.map((genre) => (
                  <span key={genre} className="genre-tag">
                    {genre}
                    <button
                      type="button"
                      className="remove-genre-btn"
                      onClick={() => handleRemoveGenre(genre)}
                      disabled={isSubmitting}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
  
          {/* Last chapter read input field */}
          <div className="form-group">
            <label htmlFor="lastChapterRead">Last Chapter Read</label>
            <input
              type="number"
              id="lastChapterRead"
              name="lastChapterRead"
              min="0"
              placeholder="0"
              value={formData.lastChapterRead} // Binds input value to formData
              onChange={handleChange} // Updates formData when input changes
              disabled={isSubmitting} // Disables input while submitting
            />
          </div>
  
          {/* Date last read input field */}
          <div className="form-group">
            <label htmlFor="lastReadDate">Date Last Read</label>
            <input
              type="date"
              id="lastReadDate"
              name="lastReadDate"
              value={formData.lastReadDate} // Binds input value to formData
              onChange={handleChange} // Updates formData when input changes
              disabled={isSubmitting} // Disables input while submitting
            />
          </div>
  
          {/* Status select field */}
          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status} // Binds input value to formData
              onChange={handleChange} // Updates formData when input changes
              disabled={isSubmitting} // Disables input while submitting
            >
              <option value="">Select status</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Completed">Completed</option>
              <option value="WatchList">WatchList</option>
              <option value="Dropped">Dropped</option>
            </select>
          </div>


          {/* Tier selection field */}
          <div className="form-group">
            <label htmlFor="tier">Tier Rating</label>
            <select
              id="tier"
              name="tier"
              value={formData.tier}
              onChange={handleChange}
              disabled={isSubmitting}
            >
              <option value="">Select tier</option>
              <option value="S-Tier-Plus">S Tier+</option>
              <option value="S-Tier">S Tier</option>
              <option value="S-Tier-Minus">S Tier-</option>
              <option value="A-Tier-Plus">Elite+</option>
              <option value="A-Tier">Elite</option>
              <option value="A-Tier-Minus">Elite-</option>
              <option value="B-Tier-Plus">Good Read+</option>
              <option value="B-Tier">Good Read</option>
              <option value="B-Tier-Minus">Good Read-</option>
              <option value="C-Tier">Readable</option>
              <option value="D-Tier">Brain Off</option>
              <option value="F-Tier">Headache</option>
            </select>
          </div>
  
          {/* Latest chapter input field */}
          <div className="form-group">
            <label htmlFor="latestChapter">Latest Chapter Available</label>
            <input
              type="number"
              id="latestChapter"
              name="latestChapter"
              min="0"
              placeholder="0"
              value={formData.latestChapter} // Binds input value to formData
              onChange={handleChange} // Updates formData when input changes
              disabled={isSubmitting} // Disables input while submitting
            />
          </div>
  
          {/* Latest chapter date input field */}
          <div className="form-group">
            <label htmlFor="latestChapterDate">Latest Chapter Available Date</label>
            <input
              type="date"
              id="latestChapterDate"
              name="latestChapterDate"
              value={formData.latestChapterDate} // Binds input value to formData
              onChange={handleChange} // Updates formData when input changes
              disabled={isSubmitting} // Disables input while submitting
            />
          </div>
  
          {/* Description textarea */}
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description} // Binds textarea value to formData
              onChange={handleChange} // Updates formData when input changes
              rows={3} // Sets the number of visible rows
              className="auto-expand-textarea" // CSS class for auto-expanding textarea
              disabled={isSubmitting} // Disables textarea while submitting
            />
          </div>
  
          {/* Cover image URL input field */}
          <div className="form-group">
            <label htmlFor="image">Cover Image URL</label>
            <input
              type="url"
              id="image"
              name="image"
              value={formData.image} // Binds input value to formData
              onChange={handleChange} // Updates formData when input changes
              placeholder="https://example.com/cover.jpg" 
              disabled={isSubmitting} // Disables input while submitting
            />
          </div>
  
          {/* Display submit error message */}
          {errors.submit && (
            <div className="error-message submit-error">{errors.submit}</div>
          )}
  
          {/* Submit button to add manga, disabled while submitting */}
          <button 
            type="submit" 
            className={`submit-btn ${isFormValid ? 'active' : ''}`}
            disabled={isSubmitting || !isFormValid}
          >
            {isSubmitting ? (
              <span className="submitting-text">
                Adding... <span className="spinner"></span>
              </span>
            ) : (
              "Add Manga"
            )}
          </button>
        </form>
      </div>
    </div>
  );
  
}

export default AddMangaForm;