import React, { useState, useEffect, useRef } from 'react';
import api from '../api';
import CustomerLayout from '../components/CustomerLayout';
import global from '../styles/global.module.css';
import buttons from '../styles/buttons.module.css';
import bookCards from '../styles/bookCards.module.css';

function ReleasesCustomerPage() {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [pullList, setPullList] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isOverlayActive, setIsOverlayActive] = useState(false);
  const overlayRef = useRef(null);
  const overlayImgRef = useRef(null);
  const activeThumbRef = useRef(null);
  const [weekOptions, setWeekOptions] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState('');
  const [showAll, setShowAll] = useState(true);

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
        setFilteredBooks(booksRes.data);

        // Fetch user's current pull list
        const pullListRes = await api.get('/api/users/pull-list', config);
        setPullList(pullListRes.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Could not fetch data');
      }
    };

    fetchData();

    const generateWeekOptions = () => {
      const options = [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const dayOfWeek = today.getDay(); // Sunday - 0, Monday - 1, etc.
      const mondayOfCurrentWeek = new Date(today);
      mondayOfCurrentWeek.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

      for (let i = -6; i <= 6; i++) {
        const startOfWeek = new Date(mondayOfCurrentWeek);
        startOfWeek.setDate(mondayOfCurrentWeek.getDate() + (i * 7));
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        const label = i === 0 ? 'Current Week' : i < 0 ? `${-i} week${-i > 1 ? 's' : ''} ago` : `${i} week${i > 1 ? 's' : ''} from now`;
        const dateRange = `${startOfWeek.toLocaleDateString()} - ${endOfWeek.toLocaleDateString()}`;
        
        options.push({
          value: `${startOfWeek.toISOString()}_${endOfWeek.toISOString()}`,
          label: `${label} (${dateRange})`
        });
      }
      setWeekOptions(options);
    };

    generateWeekOptions();

  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => e.key === 'Escape' && closeOverlay();
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (showAll) {
      setFilteredBooks(books);
    } else if (selectedWeek) {
      const [start, end] = selectedWeek.split('_').map(d => new Date(d));
      end.setHours(23, 59, 59, 999); // Ensure the end date includes the whole day
      const filtered = books.filter(book => {
        const releaseDate = new Date(book.releaseDate);
        return releaseDate >= start && releaseDate <= end;
      });
      setFilteredBooks(filtered);
    } else {
      setFilteredBooks([]); // If not showing all and no week is selected, show nothing
    }
  }, [selectedWeek, showAll, books]);

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
    const date = new Date(dateString);
    return `${date.getUTCMonth() + 1}/${date.getUTCDate()}/${date.getUTCFullYear()}`;
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
      

      const newPullItem = {
        bookId: { _id: bookId },
      };
      setPullList([...pullList, newPullItem]);
      setMessage('Book added to your pull list!');
      setTimeout(() => setMessage(''), 3000);

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add to pull list');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <CustomerLayout title="Releases">
      <div className={bookCards.controlsContainer} style={{ justifyContent: 'flex-end' }}>
        <div className={bookCards.filterControls}>
          <select 
            value={selectedWeek} 
            onChange={(e) => {
              setSelectedWeek(e.target.value);
              if (e.target.value) setShowAll(false);
            }}
            disabled={showAll}
          >
            <option value="">Choose a week</option>
            {weekOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
          <label>
            <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} />
            Show All Releases
          </label>
        </div>
      </div>
      <div className={bookCards.cardContainer}>
        {message && <p className={global.success}>{message}</p>}
        {error && <p className={global.error}>{error}</p>}
        {filteredBooks.map((book) => {
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
