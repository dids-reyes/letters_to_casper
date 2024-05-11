import React, {useState, useEffect, useContext} from 'react';
import {AuthContext} from '../AuthContext';
import '../AdminPortal.css';

function AdminPortal() {
  const {isLoggedIn} = useContext(AuthContext);

  const [letters, setLetters] = useState({
    messages: [],
    counts: {approved: 0, unapproved: 0},
  });
  const [loading, setLoading] = useState(0);

  let render_url;
  let api_key = process.env.REACT_APP_API_KEY;

  if (process.env.NODE_ENV === 'development') {
    render_url = 'http://localhost:8000';
  } else {
    render_url = process.env.REACT_APP_BASE_URL;
  }

  useEffect(() => {
    const fetchLetters = async () => {
      setLoading(1);
      try {
        const response = await fetch(`${render_url}/api/messages/unapproved`, {
          headers: {
            'x-api-key': api_key,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch letters');
        }
        const data = await response.json();
        setLetters(data.messages);
        setLoading(0);
      } catch (error) {
        console.error('Error fetching letters:', error);
        setLoading(2);
      }
    };

    fetchLetters();
  }, [render_url, api_key]);

  const [selectedLetters, setSelectedLetters] = useState([]);

  const handleSelectChange = event => {
    const newSelectedLetters = [...selectedLetters];
    const letterId = event.target.value;
    const isSelected = event.target.checked;

    if (isSelected) {
      newSelectedLetters.push(letterId);
    } else {
      const index = newSelectedLetters.indexOf(letterId);
      newSelectedLetters.splice(index, 1);
    }

    setSelectedLetters(newSelectedLetters);
  };

  const handleApproveLetters = async () => {
    if (!selectedLetters.length) {
      alert('Please select at least one letter to approve.');
      return;
    }

    try {
      const response = await fetch(`${render_url}/api/messages/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.REACT_APP_API_KEY,
        },
        body: JSON.stringify({letterIds: selectedLetters}),
      });

      if (!response.ok) {
        throw new Error('Failed to approve letters');
      }

      const updatedLetters = letters.filter(
        letter => !selectedLetters.includes(letter._id),
      );
      setLetters(updatedLetters);
      setSelectedLetters([]);
    } catch (error) {
      console.error('Error approving letters:', error);
      alert('An error occurred while approving letters.');
    }
  };

  if (!isLoggedIn) {
    return <p>You need to be logged in to access this page.</p>;
  }

  return (
    <div className="admin-portal">
      <center>
        <h3>Letters to Casper - Admin Portal</h3>
      </center>
      {loading === 1 && <p>Loading letters...</p>}
      {loading === 2 && <p>Error fetching letters!</p>}

      <center>
        <button
          className="approve-button"
          disabled={!selectedLetters.length}
          onClick={handleApproveLetters}
        >
          Approve Selected Letters
        </button>
      </center>
      {letters.length > 0 && (
        <ul
          className="letter-review-list"
          style={{listStyleType: 'none', paddingLeft: 0}}
        >
          {letters.map(letter => (
            <li key={letter._id} className="letter-item">
              <input
                type="checkbox"
                id={`letter-${letter._id}`}
                value={letter._id}
                checked={selectedLetters.includes(letter._id)}
                onChange={handleSelectChange}
              />
              <label htmlFor={`letter-${letter._id}`}>
                {/* Apply background color here */}
                <div style={{backgroundColor: '#f5f5f5', padding: '1rem'}}>
                  <p>From: {letter.from}</p>
                  <p>To: {letter.to}</p>
                  <p>Message: {letter.message}</p>
                </div>
              </label>
            </li>
          ))}
        </ul>
      )}
      {letters.length === 0 && !loading && <p>No unapproved letters found.</p>}
    </div>
  );
}

export default AdminPortal;
