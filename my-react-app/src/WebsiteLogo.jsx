import React from "react";
import { Link } from "react-router-dom";
import TurtleLogo from "./assets/TurtleLogo2.png";
import "./websiteLogo.css";

function WebsiteLogo() {
	const scrollTop = () => {
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	return (
		<Link to="/" onClick={scrollTop} className="logo-link">
			<img src={TurtleLogo} className="turtleLogo" alt="Turtle logo" />
		</Link>
	);
}

export default WebsiteLogo;
