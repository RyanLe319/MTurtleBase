import React from "react";
import WebsiteLogo from "./WebsiteLogo";
import NavLinks from "./NavLinks";
import "./footer.css";

function Footer() {

    let year = new Date().getFullYear();

    return (
        <div className="container footer">
            <footer className="d-flex flex-wrap justify-content-between align-items-center py-3 my-4 border-top">
                <p className="col-md-4 mb-0 text-body-secondary">© {year} MTurtleBase, Inc</p>


                <div className="footer-logo">
                    <WebsiteLogo  />
                </div>

                

            

                <div id="footer-nav">
                    <NavLinks />
                </div>

            </footer>
        </div>
    );
}

export default Footer;
