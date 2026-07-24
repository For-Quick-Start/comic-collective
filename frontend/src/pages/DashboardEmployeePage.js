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
    releasesTwoWeeksBack: 0,
    pullsTwoWeeksBackTotal: 0,
    pullsTwoWeeksBackPurchased: 0,
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
          api.get('/api/users/pull-list/all', config), // Corrected to fetch all pulls
        ]);

        const books = booksRes.data;
        const pullList = pullListRes.data;

        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize to start of day

        const daysSinceLastMonday = (today.getDay() + 6) % 7;

        // CURRENT WEEK DAYS
        const mondayOfCurrentWeek = new Date(today);
        mondayOfCurrentWeek.setDate(today.getDate() - daysSinceLastMonday);
        mondayOfCurrentWeek.setHours(0, 0, 0, 0);
        const wednesdayOfCurrentWeek = new Date(today);
        wednesdayOfCurrentWeek.setDate(mondayOfCurrentWeek.getDate() + 2);
        wednesdayOfCurrentWeek.setHours(0, 0, 0, 0);
        const sundayOfCurrentWeek = new Date(today);
        sundayOfCurrentWeek.setDate(mondayOfCurrentWeek.getDate() + 6);
        sundayOfCurrentWeek.setHours(0, 0, 0, 0);

        // LAST WEEK DAYS
        const mondayOfLastWeek = new Date(today);
        mondayOfLastWeek.setDate(mondayOfCurrentWeek.getDate() - 7);
        mondayOfLastWeek.setHours(0, 0, 0, 0);
        const wednesdayOfLastWeek = new Date(today);
        wednesdayOfLastWeek.setDate(mondayOfLastWeek.getDate() + 2);
        wednesdayOfLastWeek.setHours(0, 0, 0, 0);
        const sundayOfLastWeek = new Date(today);
        sundayOfLastWeek.setDate(mondayOfLastWeek.getDate() + 6);
        sundayOfLastWeek.setHours(0, 0, 0, 0);

        // NEXT WEEK DAYS
        const mondayOfNextWeek = new Date(today);
        mondayOfNextWeek.setDate(mondayOfCurrentWeek.getDate() + 7);
        mondayOfNextWeek.setHours(0, 0, 0, 0);
        const wednesdayOfNextWeek = new Date(today);
        wednesdayOfNextWeek.setDate(mondayOfNextWeek.getDate() + 2);
        wednesdayOfNextWeek.setHours(0, 0, 0, 0);
        const sundayOfNextWeek = new Date(today);
        sundayOfNextWeek.setDate(mondayOfNextWeek.getDate() + 6);
        sundayOfNextWeek.setHours(0, 0, 0, 0);

        // TWO WEEKS AGO DAYS
        const mondayTwoWeeksBack = new Date(today);
        mondayTwoWeeksBack.setDate(mondayOfCurrentWeek.getDate() - 14);
        mondayTwoWeeksBack.setHours(0, 0, 0, 0);
        const wednesdayTwoWeeksBack = new Date(today);
        wednesdayTwoWeeksBack.setDate(mondayTwoWeeksBack.getDate() + 2);
        wednesdayTwoWeeksBack.setHours(0, 0, 0, 0);
        const sundayTwoWeeksBack = new Date(today);
        sundayTwoWeeksBack.setDate(mondayTwoWeeksBack.getDate() + 6);
        sundayTwoWeeksBack.setHours(0, 0, 0, 0);

        // TWO WEEKS OUT DAYS
        const mondayTwoWeeksOut = new Date(today);
        mondayTwoWeeksOut.setDate(mondayOfCurrentWeek.getDate() + 14);
        mondayTwoWeeksOut.setHours(0, 0, 0, 0);
        const wednesdayTwoWeeksOut = new Date(today);
        wednesdayTwoWeeksOut.setDate(mondayTwoWeeksOut.getDate() + 2);
        wednesdayTwoWeeksOut.setHours(0, 0, 0, 0);
        const sundayTwoWeeksOut = new Date(today);
        sundayTwoWeeksOut.setDate(mondayTwoWeeksOut.getDate() + 6);
        sundayTwoWeeksOut.setHours(0, 0, 0, 0);

        // GET COUNT OF BOOKS RELEASED TWO WEEKS AGO
        const releasesTwoWeeksBack = books.filter(book => {
          const releaseDate = new Date(book.releaseDate);
          return releaseDate >= mondayTwoWeeksBack && releaseDate <= sundayTwoWeeksBack;
        }).length;
        const pullsTwoWeeksBackTotal = pullList.filter(item => {
          const releaseDate = item.bookId ? new Date(item.bookId.releaseDate) : null;
          return releaseDate >= mondayTwoWeeksBack && releaseDate <= sundayTwoWeeksBack;
        }).length;
        const pullsTwoWeeksBackPurchased = pullList.filter(item => {
          const releaseDate = item.bookId ? new Date(item.bookId.releaseDate) : null;
          return releaseDate >= mondayTwoWeeksBack && releaseDate <= sundayTwoWeeksBack && !item.purchased;
        }).length;

        // GET COUNT OF BOOKS RELEASED LAST WEEK
        const releasesOfLastWeek = books.filter(book => {
          const releaseDate = new Date(book.releaseDate);
          return releaseDate >= mondayOfLastWeek && releaseDate <= sundayOfLastWeek;
        }).length;
        const pullsOfLastWeekTotal = pullList.filter(item => {
          const releaseDate = item.bookId ? new Date(item.bookId.releaseDate) : null;
          return releaseDate >= mondayOfLastWeek && releaseDate <= sundayOfLastWeek;
        }).length;
        const pullsOfLastWeekPurchased = pullList.filter(item => {
          const releaseDate = item.bookId ? new Date(item.bookId.releaseDate) : null;
          return releaseDate >= mondayOfLastWeek && releaseDate <= sundayOfLastWeek && !item.purchased;
        }).length;

        // GET COUNT OF BOOKS RELEASED CURRENT WEEK
        const releasesOfCurrentWeek = books.filter(book => {
          const releaseDate = new Date(book.releaseDate);
          return releaseDate >= mondayOfCurrentWeek && releaseDate <= sundayOfCurrentWeek;
        }).length;
        const pullsOfCurrentWeekTotal = pullList.filter(item => {
          const releaseDate = item.bookId ? new Date(item.bookId.releaseDate) : null;
          return releaseDate >= mondayOfCurrentWeek && releaseDate <= sundayOfCurrentWeek;
        }).length;
        const pullsOfCurrentWeekPurchased = pullList.filter(item => {
          const releaseDate = item.bookId ? new Date(item.bookId.releaseDate) : null;
          return releaseDate >= mondayOfCurrentWeek && releaseDate <= sundayOfCurrentWeek && !item.purchased;
        }).length;

        // GET COUNT OF BOOKS SCHEDULED FOR RELEASE NEXT WEEK
        const releasesOfNextWeek = books.filter(book => {
          const releaseDate = new Date(book.releaseDate);
          return releaseDate >= mondayOfNextWeek && releaseDate <= sundayOfNextWeek;
        }).length;
        const pullsOfNextWeekTotal = pullList.filter(item => {
          const releaseDate = item.bookId ? new Date(item.bookId.releaseDate) : null;
          return releaseDate >= mondayOfNextWeek && releaseDate <= sundayOfNextWeek;
        }).length;
        const pullsOfNextWeekPurchased = pullList.filter(item => {
          const releaseDate = item.bookId ? new Date(item.bookId.releaseDate) : null;
          return releaseDate >= mondayOfNextWeek && releaseDate <= sundayOfNextWeek && !item.purchased;
        }).length;

        // GET COUNT OF BOOKS SCHEDULED FOR RELEASE IN TWO WEEKS
        const releasesTwoWeeksOut = books.filter(book => {
          const releaseDate = new Date(book.releaseDate);
          return releaseDate >= mondayTwoWeeksOut && releaseDate <= sundayTwoWeeksOut;
        }).length;
        const pullsTwoWeeksOutTotal = pullList.filter(item => {
          const releaseDate = item.bookId ? new Date(item.bookId.releaseDate) : null;
          return releaseDate >= mondayTwoWeeksOut && releaseDate <= sundayTwoWeeksOut;
        }).length;
        const pullsTwoWeeksOutPurchased = pullList.filter(item => {
          const releaseDate = item.bookId ? new Date(item.bookId.releaseDate) : null;
          return releaseDate >= mondayTwoWeeksOut && releaseDate <= sundayTwoWeeksOut && !item.purchased;
        }).length;







        // OLD CARDS
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
          releasesTwoWeeksBack,
          pullsTwoWeeksBackTotal,
          pullsTwoWeeksBackPurchased,
          releasesOfLastWeek,
          pullsOfLastWeekTotal,
          pullsOfLastWeekPurchased,
          releasesOfCurrentWeek,
          pullsOfCurrentWeekTotal,
          pullsOfCurrentWeekPurchased,
          releasesOfNextWeek,
          pullsOfNextWeekTotal,
          pullsOfNextWeekPurchased,
          releasesTwoWeeksOut,
          pullsTwoWeeksOutTotal,
          pullsTwoWeeksOutPurchased,
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
    return <EmployeeLayout title="Dashboard"><div className={global.loadingSpinner}></div></EmployeeLayout>;
  }

  const dashboardTitle = userName ? `${userName.split(' ')[0]}'s Dashboard` : 'Dashboard';

  return (
    <EmployeeLayout title={dashboardTitle}>
      {error && <p className={global.error}>{error}</p>}
      <div className={statCards.statsGrid}>
        <Link to="/inventory" className={statCards.statCard}><h2>{stats.releasesTwoWeeksBack}</h2><p>Releases Two Weeks Ago</p></Link>
        <Link to="/pullsempl" className={statCards.statCard}><h2>{stats.pullsTwoWeeksBackPurchased}/{stats.pullsTwoWeeksBackTotal}</h2><p>Pulls Two Weeks Ago</p></Link>
        <Link to="/inventory" className={statCards.statCard}><h2>{stats.releasesOfLastWeek}</h2><p>Releases Last Week</p></Link>
        <Link to="/pullsempl" className={statCards.statCard}><h2>{stats.pullsOfLastWeekPurchased}/{stats.pullsOfLastWeekTotal}</h2><p>Pulls Last Week</p></Link>
        <Link to="/inventory" className={statCards.statCard}><h2>{stats.releasesOfCurrentWeek}</h2><p>Releases Current Week</p></Link>
        <Link to="/pullsempl" className={statCards.statCard}><h2>{stats.pullsOfCurrentWeekPurchased}/{stats.pullsOfCurrentWeekTotal}</h2><p>Pulls Current Week</p></Link>
        <Link to="/inventory" className={statCards.statCard}><h2>{stats.releasesOfNextWeek}</h2><p>Releases Next Week</p></Link>
        <Link to="/pullsempl" className={statCards.statCard}><h2>{stats.pullsOfNextWeekPurchased}/{stats.pullsOfNextWeekTotal}</h2><p>Pulls Next Week</p></Link>
        <Link to="/inventory" className={statCards.statCard}><h2>{stats.releasesTwoWeeksOut}</h2><p>Releases in Two Weeks</p></Link>
        <Link to="/pullsempl" className={statCards.statCard}><h2>{stats.pullsTwoWeeksOutPurchased}/{stats.pullsTwoWeeksOutTotal}</h2><p>Pulls in Two Weeks</p></Link>
        <Link to="/inventory" className={statCards.statCard}><h2>{stats.releasesThisWeek}</h2><p>Releases This Week</p></Link>
        <Link to="/inventory" className={statCards.statCard}><h2>{stats.releasesNextWeek}</h2><p>Releases Next Week</p></Link>
        <Link to="/inventory" className={statCards.statCard}><h2>{stats.outstandingPulls}</h2><p>All Outstanding Pulls</p></Link>
        <Link to="/inventory" className={statCards.statCard}><h2>{stats.upcomingPulls}</h2><p>All Upcoming Pulls</p></Link>
      </div>
    </EmployeeLayout>
  );
}

export default DashboardPage;
