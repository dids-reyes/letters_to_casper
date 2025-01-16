import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>
          If you want to request deletion of your post, contact us at{' '}
          letters2casper@gmail.com{' '}
        </p>
        <p>
          <Link to="/seek_help" style={{ color: 'white', fontWeight: 'bold', textDecoration: 'none' }}>Seek Help</Link> |&nbsp;
          <Link to="/privacy_policy" style={{ color: 'white', fontWeight: 'bold', textDecoration: 'none' }}>Privacy Policy</Link> |&nbsp;
          <Link to="/terms_and_conditions" style={{ color: 'white', fontWeight: 'bold', textDecoration: 'none' }}>Terms & Conditions</Link> |&nbsp;
          <span style={{ color: 'white', fontWeight: 'bold' }}>Developers</span> |&nbsp;
          <Link to="/about_us" style={{ color: 'white', fontWeight: 'bold', textDecoration: 'none' }}>About Us</Link>
        </p>
      </div>
    </footer>
  );
}

export default Footer;
