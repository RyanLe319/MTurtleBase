import React, { useState, useEffect, useRef } from "react";
import "./header.css";
import { useNavigate } from "react-router-dom";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import WebsiteLogo from "./WebsiteLogo";
import NavLinks from "./NavLinks";

function Header() {
    const [searchInput, setSearchInput] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const BASE_URL = import.meta.env.VITE_BACKEND_URL;

    // Fetch search results when input changes
    useEffect(() => {
        const fetchResults = async () => {
            if (searchInput.trim().length > 1) {
                setIsLoading(true);
                try {
                    const response = await fetch(
                        `${BASE_URL}/api/manga?search=${encodeURIComponent(searchInput)}&limit=5`
                    );
                    if (response.ok) {
                        const data = await response.json();
                        setSearchResults(data.data || []);
                        setShowDropdown(data.data?.length > 0);
                    }
                } catch (error) {
                    console.error("Search error:", error);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setSearchResults([]);
                setShowDropdown(false);
            }
        };

        const debounceTimer = setTimeout(fetchResults, 300);
        return () => clearTimeout(debounceTimer);
    }, [searchInput, BASE_URL]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setShowDropdown(false);
        if (searchInput.trim()) {
            navigate(`/advancesearch?search=${encodeURIComponent(searchInput.trim())}`);
        }
    };

    const handleResultClick = (manga) => {
        setSearchInput(manga.title);
        setShowDropdown(false);
        navigate(`/manga/${manga.manga_id}`);
    };

    return (
        <div className="header">
            <div className="left-group">
                <WebsiteLogo />
            </div>
            
            <h1 className="title">MTurtleBase</h1>
            
            <div className="right-group">
                <div className="search-container" ref={dropdownRef}>
                    <form onSubmit={handleSearchSubmit}>
                        <TextField
                            id="search-field"
                            placeholder="Search manga..."
                            value={searchInput}
                            onChange={(e) => {
                                setSearchInput(e.target.value);
                                setShowDropdown(e.target.value.trim().length > 1);
                            }}
                            onFocus={() => searchInput.trim().length > 1 && setShowDropdown(true)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                            variant="standard"
                            fullWidth
                        />
                    </form>
                    
                    {showDropdown && (
                        <div className="search-dropdown">
                            {isLoading ? (
                                <div className="dropdown-item">Loading...</div>
                            ) : searchResults.length > 0 ? (
                                searchResults.map((manga) => (
                                    <div
                                        key={manga.manga_id}
                                        className="dropdown-item"
                                        onClick={() => handleResultClick(manga)}
                                    >
                                        {manga.title}
                                        {manga.alternative_title && (
                                            <span className="alternative-title">
                                                {manga.alternative_title}
                                            </span>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="dropdown-item">No results found</div>
                            )}
                        </div>
                    )}
                </div>
                <NavLinks />
            </div>
        </div>
    );
}

export default Header;