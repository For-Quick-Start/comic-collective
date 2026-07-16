import React, { useState, useEffect } from 'react';
import api from '../api';
import CustomerLayout from '../components/CustomerLayout';
import globalStyles from '../styles/global.module.css';
import buttonsStyles from '../styles/buttons.module.css';
import bookCardsStyles from '../styles/bookCards.module.css';

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
        const booksRes = await api.get('/api/books', config);
        setBooks(booksRes.data);

        // Fetch user's current pull list
        const userRes = await api.get('/api/users/me', config);
        setPullList(userRes.data.pullList.map(item => item.bookId));
      } catch (err) {
        setError(err.response?.data?.message || 'Could not fetch data');
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const handlePull = async (bookId) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      await api.post('/api/users/me/pull-list', { bookId }, config);
      
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
      <div className={bookCardsStyles.cardContainer}>
        {message && <p className={globalStyles.success}>{message}</p>}
        {error && <p className={globalStyles.error}>{error}</p>}
        {books.map((book) => (
          <div key={book._id} className={bookCardsStyles.bookCard}>
            <div className={bookCardsStyles.bookCardTitle}>
              <h2>{book.seriesTitle} #{book.issueNumber}</h2>
            </div>
            <div className={bookCardsStyles.bookCardContent}>
              <div className={bookCardsStyles.coverArtSection}>
                <img src={book.coverArt || '/images/cover-placeholder.png'} alt={`${book.seriesTitle} #${book.issueNumber}`} className={bookCardsStyles.coverArt} />
              </div>
              <div className={bookCardsStyles.detailsSection}>
                <p><strong>Publisher:</strong> {book.publisher || 'N/A'}</p>
                <p><strong>Release Date:</strong> {formatDate(book.releaseDate)}</p>
                <p><strong>Series Start Date:</strong> {formatDate(book.seriesStartDate)}</p>
                <p><strong>Series End Date:</strong> {formatDate(book.seriesEndDate)}</p>
                <div className={bookCardsStyles.tagsDisplay}>
                  {book.tags && book.tags.length > 0 ? book.tags.map(tag => (<span key={tag} className={bookCardsStyles.tag}>{tag}</span>)) : <p>No tags</p>}
                </div>
                <div>
                  <button className={buttonsStyles.editButton}
                    onClick={() => handlePull(book._id)}
                    disabled={pullList.includes(book._id)}
                  >
                    {pullList.includes(book._id) ? 'Pulled' : 'Pull'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </CustomerLayout>
  );
}

export default ReleasesCustomerPage;
