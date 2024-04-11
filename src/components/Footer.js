import React from 'react';
import {Link} from 'react-router-dom';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>
          If you want to request deletion of your post, contact us at{' '}
          <strong>letters2casper@gmail.com</strong>{' '}
        </p>
        <p>
          <Link to="/privacy_policy">Privacy Policy</Link> |&nbsp;
          <Link to="/terms_and_conditions">Terms and Conditions</Link> |&nbsp;
          <Link to="/about_us">About Us</Link>
        </p>
      </div>
    </footer>
  );
}

export default Footer;
