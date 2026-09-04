import React from "react";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>
          If you want to request deletion of your post, contact us at{" "}
          letters2casper@gmail.com{" "}
        </p>
        <nav className="footer-nav" aria-label="Footer navigation">
          <Link
            to="/seek_help"
            style={{
              color: "white",
              fontWeight: "bold",
              textDecoration: "none",
            }}
          >
            Seek Help
          </Link>
          <Link
            to="/privacy_policy"
            style={{
              color: "white",
              fontWeight: "bold",
              textDecoration: "none",
            }}
          >
            Privacy Policy
          </Link>
          <Link
            to="/terms_and_conditions"
            style={{
              color: "white",
              fontWeight: "bold",
              textDecoration: "none",
            }}
          >
            Terms & Conditions
          </Link>
          <Link
            to="/developer_portal"
            style={{
              color: "white",
              fontWeight: "bold",
              textDecoration: "none",
            }}
          >
            Developers
          </Link>
          <Link
            to="/about_us"
            style={{
              color: "white",
              fontWeight: "bold",
              textDecoration: "none",
            }}
          >
            About Us
          </Link>
        </nav>
      </div>
    </footer>
  );
}

export default Footer;
