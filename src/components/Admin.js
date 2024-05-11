import React, {useState, useContext} from 'react';
import {useNavigate} from 'react-router-dom'; // Import useNavigate hook
import logo from '../lotties/ltc_logo_1.webp';
import {AuthContext} from '../AuthContext';
import '../admin.css';

function Admin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const {setIsLoggedIn} = useContext(AuthContext);

  const navigate = useNavigate(); // Utilize useNavigate hook

  const handleUsernameChange = event => {
    setUsername(event.target.value);
  };

  const handlePasswordChange = event => {
    setPassword(event.target.value);
  };

  let render_url;
  let api_key = process.env.REACT_APP_API_KEY;

  if (process.env.NODE_ENV === 'development') {
    render_url = 'http://localhost:8000';
  } else {
    render_url = process.env.REACT_APP_BASE_URL;
  }

  const handleSubmit = async event => {
    event.preventDefault();

    try {
      const response = await fetch(`${render_url}/api/login`, {
        method: 'POST',
        headers: {
          'x-api-key': api_key,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({username, password}),
      });

      if (!response.ok) {
        const {error} = await response.json();
        throw new Error(error);
      }
      setIsLoggedIn(true);
      navigate('/admin_portal');
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <center>
          <img
            id="logo-ltc"
            className="logo"
            src={logo}
            alt="Letters to Casper"
            width="250"
            height="50"
          />
        </center>
        <br />
        <form onSubmit={handleSubmit}>
          <div className="form-group-login">
            <label className="login-label" htmlFor="username">
              Username:
            </label>
            <input
              className="login-input"
              type="text"
              id="username"
              value={username}
              onChange={handleUsernameChange}
              autoComplete="username"
              required
            />
          </div>
          <div className="form-group-login">
            <label className="login-label" htmlFor="password">
              Password:
            </label>
            <input
              className="login-input"
              type="password"
              id="password"
              value={password}
              onChange={handlePasswordChange}
              autoComplete="current-password"
              required
            />
            {error && <div style={{color: 'red'}}>{error}</div>}
          </div>
          <button className="login-button" type="submit">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Admin;
