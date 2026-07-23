import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import EmployeeLayout from '../components/EmployeeLayout';
import global from '../styles/global.module.css';
import buttons from '../styles/buttons.module.css';
import form from '../styles/forms.module.css';
import bookCards from '../styles/bookCards.module.css';

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
  const [coverArtFile, setCoverArtFile] = useState(null);
  const fileInputRef = useRef(null);

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
      const bookData = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'seriesEndDate' && !formData[key]) {
          // Don't append empty optional date
        } else if (key === 'coverArt') {
          // Do not append the coverArt field, as it's a base64 preview for the frontend only.
          // The actual file is in coverArtFile.
        } else {
          bookData.append(key, formData[key]);
        }
      });
      tags.forEach(tag => bookData.append('tags', tag));
      if (coverArtFile) {
        bookData.append('coverArtFile', coverArtFile);
      }

      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      await api.post('/api/books', bookData, config);
      setMessage('Book added successfully!');
      setTimeout(() => navigate('/dashempl'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred adding the book.');
    }
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.avif'];
    const fileExtension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();

    if (!allowedExtensions.includes(fileExtension)) {
      setError('Invalid file type. Please select an image.');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setCoverArtFile(file);
    // Show a preview of the selected image
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, coverArt: reader.result });
    };
    reader.readAsDataURL(file);
  };

  return (
    <EmployeeLayout title="Add a Book">
      {message && <p className={global.success}>{message}</p>}
      {error && <p className={global.error}>{error}</p>}
      <div className={bookCards.cardContainer}>
        <div className={bookCards.bookCard}>
          <div className={bookCards.bookCardContent}>
            <div className={bookCards.coverArtSection} onClick={handleImageClick} style={{ cursor: 'pointer' }}>
              <img src={coverArt || '/covers/cover-placeholder.png'} alt="Cover Art" className={bookCards.coverArt} />
              <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept=".jpg,.jpeg,.png,.gif,.webp,.svg,.avif" />
              <small style={{ textAlign: 'center', display: 'block', marginTop: '5px' }}>Click image to upload new image</small>
            </div>
            <div className={form.formContainer}>
              <form onSubmit={handleSubmit}>
                <div className={form.formGrid}>
                  <div className={form.formGroup}>
                    <label>Series Title*:</label>
                    <input type="text" name="seriesTitle" value={seriesTitle} onChange={onChange} required />
                  </div>
                  <div className={form.formGroup}>
                    <label>Issue Number*:</label>
                    <input type="number" name="issueNumber" value={issueNumber} onChange={onChange} required />
                  </div>
                  <div className={form.formGroup}>
                    <label>Publisher*:</label>
                    <input type="text" name="publisher" value={publisher} onChange={onChange} required />
                  </div>
                  <div className={form.formGroup}>
                    <label>Release Date*:</label>
                    <input type="date" name="releaseDate" value={releaseDate} onChange={onChange} required />
                  </div>
                  <div className={form.formGroup}>
                    <label>Series Start Date*:</label>
                    <input type="date" name="seriesStartDate" value={seriesStartDate} onChange={onChange} required />
                  </div>
                  <div className={form.formGroup}>
                    <label>Series End Date:</label>
                    <input type="date" name="seriesEndDate" value={seriesEndDate} onChange={onChange} />
                  </div>
                </div>

                <div className={bookCards.inventoryRow}>
                    <div className={form.formGroup}>
                        <label htmlFor="inventory">On Hand:</label>
                        <input id="inventory" type="number" name="inventory" value={formData.inventory} onChange={onChange} min="0" />
                    </div>
                </div>

                <div className={bookCards.tagsSection}>
                  <div className={form.formGroup}>
                    <label htmlFor="tag-input">Tags:</label>
                    <div className={bookCards.tagInputContainer}>
                      <input
                      id="tag-input"
                      type="text"
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                      />
                      <button type="button" onClick={handleAddTag} className={buttons.submitButton}>Add Tag</button>
                    </div>
                    <div className={bookCards.tagsDisplay}>
                      {tags.map(tag => (
                      <span key={tag} className={bookCards.tag}>
                        {tag}
                        <button type="button" onClick={() => handleRemoveTag(tag)} className={buttons.removeTagBtn}>x</button>
                      </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className={form.formActions}>
                  <button type="button" className={buttons.cancelButton} onClick={() => navigate('/inventory')}>Cancel</button>
                  <button type="submit" className={buttons.submitButton} >Add new Book</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </EmployeeLayout>
  );
}

export default InsertBookPage;
