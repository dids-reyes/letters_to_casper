// Header.js
import React from 'react';

function Header({searchTerm, handleSearchChange}) {
  return (
    <div className="header">
      <h1 className="app-title">Letters to Casper</h1>
      <div className="search-bar">
        <input
          type="text"
          className="form-control search-input"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search letters"
        />
      </div>
    </div>
  );
}

export default Header;
