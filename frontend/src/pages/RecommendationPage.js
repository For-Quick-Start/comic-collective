import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerLayout from '../components/CustomerLayout';
import styles from '../styles/recommendation.module.css';

function RecommendationPage() {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

        const response = await fetch('/api/users/me/recommendation-tags', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            navigate('/login');
            return;
          } else {
            throw new Error('Failed to fetch recommendation tags');
          }
        }

        const data = await response.json();
        setTags(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendationTags();
  }, [navigate]);

  return (
    <CustomerLayout title="Recommendations">
      <div className={styles.container}>
        <h2>Tags from Your Pull List</h2>
        {loading && <p>Loading tags...</p>}
        {error && <p className={styles.error}>Error: {error}</p>}
        {!loading && !error && (
          tags.length > 0 ? (
            <ul className={styles.tagList}>
              {tags.map((tag, index) => (
                <li key={index} className={styles.tagItem}>{tag}</li>
              ))}
            </ul>
          ) : (
            <p>No tags found. Add some books to your pull list to get recommendations!</p>
          )
        )}
      </div>
    </CustomerLayout>
  );
}

export default RecommendationPage;
