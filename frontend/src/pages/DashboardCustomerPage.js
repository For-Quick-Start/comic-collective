import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import CustomerLayout from '../components/CustomerLayout';
import global from '../styles/global.module.css';
import statCards from '../styles/statCards.module.css';
import conciergeCards from '../styles/concierge.module.css';

function DashboardPage() {
  const [stats, setStats] = useState({
    releasesThisWeek: 0,
    releasesNextWeek: 0,
    outstandingPulls: 0,
    upcomingPulls: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!userInfo || !userInfo.token) {
          setError('You must be logged in to view this page.');
          setLoading(false);
          return;
        }

        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };

        // Fetch books and user's pull list in parallel
        const [booksRes, pullListRes] = await Promise.all([
          api.get('/api/books', config),
          api.get('/api/users/pull-list', config),
        ]);

        const books = booksRes.data;
        const pullList = pullListRes.data;

        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize to start of day

        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);

        const sevenDaysFromNow = new Date(today);
        sevenDaysFromNow.setDate(today.getDate() + 7);

        // Calculate stats
        const releasesThisWeek = books.filter(book => {
          const releaseDate = new Date(book.releaseDate);
          return releaseDate >= sevenDaysAgo && releaseDate <= today;
        }).length;

        const releasesNextWeek = books.filter(book => {
          const releaseDate = new Date(book.releaseDate);
          return releaseDate > today && releaseDate <= sevenDaysFromNow;
        }).length;

        const outstandingPulls = pullList.filter(item => {
          const releaseDate = new Date(item.bookId.releaseDate);
          return releaseDate < today && !item.purchased;
        }).length;

        const upcomingPulls = pullList.filter(item => {
          const releaseDate = new Date(item.bookId.releaseDate);
          return releaseDate >= today;
        }).length;

        setStats({
          releasesThisWeek,
          releasesNextWeek,
          outstandingPulls,
          upcomingPulls,
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <CustomerLayout title="Dashboard"><div className={global.loadingSpinner}></div></CustomerLayout>;
  }

  return (
    <CustomerLayout title="Dashboard">
      {error && <p className={global.error}>{error}</p>}
      <div className={statCards.statsGrid}>
        <Link to="/releasescust" className={statCards.statCard}><h2>{stats.releasesThisWeek}</h2><p>Releases This Week</p></Link>
        <Link to="/releasescust" className={statCards.statCard}><h2>{stats.releasesNextWeek}</h2><p>Releases Next Week</p></Link>
        <Link to="/pullscust" className={statCards.statCard}><h2>{stats.outstandingPulls}</h2><p>Your Outstanding Pulls</p></Link>
        <Link to="/pullscust" className={statCards.statCard}><h2>{stats.upcomingPulls}</h2><p>Your Upcoming Pulls</p></Link>
      </div>
      <div className={conciergeCards.conciergeGrid}>
        <div className={conciergeCards.conciergeCard}>
          <h3>Store Information</h3>
          <div className={conciergeCards.infoContainer}>
            <div className={conciergeCards.addressSection}>
              <p><strong>Comic Collective</strong></p>
              <p>123 Comic Book Lane</p>
              <p>Metropolis, USA 12345</p>
              <a href="https://www.openstreetmap.org/search?query=123%20Comic%20Book%20Lane%2C%20Metropolis" target="_blank" rel="noopener noreferrer" className={conciergeCards.addressLink}>View on Map</a>
              <p>Phone: (800) 555-1212</p>
            </div>
            <ul className={conciergeCards.hoursList}>
              <li><span>Monday</span> <span>10:00 AM - 7:00 PM</span></li>
              <li><span>Tuesday</span> <span>10:00 AM - 7:00 PM</span></li>
              <li><span>Wednesday</span> <span>10:00 AM - 8:00 PM</span></li>
              <li><span>Thursday</span> <span>10:00 AM - 7:00 PM</span></li>
              <li><span>Friday</span> <span>10:00 AM - 9:00 PM</span></li>
              <li><span>Saturday</span> <span>10:00 AM - 9:00 PM</span></li>
              <li><span>Sunday</span> <span>12:00 PM - 5:00 PM</span></li>
            </ul>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}

export default DashboardPage;
