import React, { useState, useEffect, useRef } from "react";
import "./header.css";
import { useNavigate } from "react-router-dom";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import WebsiteLogo from "./WebsiteLogo";
import NavLinks from "./NavLinks";
import SearchDropDown from "./SearchDropDown";

function Header() {
    const [searchInput, setSearchInput] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const dropdownRef = useRef(null);
    const inputRef = useRef(null);
    const navigate = useNavigate();
    const BASE_URL = import.meta.env.VITE_BACKEND_URL;

    useEffect(() => {
        const fetchResults = async () => {
            if (searchInput.trim().length > 1) {
                setIsLoading(true);
                try {
                    const response = await fetch(
                        `${BASE_URL}/api/manga?search=${encodeURIComponent(searchInput)}&limit=8`
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

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            setShowDropdown(false);
            if (searchInput.trim()) {
                navigate('/advancesearch', {
                  state: {
                    initialSearchQuery: searchInput.trim(),
                    initialPage: 1
                  }
                });
                setSearchInput("");
            }
        }
    };

    const handleResultClick = (manga) => {
        setSearchInput("");
        setShowDropdown(false);
        setTimeout(() => {
            navigate(`/manga/${manga.manga_id}`);
            inputRef.current?.blur();
        }, 150);
    };

    const handleViewAllResults = () => {
        setSearchInput("");
        setShowDropdown(false);
        setTimeout(() => {
            navigate('/advancesearch', {
                state: {
                    initialSearchQuery: searchInput.trim(),
                    initialPage: 1
                }
            });
        }, 150);
    };

    return (
        <div className="header">
            <div className="left-group">
                <WebsiteLogo />
            </div>
            
            <h1 className="title">MTurtleBase</h1>
            
            <div className="right-group">
                <div className="search-container" ref={dropdownRef}>
                    <TextField
                        id="search-field"
                        placeholder="Search manga..."
                        value={searchInput}
                        onChange={(e) => {
                            setSearchInput(e.target.value);
                            setShowDropdown(e.target.value.trim().length > 1);
                        }}
                        onFocus={() => searchInput.trim().length > 1 && setShowDropdown(true)}
                        onKeyDown={handleKeyDown}
                        inputRef={inputRef}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                            inputProps: {
                                autoComplete: 'off',
                                autoCorrect: 'off',
                                autoCapitalize: 'off',
                                spellCheck: 'false',
                                role: 'searchbox',
                                'aria-autocomplete': 'list',
                                'aria-haspopup': 'false'
                            }
                        }}
                        variant="standard"
                        fullWidth
                    />
                    
                    {showDropdown && (
                        <SearchDropDown
                            results={searchResults}
                            isLoading={isLoading}
                            onResultClick={handleResultClick}
                            searchQuery={searchInput}
                            onViewAllResults={handleViewAllResults}
                        />
                    )}
                </div>
                <NavLinks />
            </div>
        </div>
    );
}

export default Header;