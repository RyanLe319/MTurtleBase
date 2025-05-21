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
    <div className="nav-links-header">
      <>
        <div className="nav-links">
          <Link to="/page=1" onClick={scrollTop}>HOME</Link>
          <Link to="/watchlist" onClick={scrollTop}>WATCHLIST</Link>
          <Link to="/favoritepage" onClick={scrollTop}>FAVORITE</Link>
          <Link to="/advancesearch" onClick={scrollTop}>ADVANCE SEARCH</Link>
          <button 
            className="nav-link-btn" 
            onClick={handleAddMangaClick}
          >
            ADD MANGA
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
    </div>
  );
}

export default NavLinks;