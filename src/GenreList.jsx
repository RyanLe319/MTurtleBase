// Import necessary React hooks and components
import React, { useState, useEffect } from "react";
import "./genreList.css"; // Import CSS styles for this component
import EditIcon from '@mui/icons-material/Edit'; // Import edit icon
import DeleteIcon from '@mui/icons-material/Delete'; // Import delete icon
import ClearIcon from '@mui/icons-material/Clear'; // Import clear icon (though not currently used)

// Main component function with props for submitting data and initial values
function GenreList({ onSubmitData, initialGenres = [], initialMinChapters = 0}) {
  // State for the list of all available genres
  const [genres, setGenres] = useState([]);
  // State to control modal visibility
  const [showModal, setShowModal] = useState(false);
  // State for the new genre being added/edited
  const [newGenre, setNewGenre] = useState("");
  // State to track which genre is being edited
  const [editingGenre, setEditingGenre] = useState(null);
  // State for minimum chapters filter
  const [minChapters, setMinChapters] = useState(initialMinChapters);
  // State to show/hide stepper arrows
  const [showArrows, setShowArrows] = useState(false);
  // State for currently selected genres
  const [selectedGenres, setSelectedGenres] = useState(initialGenres);

  // Effect to sync with parent component's initial values
  // call the 2 sets whenever init genres and minchpts are changed
  useEffect(() => {
    setSelectedGenres(initialGenres);
    setMinChapters(initialMinChapters);
  }, [initialGenres, initialMinChapters]);

  // Function to increment chapter count
  const increment = () => setMinChapters(prev => prev + 1);
  // Function to decrement chapter count (minimum 1)
  const decrement = () => setMinChapters(prev => Math.max(1, prev - 1));

  // Effect to fetch genres from API when component mounts
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await fetch("https://mturtlebase-1.onrender.com/api/genres");
        if (!response.ok) throw new Error("Failed to fetch genres");
        const data = await response.json();
        // Extract genre names from response and update state
        setGenres(data.map(genre => genre.genre_name));
      } catch (error) {
        console.error("Error fetching genres: ", error);
      }
    };
    fetchGenres();
  }, []); // Empty dependency array means this runs once on mount

  // Function to handle adding a new genre
  const handleAddGenre = async () => {
    const trimmedGenre = newGenre.trim();
    // Check if genre is not empty and doesn't already exist
    if (trimmedGenre && !genres.includes(trimmedGenre)) {
      try {
        // POST request to add new genre
        const response = await fetch("https://mturtlebase-1.onrender.com/api/genres", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ genre_name: trimmedGenre }),
        });
        if (!response.ok) throw new Error("Failed to add genre");
        const newGenreData = await response.json();
        // Update genres list with new genre
        setGenres(prev => [...prev, newGenreData.genre_name]);
        setNewGenre(""); // Clear input
        setShowModal(false); // Close modal
      } catch (error) {
        console.error("Error adding genre: ", error);
      }
    }
  };

  // Function to prepare editing a genre
  const handleEditGenre = (genre) => {
    setEditingGenre(genre); // Set genre being edited
    setNewGenre(genre); // Pre-fill input with current name
    setShowModal(true); // Show modal
  };

  // Function to update an existing genre
  const handleUpdateGenre = async () => {
    const trimmedGenre = newGenre.trim();
    // Check if genre is not empty and we're editing an existing one
    if (trimmedGenre && editingGenre) {
      try {
        const encodedGenreName = encodeURIComponent(editingGenre);
        // PUT request to update genre
        const response = await fetch(
          `https://mturtlebase-1.onrender.com/api/genres/${encodedGenreName}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ genre_name: trimmedGenre }),
          });
        if (!response.ok) throw new Error("Failed to update genre");
        const updatedGenre = await response.json();
        // Update genres list with new name
        setGenres(genres.map(g => g === editingGenre ? updatedGenre.genre_name : g));
        setNewGenre(""); // Clear input
        setEditingGenre(null); // Reset editing state
        setShowModal(false); // Close modal
      } catch (error) {
        console.error("Error updating genre: ", error);
      }
    }
  };

  // Function to delete a genre
  const handleDeleteGenre = async (genreToDelete) => {
    try {
      const encodedGenreName = encodeURIComponent(genreToDelete);
      // DELETE request to remove genre
      const response = await fetch(
        `https://mturtlebase-1.onrender.com/api/genres/${encodedGenreName}`, {
          method: "DELETE",
        });
      if (!response.ok) throw new Error("Failed to delete genre");
      // Remove from both genres list and selected genres
      setGenres(prev => prev.filter(g => g !== genreToDelete));
      setSelectedGenres(prev => prev.filter(g => g !== genreToDelete));
    } catch (error) {
      console.error("Error deleting genre:", error);
    }
  };

  // Function to confirm deletion with a dialog
  const confirmDelete = (genre) => {
    if (window.confirm(`Delete "${genre}"?`)) {
      handleDeleteGenre(genre);
    }
  };

  // Function to handle genre selection via checkbox
  const handleGenreSelection = (event, genre) => {
    const updatedGenres = event.target.checked
      ? [...selectedGenres, genre] // Add if checked
      : selectedGenres.filter(g => g !== genre); // Remove if unchecked
    setSelectedGenres(updatedGenres);
  };

  // Function to handle manual chapter count input
  const handleMinChaptersChange = (value) => {
    const numValue = Math.max(0, Number(value) || 0); // Ensure non-negative number
    setMinChapters(numValue);
  };

  // Function to submit search criteria to parent
  const handleSearch = () => {
    onSubmitData({
      selectedGenres,
      minChapters
    });
  };

  // Function to reset all filters
  const handleResetFilters = () => {
    setSelectedGenres([]); // Clear selected genres
    setMinChapters(0); // Reset chapter count
    // Submit reset state to parent immediately
    onSubmitData({
      selectedGenres: [],
      minChapters: 0
    });
  };

  // Component render
  return (
    <div className="genre-filter-box">
      {/* Header section with title and add button */}
      <div className="filter-header">
        <h3 className="filter-title">Genres</h3>
        <button
          className="add-genre-btn"
          onClick={() => {
            setEditingGenre(null); // Ensure not in edit mode
            setNewGenre(""); // Clear input
            setShowModal(true); // Show modal
          }}
        >
          + Add Genre
        </button>
      </div>
  
      {/* Grid of genre checkboxes with edit/delete buttons */}
      <div className="genre-grid">
        {genres.map((genre) => (
          <div key={genre} className="genre-item-container">
            <label className="genre-item">
              <input
                type="checkbox"
                checked={selectedGenres.includes(genre)}
                onChange={(e) => handleGenreSelection(e, genre)}
              />
              <span>{genre}</span>
            </label>
            <div className="genre-actions">
              <button
                className="edit-btn"
                onClick={() => handleEditGenre(genre)}
                aria-label={`Edit ${genre}`}
              >
                <EditIcon fontSize="small" />
              </button>
              <button
                className="delete-btn"
                onClick={() => confirmDelete(genre)}
                aria-label={`Delete ${genre}`}
              >
                <DeleteIcon fontSize="small" />
              </button>
            </div>
          </div>
        ))}
      </div>
  
      {/* Bottom controls with chapter stepper and action buttons */}
      <div className="bottom-controls-row">
        <div
          className="number-stepper"
          onMouseEnter={() => setShowArrows(true)} // Show arrows on hover
          onMouseLeave={() => setShowArrows(false)} // Hide arrows when not hovering
        >
          <span className="stepper-label">Min Chapters:</span>
          <div className="stepper-input-container">
            <input
              type="number"
              min="0"
              value={minChapters}
              onChange={(e) => handleMinChaptersChange(e.target.value)}
              className="stepper-input"
            />
            {showArrows && (
              <div className="stepper-arrows">
                <button 
                  onClick={increment} 
                  className="stepper-arrow up"
                >
                  ▲
                </button>
                <button 
                  onClick={decrement} 
                  className="stepper-arrow down"
                >
                  ▼
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="filter-buttons-group">
            <button 
            className="reset-filters-btn"
            onClick={handleResetFilters}
            aria-label="Reset filters"
            >
            Clear
            </button>
            <button className="search-genre-btn" onClick={handleSearch}>
            Search
            </button>
        </div>
      </div>
  
      {/* Modal for adding/editing genres */}
      {showModal && (
        <div className="genre-modal">
          <div className="modal-content">
            <h4>{editingGenre ? "Edit Genre" : "Add New Genre"}</h4>
            <input
              type="text"
              value={newGenre}
              onChange={(e) => setNewGenre(e.target.value)}
              placeholder="Enter genre name"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && (editingGenre ? handleUpdateGenre() : handleAddGenre())}
            />
            <div className="modal-actions">
              <button
                className="modal-add-btn"
                onClick={editingGenre ? handleUpdateGenre : handleAddGenre}
              >
                {editingGenre ? "Update" : "Add"}
              </button>
              <button
                className="modal-cancel-btn"
                onClick={() => {
                  setShowModal(false);
                  setEditingGenre(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GenreList; // Export the component