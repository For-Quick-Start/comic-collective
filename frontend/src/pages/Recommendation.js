import React from 'react';
import CustomerLayout from '../components/CustomerLayout';
import styles from '../styles/recommendation.module.css';

function RecommendationPage() {
  return (
    <CustomerLayout title="Recommendations">
      <div className={styles.container}>
        <p>recommendations</p>
      </div>
    </CustomerLayout>
  );
}

export default RecommendationPage;