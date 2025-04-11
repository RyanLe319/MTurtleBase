import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./navLinks.css";
import AddMangaForm from "./AddMangaForm";
import Notification from "./Notification";

function NavLinks() {
  const [showForm, setShowForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const scrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddMangaClick = () => {
    setShowForm(true);
  };

  const handleFormSubmitSuccess = () => {
    setShowForm(false);
    setShowSuccess(true);
    
    // Auto-hide notification after 5 seconds
    setTimeout(() => {
      setShowSuccess(false);
    }, 2000);
  };

  return (
    <>
      <div className="nav-links">
        <Link to="/" onClick={scrollTop}>Home</Link>
        <Link to="/watchlist" onClick={scrollTop}>WatchList</Link>
        <Link to="/advancesearch" onClick={scrollTop}>Advance Search</Link>
        <button 
          className="nav-link-btn" 
          onClick={handleAddMangaClick}
        >
          Add Manga
        </button>
      </div>
      
      <AddMangaForm 
        isOpen={showForm} 
        onClose={() => setShowForm(false)}
        onSuccess={handleFormSubmitSuccess}
      />
      
      {showSuccess && (
        <Notification 
          message="Manga added successfully!" 
          type="success" 
        />
      )}
    </>
  );
}

export default NavLinks;