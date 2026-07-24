import React, { useState, useEffect, useRef } from 'react';
import api from '../api';
import CustomerLayout from '../components/CustomerLayout';
import global from '../styles/global.module.css';
import buttons from '../styles/buttons.module.css';
import bookCards from '../styles/bookCards.module.css';

function ReleasesCustomerPage() {
  const [books, setBooks] = useState([]);
  const [pullList, setPullList] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isOverlayActive, setIsOverlayActive] = useState(false);
  const overlayRef = useRef(null);
  const overlayImgRef = useRef(null);
  const activeThumbRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };

        // Fetch all books
        const booksRes = await api.get('/api/books', config);
        setBooks(booksRes.data);

        // Fetch user's current pull list
        const pullListRes = await api.get('/api/users/pull-list', config);
        setPullList(pullListRes.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Could not fetch data');
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => e.key === 'Escape' && closeOverlay();
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

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

  const handlePull = async (bookId) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      await api.post('/api/users/me/pull-list', { bookId }, config);
      
      // Add book to local pull list state to update UI instantly
      setPullList([...pullList, bookId]);
      setMessage('Book added to your pull list!');
      setTimeout(() => setMessage(''), 3000); // Clear message after 3 seconds

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add to pull list');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <CustomerLayout title="Releases">
      <div className={bookCards.cardContainer}>
        {message && <p className={global.success}>{message}</p>}
        {error && <p className={global.error}>{error}</p>}
        {books.map((book) => {
          const pullItem = pullList.find(item => item.bookId && item.bookId._id === book._id);
          const isPulled = !!pullItem;
          const isPhysicallyPulled = pullItem?.pulled;

          let buttonText = 'Pull';
          if (isPhysicallyPulled) {
            buttonText = 'Pulled';
          } else if (isPulled) {
            buttonText = 'Pull Requested';
          }

          return (
            <div key={book._id} className={bookCards.bookCard}>
              <div className={bookCards.bookCardTitle}>
                <h2>{book.seriesTitle} #{book.issueNumber}</h2>
              </div>
              <div className={bookCards.bookCardContent}>
                <div className={bookCards.coverArtSection}>
                  <img src={book.coverArt || '/covers/cover-placeholder.png'} 
                    alt={`${book.seriesTitle} #${book.issueNumber}`} 
                    className={bookCards.coverArt}
                    onClick={openOverlay} />
                </div>
                <div className={bookCards.detailsSection}>
                  <p><strong>Publisher:</strong> {book.publisher || 'N/A'}</p>
                  <p><strong>Release Date:</strong> {formatDate(book.releaseDate)}</p>
                  <p><strong>Series Start Date:</strong> {formatDate(book.seriesStartDate)}</p>
                  <p><strong>Series End Date:</strong> {formatDate(book.seriesEndDate)}</p>
                  <div className={bookCards.tagsDisplay}>
                    {book.tags && book.tags.length > 0 ? book.tags.map(tag => (<span key={tag} className={bookCards.tag}>{tag}</span>)) : <p>No tags</p>}
                  </div>
                  <div style={{ marginTop: 'auto' }}>
                    <button className={buttons.editButton}
                      onClick={() => handlePull(book._id)}
                      disabled={isPulled}
                    >
                      {buttonText}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div ref={overlayRef} className={`${bookCards.overlay} ${isOverlayActive ? bookCards.active : ''}`} onClick={(e) => e.target === overlayRef.current && closeOverlay()}>
        <button className={bookCards.overlayClose} onClick={closeOverlay} aria-label="Close">&times;</button>
        <img ref={overlayImgRef} className={bookCards.overlayImg} src="" alt="" />
      </div>
    </CustomerLayout>
  );
}

export default ReleasesCustomerPage;
