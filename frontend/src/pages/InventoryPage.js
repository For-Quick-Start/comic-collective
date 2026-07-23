import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import EmployeeLayout from '../components/EmployeeLayout';
import global from '../styles/global.module.css';
import buttons from '../styles/buttons.module.css';
import bookCards from '../styles/bookCards.module.css';

function InventoryPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isOverlayActive, setIsOverlayActive] = useState(false);
  const overlayRef = useRef(null);
  const overlayImgRef = useRef(null);
  const activeThumbRef = useRef(null);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
        const { data } = await api.get('/api/books', config);
        setBooks(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch books');
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
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
    overlayImg.style.borderRadius = '0px';

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
        overlayImg.style.borderRadius = '0px';
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
    overlayImg.style.borderRadius = '0px';

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

  useEffect(() => {
    const handleKeyDown = (e) => e.key === 'Escape' && closeOverlay();
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return <EmployeeLayout title="Book Inventory"><div className={bookCards.loadingSpinner}></div></EmployeeLayout>;
  }

  if (error) {
    return <EmployeeLayout title="Book Inventory"><p className={global.error}>{error}</p></EmployeeLayout>;
  }

  return (
    <EmployeeLayout title="Book Inventory">
      <a href="/insertbook">
        <button className={buttons.submitButton}>Add a New Book</button>
      </a>
      <div className={bookCards.cardContainer}>
        {books.map((book) => {
          const onHand = book.inventory || 0;
          const pulls = book.totalPulls || 0;
          const netInventory = onHand - pulls;
          const isLowInventory = netInventory < 5;

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
                  <div className={bookCards.inventorySection}>
                    <p><strong>On Hand:</strong> {onHand}</p>
                    <p><strong>Total Pulls:</strong> {pulls}</p>
                    {isLowInventory && <p className={bookCards.lowInventoryWarning}>Low Inventory!</p>}
                  </div>
                  <div className={bookCards.tagsDisplay}>
                    {book.tags && book.tags.length > 0 ? book.tags.map(tag => (<span key={tag} className={bookCards.tag}>{tag}</span>)) : <p>No tags</p>}
                  </div>
                  <Link to={`/editbook/${book._id}`} className={buttons.editButton} style={{marginTop: 'auto'}}>Edit</Link>
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
    </EmployeeLayout>
  );
}

export default InventoryPage;
