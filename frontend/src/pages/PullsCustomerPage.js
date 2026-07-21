import React, { useState, useEffect, useRef } from 'react';
import api from '../api';
import CustomerLayout from '../components/CustomerLayout';
import global from '../styles/global.module.css';
import buttons from '../styles/buttons.module.css';
import bookCards from '../styles/bookCards.module.css';

const PullsCustomerPage = () => {
  const [pullList, setPullList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isOverlayActive, setIsOverlayActive] = useState(false);
  const overlayRef = useRef(null);
  const overlayImgRef = useRef(null);
  const activeThumbRef = useRef(null);

  useEffect(() => {
    const fetchPullList = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };

        const { data } = await api.get('/api/users/pull-list', config);
        setPullList(data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to fetch pull list');
        setLoading(false);
      }
    };

    fetchPullList();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => e.key === 'Escape' && closeOverlay();
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (loading) {
    return <div>Loading your pull list...</div>;
  }

  if (error) {
    return <div><p className={global.error}>Error: {error}</p></div>;
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

  const handleDrop = async (bookId) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      await api.post('/api/users/me/pull-drop', { bookId }, config);
      
      // Remove book from local pull list state to update UI instantly
      setPullList(pullList.filter(item => item.bookId._id !== bookId));
      setMessage('Book dropped from your pull list!');
      setTimeout(() => setMessage(''), 3000); // Clear message after 3 seconds

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to drop from pull list');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <CustomerLayout title="Pull List">
      <div>
        {message && <p className={global.success}>{message}</p>}
        {error && <p className={global.error}>{error}</p>}
        {pullList.length === 0 ? (
          <p>Your pull list is empty.</p>
        ) : (
          <div className={bookCards.cardContainer}>
            {pullList.map((item) => (
              <div key={item._id}  className={bookCards.bookCard}>
                <div className={bookCards.bookCardTitle}>
                  <h2>{item.bookId.seriesTitle} #{item.bookId.issueNumber}</h2>
                </div>
                <div className={bookCards.bookCardContent}>
                  <div className={bookCards.coverArtSection}>
                    <img src={item.bookId.coverArt || '/covers/cover-placeholder.png'} 
                      alt={`${item.bookId.seriesTitle} #${item.bookId.issueNumber}`} 
                      className={bookCards.coverArt}
                      onClick={openOverlay} />
                  </div>
                  <div className={bookCards.detailsSection}>
                    <p><strong>Publisher:</strong> {item.bookId.publisher || 'N/A'}</p>
                    <p><strong>Release Date:</strong> {formatDate(item.bookId.releaseDate)}</p>
                  </div>
                </div>
                {item.purchased ? <p className={global.success}>Already picked up!</p> : <p className={global.error}>Pulled and waiting for pick up!</p>}
                <div>
                  <button className={buttons.deleteButton}
                    onClick={() => handleDrop(item.bookId._id)}>Drop</button>
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
    </CustomerLayout>
  );
};

export default PullsCustomerPage;
