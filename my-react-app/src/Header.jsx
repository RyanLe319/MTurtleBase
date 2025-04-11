import React, {useState} from "react";
import "./header.css";
import { Link, useNavigate } from "react-router-dom";
import TurtleLogo from "./assets/TurtleLogo2.png";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import WebsiteLogo from "./WebsiteLogo";
import NavLinks from "./NavLinks";

function Header() {
    const [searchInput, setSearchInput] = useState("");
    const navigate = useNavigate();

    const handleSearchSubmit = (e) =>{
        e.preventDefault();

        if(searchInput.trim()){
            navigate(`/advancesearch?search=${encodeURIComponent(searchInput.trim())}`);
        }
    };

    return (
        <div className="header">
            <div className="left-group">
                <WebsiteLogo />
            </div>
            
            <h1 className="title">MTurtleBase</h1>
            
            <div className="right-group">
                <form className="search-container" onSubmit={handleSearchSubmit}>
                    <TextField
                        id="search-field"
                        placeholder="Search..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
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
                <NavLinks />
            </div>
        </div>
    );
}

export default Header;