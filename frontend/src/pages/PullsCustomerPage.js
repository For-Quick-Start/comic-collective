import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CustomerLayout from '../components/CustomerLayout';

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

        const { data } = await axios.get('/api/users/pull-list', config);
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
    return <div>Error: {error}</div>;
  }

  return (
    <CustomerLayout title="Pull List">
      <div>
        {pullList.length === 0 ? (
          <p>Your pull list is empty.</p>
        ) : (
          <ul>
            {pullList.map((item) => (
              <li key={item._id}>
                <strong>{item.bookId.seriesTitle} #{item.bookId.issueNumber}</strong>
                <p>Purchased: {item.purchased ? 'Yes' : 'No'}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </CustomerLayout>
  );
};

export default PullsCustomerPage;

