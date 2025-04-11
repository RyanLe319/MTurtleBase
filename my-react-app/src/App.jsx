import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./Header";
import WatchListPage from "./WatchListPage";
import HomePage from "./HomePage";
import AdvanceSearchPage from "./AdvanceSearchPage";
import MangaDetails from "./MangaDetails";
import Footer from "./Footer";
import ScrollToTop from "./ScrollToTop";
import "./App.css";

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="container">
        <Header />
        
        <div className="body-section">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/watchlist" element={<WatchListPage />} />
            <Route path="/advancesearch" element={<AdvanceSearchPage />} />
            <Route path="/mangadetails/:manga_id" element={<MangaDetails />} />
            
            {/* Fallback routes */}
            <Route path="/addmanga" element={<HomePage />} />
            <Route path="*" element={<HomePage />} />
          </Routes>
        </div>

        <Footer />
      </div>
    </Router>
  );
}

export default App;