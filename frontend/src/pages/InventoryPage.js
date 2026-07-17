import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import EmployeeLayout from '../components/EmployeeLayout';
import globalStyles from '../styles/global.module.css';
import buttonsStyles from '../styles/buttons.module.css';
import bookCardsStyles from '../styles/bookCards.module.css';

function InventoryPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
        const { data } = await api.get('/api/books', config);
        setBooks(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch books');
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return <EmployeeLayout title="Inventory"><div>Loading...</div></EmployeeLayout>;
  }

  if (error) {
    return <EmployeeLayout title="Inventory"><p className={globalStyles.error}>{error}</p></EmployeeLayout>;
  }

  return (
    <EmployeeLayout title="Book Inventory">
      <a href="/insertbook">
        <button className={buttonsStyles.submitButton}>Add a New Book</button>
      </a>
      <div className={bookCardsStyles.cardContainer}>
        {books.map((book) => {
          const onHand = book.inventory || 0;
          const pulls = book.totalPulls || 0;
          const netInventory = onHand - pulls;
          const isLowInventory = netInventory < 5;

          return (
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
                  <div className={bookCardsStyles.inventorySection}>
                    <p><strong>On Hand:</strong> {onHand}</p>
                    <p><strong>Total Pulls:</strong> {pulls}</p>
                    {isLowInventory && <p className={bookCardsStyles.lowInventoryWarning}>Low Inventory!</p>}
                  </div>
                  <div className={bookCardsStyles.tagsDisplay}>
                    {book.tags && book.tags.length > 0 ? book.tags.map(tag => (<span key={tag} className={bookCardsStyles.tag}>{tag}</span>)) : <p>No tags</p>}
                  </div>
                  <Link to={`/editbook/${book._id}`} className={buttonsStyles.editButton} style={{marginTop: 'auto'}}>Edit</Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </EmployeeLayout>
  );
}

export default InventoryPage;
