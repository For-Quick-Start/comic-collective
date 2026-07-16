import React, { useState, useEffect } from 'react';
import api from '../api';
import CustomerLayout from '../components/CustomerLayout';
import globalStyles from '../styles/global.module.css';
// import buttonsStyles from '../styles/buttons.module.css';
import bookCardsStyles from '../styles/bookCards.module.css';

const PullsCustomerPage = () => {
  const [pullList, setPullList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPullList = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };

        const { data } = await api.get('/api/users/pull-list', config);
        setPullList(data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to fetch pull list');
        setLoading(false);
      }
    };

    fetchPullList();
  }, []);

  if (loading) {
    return <div>Loading your pull list...</div>;
  }

  if (error) {
    return <div><p className={globalStyles.error}>Error: {error}</p></div>;
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <CustomerLayout title="Pull List">
      <div>
        {pullList.length === 0 ? (
          <p>Your pull list is empty.</p>
        ) : (
          <div className={bookCardsStyles.cardContainer}>
            {pullList.map((item) => (
              <div key={item._id}  className={bookCardsStyles.bookCard}>
                <div className={bookCardsStyles.bookCardTitle}>
                  <h2>{item.bookId.seriesTitle} #{item.bookId.issueNumber}</h2>
                </div>
                <div className={bookCardsStyles.bookCardContent}>
                  <div className={bookCardsStyles.coverArtSection}>
                    <img src={item.bookId.coverArt || '/images/cover-placeholder.png'} alt={`${item.bookId.seriesTitle} #${item.bookId.issueNumber}`} className={bookCardsStyles.coverArt} />
                  </div>
                  <div className={bookCardsStyles.detailsSection}>
                    <p><strong>Publisher:</strong> {item.bookId.publisher || 'N/A'}</p>
                    <p><strong>Release Date:</strong> {formatDate(item.bookId.releaseDate)}</p>
                  </div>
                </div>
                {item.purchased ? <p className={globalStyles.success}>Already picked up!</p> : <p className={globalStyles.error}>Pulled and waiting for pick up!</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </CustomerLayout>
  );
};

export default PullsCustomerPage;

