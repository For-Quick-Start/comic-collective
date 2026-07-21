import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import EmployeeLayout from '../components/EmployeeLayout';
import global from '../styles/global.module.css';
import statCards from '../styles/statCards.module.css';

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
          api.get('/api/users/pull-list/all', config), // Corrected to fetch all pulls
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
          const releaseDate = item.bookId ? new Date(item.bookId.releaseDate) : null;
          return releaseDate < today && !item.purchased;
        }).length;

        const upcomingPulls = pullList.filter(item => {
          const releaseDate = item.bookId ? new Date(item.bookId.releaseDate) : null;
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
    return <EmployeeLayout title="Dashboard"><div>Loading...</div></EmployeeLayout>;
  }

  return (
    <EmployeeLayout title="Dashboard">
      {error && <p className={global.error}>{error}</p>}
      <div className={statCards.statsGrid}>
        <Link to="/inventory" className={statCards.statCard}><h2>{stats.releasesThisWeek}</h2><p>Releases This Week</p></Link> 
        <Link to="/inventory" className={statCards.statCard}><h2>{stats.releasesNextWeek}</h2><p>Releases Next Week</p></Link>
        <Link to="/pullsempl" className={statCards.statCard}><h2>{stats.outstandingPulls}</h2><p>All Outstanding Pulls</p></Link>
        <Link to="/pullsempl" className={statCards.statCard}><h2>{stats.upcomingPulls}</h2><p>All Upcoming Pulls</p></Link>
      </div>
    </EmployeeLayout>
  );
}

export default DashboardPage;
