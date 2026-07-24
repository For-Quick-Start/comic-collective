import React, { useState, useEffect, useRef } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';
import EmployeeLayout from '../components/EmployeeLayout';
import global from '../styles/global.module.css';
import buttons from '../styles/buttons.module.css';
import bookCards from '../styles/bookCards.module.css';

const PullsEmployeePage = () => {
  const [pullList, setPullList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isOverlayActive, setIsOverlayActive] = useState(false);
  const overlayRef = useRef(null);
  const overlayImgRef = useRef(null);
  const activeThumbRef = useRef(null);

  const fetchPullList = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await api.get('/api/users/pull-list/all', config);
      setPullList(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch pull list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchPullList = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };

        const { data } = await api.get('/api/users/pull-list/all', config);
        setPullList(data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to fetch pull list');
        setLoading(false);
      }
    };

    fetchPullList();
  }, []); // Initial fetch

  useEffect(() => {
    const handleKeyDown = (e) => e.key === 'Escape' && closeOverlay();
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (loading) {
    return <EmployeeLayout title="All Customer Pulls"><div className={global.loadingSpinner}></div></EmployeeLayout>;
  }

  if (error) {
    return <EmployeeLayout title="All Customer Pulls"><p className={global.error}>Error: {error}</p></EmployeeLayout>;
  }

  const openOverlay = (e) => {
    const thumb = e.target;
    if (!thumb || !overlayRef.current || !overlayImgRef.current) return;

    activeThumbRef.current = thumb;
    // const overlay = overlayRef.current;
    const overlayImg = overlayImgRef.current;

    const rect = thumb.getBoundingClientRect();

    overlayImg.style.transition = 'none';
    overlayImg.style.position = 'fixed';
    overlayImg.style.height = rect.height + 'px';
    overlayImg.style.width = rect.width + 'px';
    overlayImg.style.top = rect.top + 'px';
    overlayImg.style.left = rect.left + 'px';
    overlayImg.style.margin = '0';
    overlayImg.style.borderRadius = '6px';

    setIsOverlayActive(true);

    const expandImage = () => {
      requestAnimationFrame(() => {
        overlayImg.style.transition = [
          'top 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          'left 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          'width 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          'height 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          'border-radius 0.4s ease'
        ].join(', ');

        const finalH = window.innerHeight * 0.75;
        const ratio = overlayImg.naturalWidth / overlayImg.naturalHeight;
        const finalW = finalH * ratio;

        overlayImg.style.height = finalH + 'px';
        overlayImg.style.width = finalW + 'px';
        overlayImg.style.top = ((window.innerHeight - finalH) / 2) + 'px';
        overlayImg.style.left = ((window.innerWidth - finalW) / 2) + 'px';
        overlayImg.style.borderRadius = '8px';
      });
    };

    overlayImg.onload = null;
    if (thumb.naturalWidth > 0) {
      overlayImg.src = thumb.src;
      expandImage();
    } else {
      overlayImg.onload = expandImage;
      overlayImg.src = thumb.src;
    }
    overlayImg.alt = thumb.alt;
  };

  const closeOverlay = () => {
    const activeThumb = activeThumbRef.current;
    if (!activeThumb || !overlayRef.current || !overlayImgRef.current) return;

    const overlayImg = overlayImgRef.current;
    const rect = activeThumb.getBoundingClientRect();

    overlayImg.style.transition = [
      'top 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      'left 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      'width 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      'height 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      'border-radius 0.35s ease'
    ].join(', ');

    overlayImg.style.height = rect.height + 'px';
    overlayImg.style.width = rect.width + 'px';
    overlayImg.style.top = rect.top + 'px';
    overlayImg.style.left = rect.left + 'px';
    overlayImg.style.borderRadius = '6px';

    setIsOverlayActive(false);

    const onTransitionEnd = () => {
      overlayImg.style.transition = 'none';
      overlayImg.style.position = '';
      overlayImg.style.height = '';
      overlayImg.style.width = '';
      overlayImg.style.top = '';
      overlayImg.style.left = '';
      overlayImg.style.margin = '';
      overlayImg.style.borderRadius = '';
      overlayImg.src = '';
      activeThumbRef.current = null;
    };

    overlayImg.addEventListener('transitionend', onTransitionEnd, { once: true });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const handlePurchase = async (pullId) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      await api.put(`/api/users/pull-list/${pullId}/purchase`, {}, config);
      setMessage('Item marked as purchased!');
      setTimeout(() => setMessage(''), 3000); // Clear message after 3 seconds
      fetchPullList(); // Re-fetch to update the list
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to mark as purchased');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleMarkAsPulled = async (pullId) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      await api.put(`/api/users/pull-list/${pullId}/pull`, {}, config);
      setMessage('Item marked as pulled!');
      setTimeout(() => setMessage(''), 3000);
      fetchPullList(); // Re-fetch to update the list
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to mark as pulled');
      setTimeout(() => setError(''), 3000);
    }
  };
  return (
    <EmployeeLayout title="All Customer Pulls">
      <div>
        {message && <p className={global.success}>{message}</p>}
        {error && <p className={global.error}>{error}</p>}
        {pullList.length === 0 ? (
          <p>No items in any pull lists.</p>
        ) : (
          <div className={bookCards.cardContainer}>
            {pullList
              .filter(item => item.bookId) // Filter out items with null bookId
              .map((item) => (
              <div key={item._id} className={bookCards.bookCard}>
                <div className={bookCards.bookCardTitle}>
                  <h2>{item.bookId.seriesTitle} #{item.bookId.issueNumber}</h2>
                </div>
                <div className={bookCards.bookCardContent}>
                  <div className={bookCards.coverArtSection}>
                    <img 
                      src={item.bookId.coverArt || '/covers/cover-placeholder.png'} 
                      alt={`${item.bookId.seriesTitle} #${item.bookId.issueNumber}`} 
                      className={bookCards.coverArt}
                      onClick={openOverlay} 
                    />
                  </div>
                  <div className={bookCards.detailsSection}>
                    <p><strong>Customer:</strong> <Link to={`/custedit/${item.userId}`}>{item.userName}</Link></p>
                    <p><strong>Publisher:</strong> {item.bookId.publisher || 'N/A'}</p>
                    <p><strong>Release Date:</strong> {formatDate(item.bookId.releaseDate)}
                      {item.requested && !item.pulled && !item.purchased && <span style={{ color: 'orange', marginLeft: '1rem' }}>Pull requested</span>}
                      {item.pulled && !item.purchased && <span style={{ color: 'green', marginLeft: '1rem' }}>Pulled</span>}
                    </p>
                  </div>
                </div>
                {item.purchased ? <p className={global.success}>Already picked up!</p> : <p className={global.error}>Pulled and waiting for pick up!</p>}
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  {!item.purchased && (
                    <>
                      {!item.pulled && (
                        <button className={buttons.editButton} onClick={() => handleMarkAsPulled(item._id)}>
                          Mark as Pulled
                        </button>
                      )}
                      {item.pulled && (
                        <button className={buttons.editButton} disabled>Pulled</button>
                      )}
                    </>
                  )}
                  {!item.purchased && (
                    <button className={buttons.submitButton} onClick={() => handlePurchase(item._id)}>
                      Mark as Purchased
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div ref={overlayRef} className={`${bookCards.overlay} ${isOverlayActive ? bookCards.active : ''}`} onClick={(e) => e.target === overlayRef.current && closeOverlay()}>
        <button className={bookCards.overlayClose} onClick={closeOverlay} aria-label="Close">&times;</button>
        <img ref={overlayImgRef} className={bookCards.overlayImg} src="" alt="" />
      </div>
    </EmployeeLayout>
  );
};

export default PullsEmployeePage;
