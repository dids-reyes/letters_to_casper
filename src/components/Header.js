// Header.js
import React from 'react';
import logo from '../lotties/ltc_logo_1.webp';
import {Tooltip} from 'react-tooltip';

function Header({searchTerm, handleSearchChange}) {
  return (
    <div className="header">
      <br />
      <img className="logo" src={logo} alt="ltc logo" width="400" height="70" />

      <div className="search-bar">
        <a
          href
          data-tooltip-id="my-tooltip"
          data-tooltip-content="You can search by keywords, author or recipient"
          data-tooltip-place="left-start"
          data-tooltip-delay-show={3000}
          data-tooltip-variant="info"
        >
          <input
            type="text"
            className="form-control search-input"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="🔍 Search Letters"
          />
        </a>
        <Tooltip id="my-tooltip" />
      </div>
    </div>
  );
}

export default Header;
