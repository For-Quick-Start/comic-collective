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
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!userInfo || !userInfo.token) {
          setError('You must be logged in to view this page.');
          setLoading(false);
          return;
        }
        setUserName(userInfo.name);

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
        // GET COUNTS OF ALL INVENTORY, TOTAL UNPURCHASED PULLS AND TOTAL PULLS 
        const releasesAll = books.length;
        const pullsAllTotal = pullList.length;
        const pullsAllNotPurchased = pullList.filter(item => !item.purchased).length;
        // CALCULATE THE WEEK-BASED BREAKDOWN OF RELEASES AND PULLS
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // const sevenDaysAgo = new Date(today);
        // sevenDaysAgo.setDate(today.getDate() - 7);

        // const sevenDaysFromNow = new Date(today);
        // sevenDaysFromNow.setDate(today.getDate() + 7);

        // // Calculate stats
        // const releasesThisWeek = books.filter(book => {
        //   const releaseDate = new Date(book.releaseDate);
        //   return releaseDate >= sevenDaysAgo && releaseDate <= today;
        // }).length;

        // const releasesNextWeek = books.filter(book => {
        //   const releaseDate = new Date(book.releaseDate);
        //   return releaseDate > today && releaseDate <= sevenDaysFromNow;
        // }).length;

        // const outstandingPulls = pullList.filter(item => {
        //   const releaseDate = new Date(item.bookId.releaseDate);
        //   return releaseDate < today && !item.purchased;
        // }).length;

        // const upcomingPulls = pullList.filter(item => {
        //   const releaseDate = new Date(item.bookId.releaseDate);
        //   return releaseDate >= today;
        // }).length;

        // GET COUNT OF BOOKS RELEASED CURRENT WEEK
        const mondayOfCurrentWeek = new Date(today);
        mondayOfCurrentWeek.setHours(0, 0, 0, 0);
        mondayOfCurrentWeek.setDate(today.getDate() - (today.getDay() + 6) % 7);
        const sundayOfCurrentWeek = new Date(mondayOfCurrentWeek);
        sundayOfCurrentWeek.setDate(mondayOfCurrentWeek.getDate() + 6);
        const releasesOfCurrentWeek = books.filter(book => {
          const releaseDate = new Date(book.releaseDate);
          return releaseDate >= mondayOfCurrentWeek && releaseDate <= sundayOfCurrentWeek;
        }).length;
        const pullsOfCurrentWeekTotal = pullList.filter(item => {
          const releaseDate = item.bookId ? new Date(item.bookId.releaseDate) : null;
          return releaseDate >= mondayOfCurrentWeek && releaseDate <= sundayOfCurrentWeek;
        }).length;
        const pullsOfCurrentWeekNotPurchased = pullList.filter(item => {
          const releaseDate = item.bookId ? new Date(item.bookId.releaseDate) : null;
          return releaseDate >= mondayOfCurrentWeek && releaseDate <= sundayOfCurrentWeek && !item.purchased;
        }).length;
        // GET COUNT OF BOOKS RELEASED TWO WEEKS AGO
        const mondayTwoWeeksBack = new Date(today);
        mondayTwoWeeksBack.setHours(0, 0, 0, 0);
        mondayTwoWeeksBack.setDate(mondayOfCurrentWeek.getDate() - 14);
        const sundayTwoWeeksBack = new Date(mondayTwoWeeksBack);
        sundayTwoWeeksBack.setDate(mondayTwoWeeksBack.getDate() + 6);
        const releasesTwoWeeksBack = books.filter(book => {
          const releaseDate = new Date(book.releaseDate);
          return releaseDate >= mondayTwoWeeksBack && releaseDate <= sundayTwoWeeksBack;
        }).length;
        const pullsTwoWeeksBackTotal = pullList.filter(item => {
          const releaseDate = item.bookId ? new Date(item.bookId.releaseDate) : null;
          return releaseDate >= mondayTwoWeeksBack && releaseDate <= sundayTwoWeeksBack;
        }).length;
        const pullsTwoWeeksBackNotPurchased = pullList.filter(item => {
          const releaseDate = item.bookId ? new Date(item.bookId.releaseDate) : null;
          return releaseDate >= mondayTwoWeeksBack && releaseDate <= sundayTwoWeeksBack && !item.purchased;
        }).length;
        // GET COUNT OF BOOKS RELEASED LAST WEEK
        const mondayOfLastWeek = new Date(today);
        mondayOfLastWeek.setHours(0, 0, 0, 0);
        mondayOfLastWeek.setDate(mondayOfCurrentWeek.getDate() - 7);
        const sundayOfLastWeek = new Date(mondayOfLastWeek);
        sundayOfLastWeek.setDate(mondayOfLastWeek.getDate() + 6);
        const releasesOfLastWeek = books.filter(book => {
          const releaseDate = new Date(book.releaseDate);
          return releaseDate >= mondayOfLastWeek && releaseDate <= sundayOfLastWeek;
        }).length;
        const pullsOfLastWeekTotal = pullList.filter(item => {
          const releaseDate = item.bookId ? new Date(item.bookId.releaseDate) : null;
          return releaseDate >= mondayOfLastWeek && releaseDate <= sundayOfLastWeek;
        }).length;
        const pullsOfLastWeekNotPurchased = pullList.filter(item => {
          const releaseDate = item.bookId ? new Date(item.bookId.releaseDate) : null;
          return releaseDate >= mondayOfLastWeek && releaseDate <= sundayOfLastWeek && !item.purchased;
        }).length;
        // GET COUNT OF BOOKS SCHEDULED FOR RELEASE NEXT WEEK
        const mondayOfNextWeek = new Date(today);
        mondayOfNextWeek.setHours(0, 0, 0, 0);
        mondayOfNextWeek.setDate(mondayOfCurrentWeek.getDate() + 7);
        const sundayOfNextWeek = new Date(mondayOfNextWeek);
        sundayOfNextWeek.setDate(mondayOfNextWeek.getDate() + 6);
        const releasesOfNextWeek = books.filter(book => {
          const releaseDate = new Date(book.releaseDate);
          return releaseDate >= mondayOfNextWeek && releaseDate <= sundayOfNextWeek;
        }).length;
        const pullsOfNextWeekTotal = pullList.filter(item => {
          const releaseDate = item.bookId ? new Date(item.bookId.releaseDate) : null;
          return releaseDate >= mondayOfNextWeek && releaseDate <= sundayOfNextWeek;
        }).length;
        const pullsOfNextWeekNotPurchased = pullList.filter(item => {
          const releaseDate = item.bookId ? new Date(item.bookId.releaseDate) : null;
          return releaseDate >= mondayOfNextWeek && releaseDate <= sundayOfNextWeek && !item.purchased;
        }).length;
        // GET COUNT OF BOOKS SCHEDULED FOR RELEASE IN TWO WEEKS
        const mondayTwoWeeksOut = new Date(today);
        mondayTwoWeeksOut.setHours(0, 0, 0, 0);
        mondayTwoWeeksOut.setDate(mondayOfCurrentWeek.getDate() + 14);
        const sundayTwoWeeksOut = new Date(mondayTwoWeeksOut);
        sundayTwoWeeksOut.setDate(mondayTwoWeeksOut.getDate() + 6);
        const releasesTwoWeeksOut = books.filter(book => {
          const releaseDate = new Date(book.releaseDate);
          return releaseDate >= mondayTwoWeeksOut && releaseDate <= sundayTwoWeeksOut;
        }).length;
        const pullsTwoWeeksOutTotal = pullList.filter(item => {
          const releaseDate = item.bookId ? new Date(item.bookId.releaseDate) : null;
          return releaseDate >= mondayTwoWeeksOut && releaseDate <= sundayTwoWeeksOut;
        }).length;
        const pullsTwoWeeksOutNotPurchased = pullList.filter(item => {
          const releaseDate = item.bookId ? new Date(item.bookId.releaseDate) : null;
          return releaseDate >= mondayTwoWeeksOut && releaseDate <= sundayTwoWeeksOut && !item.purchased;
        }).length;

        setStats({
          releasesAll,
          pullsAllTotal,
          pullsAllNotPurchased,
          releasesTwoWeeksBack,
          pullsTwoWeeksBackTotal,
          pullsTwoWeeksBackNotPurchased,
          releasesOfLastWeek,
          pullsOfLastWeekTotal,
          pullsOfLastWeekNotPurchased,
          releasesOfCurrentWeek,
          pullsOfCurrentWeekTotal,
          pullsOfCurrentWeekNotPurchased,
          releasesOfNextWeek,
          pullsOfNextWeekTotal,
          pullsOfNextWeekNotPurchased,
          releasesTwoWeeksOut,
          pullsTwoWeeksOutTotal,
          pullsTwoWeeksOutNotPurchased,
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

  const dashboardTitle = userName ? `${userName.split(' ')[0]}'s Dashboard` : 'Dashboard';

  return (
    <CustomerLayout title={dashboardTitle}>
      {error && <p className={global.error}>{error}</p>}
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
      <div className={statCards.statsGrid}>
        <Link to="/inventory" className={statCards.statCard}><h2>{stats.releasesAll}</h2><p><strong>All Releases</strong><br />&nbsp;<br /><strong>Total Count of Releases</strong></p></Link>
        <Link to="/pullsempl" className={statCards.statCard}><h2>{stats.pullsAllNotPurchased}/{stats.pullsAllTotal}</h2><p><strong>All Pulls Pending Purchase</strong><br />/<br /><strong>All Pulls</strong></p></Link>
        <Link to="/inventory" className={statCards.statCard}><h2>{stats.releasesTwoWeeksBack}</h2><p>Releases Two Weeks Ago</p></Link>
        <Link to="/pullsempl" className={statCards.statCard}><h2>{stats.pullsTwoWeeksBackNotPurchased}/{stats.pullsTwoWeeksBackTotal}</h2><p>Pulls Two Weeks Ago</p></Link>
        <Link to="/inventory" className={statCards.statCard}><h2>{stats.releasesOfLastWeek}</h2><p>Releases Last Week</p></Link>
        <Link to="/pullsempl" className={statCards.statCard}><h2>{stats.pullsOfLastWeekNotPurchased}/{stats.pullsOfLastWeekTotal}</h2><p>Pulls Last Week</p></Link>
        <Link to="/inventory" className={statCards.statCard}><h2>{stats.releasesOfCurrentWeek}</h2><p>Releases Current Week</p></Link>
        <Link to="/pullsempl" className={statCards.statCard}><h2>{stats.pullsOfCurrentWeekNotPurchased}/{stats.pullsOfCurrentWeekTotal}</h2><p>Pulls Current Week</p></Link>
        <Link to="/inventory" className={statCards.statCard}><h2>{stats.releasesOfNextWeek}</h2><p>Releases Next Week</p></Link>
        <Link to="/pullsempl" className={statCards.statCard}><h2>{stats.pullsOfNextWeekNotPurchased}/{stats.pullsOfNextWeekTotal}</h2><p>Pulls Next Week</p></Link>
        <Link to="/inventory" className={statCards.statCard}><h2>{stats.releasesTwoWeeksOut}</h2><p>Releases in Two Weeks</p></Link>
        <Link to="/pullsempl" className={statCards.statCard}><h2>{stats.pullsTwoWeeksOutNotPurchased}/{stats.pullsTwoWeeksOutTotal}</h2><p>Pulls in Two Weeks</p></Link>
      </div>
    </CustomerLayout>
  );
}

export default DashboardPage;
