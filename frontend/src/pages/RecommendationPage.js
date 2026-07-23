import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import CustomerLayout from '../components/CustomerLayout';
import global from '../styles/global.module.css';
import buttons from '../styles/buttons.module.css';
import bookCards from '../styles/bookCards.module.css';

function RecommendationPage() {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [error, setError] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [recommendationError, setRecommendationError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecommendationTags = async () => {
      try {
        const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
        if (!token) {
          // If no token, redirect to login page
          navigate('/login');
          return;
        }

        const config = {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        };

        const { data: responseData } = await api.get('/api/users/me/recommendation-tags', config);
        setTags(responseData);
      } catch (err) {
        if (err.response && err.response.status === 401) {
          navigate('/login');
        }
        setError(err.response?.data?.message || err.message || 'Failed to fetch recommendation tags');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendationTags();
  }, [navigate]);

  const handleGetRecommendations = async () => {
    setLoadingRecommendations(true);
    setRecommendationError(null);
    setRecommendations([]);
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await api.post('/api/recommendations', { tags }, config);
      setRecommendations(data);
    } catch (err) {
      setRecommendationError(err.response?.data?.message || 'Failed to get recommendations.');
    } finally {
      setLoadingRecommendations(false);
    }
  };

  return (
    <CustomerLayout title="Recommendations">
      <div className={bookCards.tagsSection}>
        <h2>Tags from Your Pull List</h2>
        {loading && <p>Loading tags...</p>}
        {error && <p className={global.error}>Error: {error}</p>}
        {!loading && !error && (
          tags.length > 0 ? (
            <>
              <div className={bookCards.tagsDisplay}>
                {tags.map((tag, index) => (
                  <span key={index} className={bookCards.tag}>{tag}</span>
                ))}
              </div>
              <button onClick={handleGetRecommendations} className={buttons.recommendationButton} disabled={loadingRecommendations}>
                {loadingRecommendations ? 'Getting Suggestions...' : 'Get AI Recommendations'}
              </button>
            </>
          ) : (
            <p>No tags found. Add some books to your pull list to get recommendations!</p>
          )
        )}
      </div>

      {loadingRecommendations && <div className={global.loadingSpinner}></div>}
      {recommendationError && <p className={global.error}>{recommendationError}</p>}

      {recommendations.length > 0 && (
        <div className={bookCards.cardContainer} style={{ marginTop: '2rem' }}>
          <h2 style={{ width: '80%', maxWidth: '600px', textAlign: 'center' }}>AI Recommendations</h2>
          {recommendations.map((rec, index) => (
            <div key={index} className={bookCards.bookCard}>
              <div className={bookCards.bookCardTitle}>
                <h2>{rec.seriesTitle}</h2>
              </div>
              <div className={bookCards.detailsSection}>
                <p><strong>Publisher:</strong> {rec.publisher}</p>
                <p><strong>Reason:</strong> {rec.reason}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </CustomerLayout>
  );
}

export default RecommendationPage;
