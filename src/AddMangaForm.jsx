import React, { useState, useEffect, useRef } from "react";
import "./addMangaForm.css";

function AddMangaForm({ isOpen, onClose, onSuccess } ) {

  // Initial form state for all input fields
  const initialFormState = {
    title: "",
    lastChapterRead: 0,
    lastReadDate: "",
    status: "",
    latestChapter: 0,
    latestChapterDate: "",
    description: "",
    image: "",
  };

  
  const [formData, setFormData] = useState(initialFormState); // Stores the form data
  const [genreInput, setGenreInput] = useState(""); // Tracks the genre input field value
  const [genres, setGenres] = useState([]); // Tracks added genres
  const [errors, setErrors] = useState({}); // Use to display Title is require error
  const [isSubmitting, setIsSubmitting] = useState(false); // Tracks the form submission status which is used to disable the form to prevent spam submission
  const popupRef = useRef(null); // Creates a reference to the popup for handling outside clicks
  const [isFormValid, setIsFormValid] = useState(false);
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;


   // useEffect hook to handle closing the form if the user clicks outside or presses Escape
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

    //If form is open, listen for clicks and esc 
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    //Clean up fnc that gets executed first 
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    setIsFormValid(formData.title.trim().length > 0);
  }, [formData.title]);

  // Update the form
  const handleChange = (e) => {

    //name and values are keys specified on the element that activated the event 
    const { name, value } = e.target;
    
    //Increase the height of the description box if need be
    if (name === "description" && e.target.scrollHeight > e.target.clientHeight) {
      e.target.style.height = "auto";
      e.target.style.height = `${e.target.scrollHeight}px`;
    }

    //Update the info whenever a new input is discovered
    setFormData((prev) => ({
      ...prev, // Spread the current state into a new object
      [name]: value, // Update the specific field (name) with the new value
    }));

    // This will occur when the user tries to submit a form with no title, the error will get assign
    // the error will display, the only error is title is required
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Adding a genre to the list of genres, first checks if there is anything
  // typed in the input field and if the genre isnt in genres if so then add it
  // and clear the input field
  const handleAddGenre = () => {
    if (genreInput.trim() && !genres.includes(genreInput.trim())) {
      setGenres([...genres, genreInput.trim()]);
      setGenreInput("");
    }
  };

  // To remove an added genre
  const handleRemoveGenre = (genreToRemove) => {
    setGenres(genres.filter(genre => genre !== genreToRemove));
  };

  // Allows the use of the enter key to add and not just the add button
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddGenre();
    }
  };

  // Adds the manga to the DB
  const handleSubmit = async (e) => { 
    e.preventDefault(); // Prevents the default form submission behavior, so the page doesn't refresh when the form is submitted
    
    setIsSubmitting(true); 

    // Validate that the title field is not empty
    if (!formData.title.trim()) { 
      setErrors({ title: "Title is required" }); 
      setIsSubmitting(false); 
      return; 
    }

    try {
      const response = await fetch(`${BASE_URL}/adding-manga`, { 
        method: "POST", 
        headers: {
          "Content-Type": "application/json", // Sets the request header to indicate we're sending JSON data
        },
        //What we are sending over
        body: JSON.stringify({
          ...formData, // Sends all the data from the form (title, description, etc.)
          genres: genres.length ? genres : null, // Sends genres if there are any, or null if there are none
        }),
      });



      // Checks if the response from the server is successful (status code 200-299)
      if (!response.ok) { // If the response status is not OK (e.g., 404 or 500 error)
        const errorData = await response.json(); 
        throw new Error(errorData.error || "Failed to add manga"); 
      }

      
      const result = await response.json(); // need to do .json cause its was stringified. Just a success message object
      console.log("Success:", result); 

      setFormData(initialFormState); //Clears the form
      setGenres([]); // Clears the genres array 
      onSuccess(); // Calls the onSuccess callback (fnc passed as the 3rd argu) to handle additional success actions (Green successful add notification)
      onClose(); // Closes the form 
      // Save flag that we're reloading after add
      localStorage.setItem('reloadingAfterAdd', 'true');
      window.location.reload();
    } catch (error) { // Catches any errors thrown during the try block
      console.error("Submission error:", error); 
      setErrors({ submit: error.message }); 
    } finally {
      setIsSubmitting(false); 
    }
  };


  // If the form is not open, return null to avoid rendering
  if (!isOpen) return null;

  return (
    // Popup overlay that is conditionally active based on isOpen state
    <div className={`popup-overlay ${isOpen ? 'active' : ''}`}>
      
      {/* Popup content container that stops click propagation to close the popup */}
      <div className="popup-content" ref={popupRef} onClick={(e) => e.stopPropagation()}>
        
        {/* Close button to close the form, disabled while submitting */}
        <button
          className="close-btn"
          onClick={onClose} // Calls the onClose function to close the popup
          aria-label="Close form"
          disabled={isSubmitting} // Disables button while submitting
        >
          ×
        </button>
  

        <h2>Add New Manga</h2>  
        <button 
          className="clear-button"
          onClick={()=>{
            setFormData(initialFormState)
            setGenreInput("")
          }}
        >Clear</button>
  
 
        {/* Form to add new manga, triggers handleSubmit on form submission */}
        <form onSubmit={handleSubmit}>
          
          {/* Title input field */}
          <div className="form-group">
            <label htmlFor="title">
              Title <span className="required">*</span> {/* Required field indicator */}
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title} // Binds input value to formData
              onChange={handleChange} // Updates formData when the input changes
              className={errors.title ? "error" : ""} // Adds error class if there's an error
              disabled={isSubmitting} // Disables input while submitting
            />
            {/* Display error message if there's an error */}
            {errors.title && (
              <span className="error-message">{errors.title}</span>
            )}
          </div>
  
          {/* Genre input field */}
          <div className="form-group">
            <label htmlFor="genre">Genres</label>
            <div className="genre-input-container">
              <input
                type="text"
                id="genre"
                value={genreInput} // Binds input value to genreInput state
                onChange={(e) => setGenreInput(e.target.value)} // Updates genreInput state
                onKeyDown={handleKeyDown} // Handles keydown event (e.g., Enter key)
                placeholder="Enter genre and click Add" 
                disabled={isSubmitting} // Disables input while submitting
              />
              <button
                type="button"
                className="add-genre-btn"
                onClick={handleAddGenre} // Adds genre when clicked
                disabled={isSubmitting || !genreInput.trim()} // Disables button if genre input is empty or submitting
              >
                Add
              </button>
            </div>
            {/* Display added genres as tags */}
            {genres.length > 0 && (
              <div className="genre-tags-container">
                {genres.map((genre) => (
                  <span key={genre} className="genre-tag">
                    {genre}
                    {/* Button to remove a genre */}
                    <button
                      type="button"
                      className="remove-genre-btn"
                      onClick={() => handleRemoveGenre(genre)} // Removes genre from list
                      disabled={isSubmitting} // Disables button while submitting
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