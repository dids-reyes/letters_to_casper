import React, {useState, useContext} from 'react';
import {useNavigate} from 'react-router-dom';
import logo from '../lotties/ltc_logo_1.webp';
import {AuthContext} from '../AuthContext';
import { render_base_url as render_url, api_key } from '../data/keys';
import {IoArrowForward, IoEyeOffOutline, IoEyeOutline, IoLockClosedOutline, IoPersonOutline, IoShieldCheckmarkOutline} from 'react-icons/io5';
import '../styles/Admin.css';

function Admin() {

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {login} = useContext(AuthContext);

  const navigate = useNavigate();

  const handleUsernameChange = event => {
    setUsername(event.target.value);
    if (error) setError('');
  };

  const handlePasswordChange = event => {
    setPassword(event.target.value);
    if (error) setError('');
  };

  const handleSubmit = async event => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');

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
      login(username);
      navigate('/admin_portal');
    } catch (error) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="admin-login">
      <div className="admin-login__ambient admin-login__ambient--one" />
      <div className="admin-login__ambient admin-login__ambient--two" />
      <div className="admin-login__letters" aria-hidden="true">
        <span /><span /><span /><span /><span /><span /><span />
      </div>
      <section className="admin-login__card" aria-labelledby="admin-login-title">
        <div className="admin-login__brand">
          <img
            className="admin-login__logo"
            src={logo}
            alt="Letters to Casper"
          />
          <span className="admin-login__access-badge"><IoShieldCheckmarkOutline /> Restricted access</span>
        </div>
        <header className="admin-login__heading">
          <span>Admin workspace</span>
          <h1 id="admin-login-title">Welcome back</h1>
          <p>Sign in to review and manage letters.</p>
        </header>
        <form className="admin-login__form" onSubmit={handleSubmit}>
          <div className="form-group-login">
            <label className="login-label" htmlFor="username">
              Username
            </label>
            <div className="admin-login__field">
              <IoPersonOutline aria-hidden="true" />
              <input className="login-input" type="text" id="username" value={username} onChange={handleUsernameChange} autoComplete="username" placeholder="Enter your username" disabled={isSubmitting} required />
            </div>
          </div>
          <div className="form-group-login">
            <label className="login-label" htmlFor="password">
              Password
            </label>
            <div className="admin-login__field">
              <IoLockClosedOutline aria-hidden="true" />
              <input className="login-input" type={showPassword ? 'text' : 'password'} id="password" value={password} onChange={handlePasswordChange} autoComplete="current-password" placeholder="Enter your password" disabled={isSubmitting} required />
              <button type="button" className="admin-login__password-toggle" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
              </button>
            </div>
          </div>
          {error && <div className="admin-login__error" role="alert"><span>!</span>{error}</div>}
          <button className="login-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? <><span className="admin-login__spinner" />Signing in…</> : <>Enter portal<IoArrowForward /></>}
          </button>
        </form>
        <footer className="admin-login__footer"><IoLockClosedOutline />Authorized administrators only</footer>
      </section>
    </main>
  );
}

export default Admin;
