import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CustomerLayout from '../components/CustomerLayout';

function ReleasesCustomerPage() {
  const [books, setBooks] = useState([]);
  const [pullList, setPullList] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };

        // Fetch all books
        const booksRes = await axios.get('/api/books', config);
        setBooks(booksRes.data);

        // Fetch user's current pull list
        const userRes = await axios.get('/api/users/me', config);
        setPullList(userRes.data.pullList.map(item => item.bookId));
      } catch (err) {
        setError(err.response?.data?.message || 'Could not fetch data');
      }
    };

    fetchData();
  }, []);

  const handlePull = async (bookId) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      await axios.post('/api/users/me/pull-list', { bookId }, config);
      
      // Add book to local pull list state to update UI instantly
      setPullList([...pullList, bookId]);
      setMessage('Book added to your pull list!');
      setTimeout(() => setMessage(''), 3000); // Clear message after 3 seconds

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add to pull list');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <CustomerLayout title="Releases">
      <div>
        {message && <p style={{ color: 'green' }}>{message}</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Series Title</th>
              <th>Issue #</th>
              <th>Publisher</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book) => (
              <tr key={book._id}>
                <td>{book.seriesTitle}</td>
                <td>{book.issueNumber}</td>
                <td>{book.publisher}</td>
                <td>
                  <button 
                    onClick={() => handlePull(book._id)}
                    disabled={pullList.includes(book._id)}
                  >
                    {pullList.includes(book._id) ? 'Pulled' : 'Pull'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <style>{` th, td { border: 1px solid #ddd; padding: 8px; text-align: left; } `}</style>
      </div>
    </CustomerLayout>
  );
}

export default ReleasesCustomerPage;
