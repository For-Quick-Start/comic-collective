import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import EmployeeLayout from '../components/EmployeeLayout';
import globalStyles from '../styles/global.module.css';
import bookCardsStyles from '../styles/bookCards.module.css';
import buttonsStyles from '../styles/buttons.module.css';

function InsertBookPage() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
    seriesTitle: '',
    seriesStartDate: '',
    seriesEndDate: '',
    publisher: '',
    issueNumber: '',
    releaseDate: '',
    coverArt: '',
    inventory: 0,
  });
  const [tags, setTags] = useState([]);
  const [currentTag, setCurrentTag] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const { seriesTitle, seriesStartDate, seriesEndDate, publisher, issueNumber, releaseDate, coverArt } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddTag = () => {
    if (currentTag && !tags.includes(currentTag)) {
      setTags([...tags, currentTag]);
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const bookData = { ...formData, tags };
      if (!bookData.seriesEndDate) {
        delete bookData.seriesEndDate; // Don't send empty string for optional date
      }

      await api.post('/api/books', bookData, config);
      setMessage('Book added successfully!');
      setTimeout(() => navigate('/dashempl'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred adding the book.');
    }
  };

  return (
    <EmployeeLayout title="Add a Book">
      {message && <p className={globalStyles.success}>{message}</p>}
      {error && <p className={globalStyles.error}>{error}</p>}
      <div className={bookCardsStyles.cardContainer}>
        <div className={bookCardsStyles.bookCard}>
          <div className={bookCardsStyles.coverArtSection}>
            <img src={coverArt || '/covers/cover-placeholder.png'} alt="Cover Art" />
          </div>
          <div className={bookCardsStyles.formContent}>
            <form onSubmit={handleSubmit}>
              <div className={bookCardsStyles.formGrid}>
                <div className={bookCardsStyles.formGroup}>
                  <label>Series Title*:</label>
                  <input type="text" name="seriesTitle" value={seriesTitle} onChange={onChange} required />
                </div>
                <div className={bookCardsStyles.formGroup}>
                  <label>Issue Number*:</label>
                  <input type="number" name="issueNumber" value={issueNumber} onChange={onChange} required />
                </div>
                <div className={bookCardsStyles.formGroup}>
                  <label>Publisher*:</label>
                  <input type="text" name="publisher" value={publisher} onChange={onChange} required />
                </div>
                <div className={bookCardsStyles.formGroup}>
                  <label>Release Date*:</label>
                  <input type="date" name="releaseDate" value={releaseDate} onChange={onChange} required />
                </div>
                <div className={bookCardsStyles.formGroup}>
                  <label>Series Start Date*:</label>
                  <input type="date" name="seriesStartDate" value={seriesStartDate} onChange={onChange} required />
                </div>
                <div className={bookCardsStyles.formGroup}>
                  <label>Series End Date:</label>
                  <input type="date" name="seriesEndDate" value={seriesEndDate} onChange={onChange} />
                </div>
              </div>

              <div className={bookCardsStyles.inventoryRow}>
                  <div className={bookCardsStyles.formGroup}>
                      <label htmlFor="inventory">On Hand:</label>
                      <input id="inventory" type="number" name="inventory" value={formData.inventory} onChange={onChange} min="0" />
                  </div>
              </div>

              <div className={bookCardsStyles.tagsSection}>
                <div className={bookCardsStyles.formGroup}>
                  <label htmlFor="tag-input">Tags:</label>
                  <div className={bookCardsStyles.tagInputContainer}>
                    <input
                    id="tag-input"
                    type="text"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                    />
                    <button type="button" onClick={handleAddTag} className={buttonsStyles.submitButton}>Add Tag</button>
                  </div>
                  <div className={bookCardsStyles.tagsDisplay}>
                    {tags.map(tag => (
                    <span key={tag} className={bookCardsStyles.tag}>
                      {tag}
                      <button type="button" onClick={() => handleRemoveTag(tag)} className={buttonsStyles.removeTagBtn}>x</button>
                    </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className={bookCardsStyles.formActions}>
                <button type="button" className={buttonsStyles.cancelButton} onClick={() => navigate('/inventory')}>Cancel</button>
                <button type="submit" className={buttonsStyles.submitButton} >Add new Book</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </EmployeeLayout>
  );
}

export default InsertBookPage;