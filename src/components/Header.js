// Header.js
import React from 'react';
import logo from '../lotties/letters-to-casper-high-resolution-logo-transparent.webp';

function Header({searchTerm, handleSearchChange}) {
  return (
    <div className="header">
      <br />
      <img src={logo} alt="ltc logo" width="300" height="100" />

      <div className="search-bar">
        <input
          type="text"
          className="form-control search-input"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="🔍 Search Letters"
        />
      </div>
    </div>
  );
}

export default Header;
