import React from 'react';
import {Link} from 'react-router-dom';

function Footer() {
  return (
    <div className="footer">
      <p>
        If you want to request deletion of your post, contact us at{' '}
        <strong>letters2casper@gmail.com</strong> |&nbsp;
        <Link to="/privacy_policy">Privacy Policy</Link>
      </p>
    </div>
  );
}

export default Footer;
