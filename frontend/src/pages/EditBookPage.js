import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import EmployeeLayout from '../components/EmployeeLayout';
import globalStyles from '../styles/global.module.css';
import buttonsStyles from '../styles/buttons.module.css';
import bookCardsStyles from '../styles/bookCards.module.css';


function EditBookPage() {
  const { id } = useParams();
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
    totalPulls: 0,
  });
  const [tags, setTags] = useState([]);
  const [currentTag, setCurrentTag] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const fileInputRef = useRef(null);

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().split('T')[0];
  };

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
        const { data } = await api.get(`/api/books/${id}`, config);
        setFormData({
          seriesTitle: data.seriesTitle,
          seriesStartDate: formatDateForInput(data.seriesStartDate),
          seriesEndDate: formatDateForInput(data.seriesEndDate),
          publisher: data.publisher,
          issueNumber: data.issueNumber,
          releaseDate: formatDateForInput(data.releaseDate),
          coverArt: data.coverArt || '',
          inventory: data.inventory || 0,
          totalPulls: data.totalPulls || 0,
        });
        setTags(data.tags || []);
      } catch (err) {
        setError('Could not fetch book data.');
      }
    };
    fetchBook();
  }, [id]);

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

      const bookData = { ...formData, tags, seriesEndDate: formData.seriesEndDate || null };    




      await api.put(`/api/books/${id}`, bookData, config);
      setMessage('Book updated successfully!');

      } catch (err) {
      setError(err.response?.data?.message || 'An error occurred during update.');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to permanently delete this book? This action cannot be undone.')) {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
        await api.delete(`/api/books/${id}`, config);
        navigate('/inventory');
      } catch (err) {
        setError(err.response?.data?.message || 'Could not delete book.');
      }
    }
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.avif'];
    const fileExtension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();

    if (!allowedExtensions.includes(fileExtension)) {
      setError('Invalid file type. Please select an image.');
      setTimeout(() => setError(''), 3000);
      return;
    }

    const uploadFormData = new FormData();
    uploadFormData.append('coverArtFile', file);

    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await api.post(`/api/books/${id}/upload-cover`, uploadFormData, config);

      setFormData({ ...formData, coverArt: data.coverArt });
      setMessage('Cover image updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload image.');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <EmployeeLayout title={`Edit: ${formData.seriesTitle || 'Book'}`}>
      {message && <p className={globalStyles.success}>{message}</p>}
      {error && <p className={globalStyles.error}>{error}</p>}
      <div className={bookCardsStyles.cardContainer}>
        <div className={bookCardsStyles.bookCard}>
          <div className={bookCardsStyles.coverArtSection} onClick={handleImageClick} style={{ cursor: 'pointer' }}>
            <img src={formData.coverArt || '/covers/cover-placeholder.png'} alt="Cover Art" className={bookCardsStyles.coverArt} />
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: 'none' }}
              accept=".jpg,.jpeg,.png,.gif,.webp,.svg,.avif"
            />
            <small style={{ textAlign: 'center', display: 'block', marginTop: '5px' }}>Click image to upload new image</small>
          </div>
        <div className={bookCardsStyles.bookDetails}>
          <div className={bookCardsStyles.formContent}>
            <form onSubmit={handleSubmit}>
              <div className={bookCardsStyles.formGrid}>
                <div className={bookCardsStyles.formGroup}>
                <label htmlFor="seriesTitle">Series Title*:</label>
                <input id="seriesTitle" type="text" name="seriesTitle" value={formData.seriesTitle} onChange={onChange} required />
                </div>
                <div className={bookCardsStyles.formGroup}>
                <label htmlFor="issueNumber">Issue Number*:</label>
                <input id="issueNumber" type="number" name="issueNumber" value={formData.issueNumber} onChange={onChange} required />
                </div>
                <div className={bookCardsStyles.formGroup}>
                <label htmlFor="publisher">Publisher*:</label>
                <input id="publisher" type="text" name="publisher" value={formData.publisher} onChange={onChange} required />
                </div>
                <div className={bookCardsStyles.formGroup}>
                <label htmlFor="releaseDate">Release Date*:</label>
                <input id="releaseDate" type="date" name="releaseDate" value={formData.releaseDate} onChange={onChange} required />
                </div>
                <div className={bookCardsStyles.formGroup}>
                <label htmlFor="seriesStartDate">Series Start Date*:</label>
                <input id="seriesStartDate" type="date" name="seriesStartDate" value={formData.seriesStartDate} onChange={onChange} required />
                </div>
                <div className={bookCardsStyles.formGroup}>
                <label htmlFor="seriesEndDate">Series End Date:</label>
                <input id="seriesEndDate" type="date" name="seriesEndDate" value={formData.seriesEndDate} onChange={onChange} />
                </div>
              </div>
              <div className={bookCardsStyles.inventoryRow}>
                <div className={bookCardsStyles.formGroup}>
                  <label htmlFor="inventory">On Hand:</label>
                  <input id="inventory" type="number" name="inventory" value={formData.inventory} onChange={onChange} min="0" />
                </div>
                <div className={bookCardsStyles.formGroup}>
                  <label>Total Pulls:</label>
                  <div className={bookCardsStyles.staticField}>
                    {formData.totalPulls}
                  </div>
                </div>
              </div>
              {/* TAGS Section */}
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
              {/* BUTTONS Section */}
              <div className={bookCardsStyles.formActions}>
                <button type="button" onClick={handleDelete} className={buttonsStyles.logoutButton}>Delete</button>
                <button type="button" onClick={() => navigate('/inventory')} className={buttonsStyles.cancelButton}>Cancel</button>
                <button type="submit" className={buttonsStyles.submitButton}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
        </div>
      </div>
    </EmployeeLayout>
  );
}

export default EditBookPage;