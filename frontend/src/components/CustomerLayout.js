import React from 'react';
import { Link } from 'react-router-dom';
import layout2 from '../styles/layout2.module.css';
import buttonsStyles from '../styles/buttons.module.css';

function CustomerLayout({ children, title }) {
  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    window.location.href = '/login';
  };

  return (
    <div className={layout2.pageContainer}>
      <div className={layout2.leftPanel}>
        <img src="/logo.png" alt="Comic Collective Logo" className={layout2.logo} />
        <nav className={layout2.menuNav}>
          <Link to="/dashcust" className={layout2.menuItem}>Dashboard</Link>
          <Link to="/releasescust" className={layout2.menuItem}>Releases</Link>
          <Link to="/pullscust" className={layout2.menuItem}>Pull List</Link>
          <a href="#!" className={layout2.menuItem}>Recommendations</a>
        </nav>
        <div className={layout2.bottomNav}>
          <Link to="/settings" className={layout2.menuItem}>Settings</Link>
          <button onClick={handleLogout} className={buttonsStyles.logoutButton}>Log out</button>
        </div>
      </div>
      <div className={layout2.rightPanel}>
        {title && (
          <>
            <h1 className={layout2.pageHeader}>{title}</h1>
            <hr className={layout2.hr} />
          </>
        )}
        <div className={layout2.mainContent}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default CustomerLayout;