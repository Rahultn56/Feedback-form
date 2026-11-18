import React, { useState, useEffect } from 'react';

export default function App() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rating: 5,
    category: 'General',
    message: ''
  });
  const [status, setStatus] = useState({ loading: false, msg: '', error: false });
  const [feedbacks, setFeedbacks] = useState([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(true);

  const fetchFeedbacks = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/feedback');
      const data = await res.json();
      if (data.success) {
        setFeedbacks(data.data);
      }
    } catch (err) {
      console.error('Error fetching feedbacks:', err);
    } finally {
      setLoadingFeedbacks(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, msg: '', error: false });

    try {
      const res = await fetch('http://localhost:5000/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (data.success) {
        setStatus({
          loading: false,
          msg: '🎉 Thank you! Your feedback has been saved to MongoDB.',
          error: false
        });
        setFormData({ name: '', email: '', rating: 5, category: 'General', message: '' });
        fetchFeedbacks();
      } else {
        setStatus({
          loading: false,
          msg: data.message || 'Error saving feedback',
          error: true
        });
      }
    } catch (err) {
      setStatus({
        loading: false,
        msg: '❌ Failed to connect to backend server. Make sure node server.js is running.',
        error: true
      });
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1>💬 User Feedback System</h1>
        <p className="subtitle">Powered by Node.js, Express & MongoDB Database</p>
      </header>

      {status.msg && (
        <div className={`alert ${status.error ? 'alert-error' : 'alert-success'}`}>
          {status.msg}
        </div>
      )}

      <div className="card form-card">
        <h2>Submit Your Feedback</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <input
              id="name"
              type="text"
              name="name"
              placeholder="e.g. Rahul G"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="e.g. rahul@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="General">General Feedback</option>
                <option value="Suggestion">Feature Suggestion</option>
                <option value="Bug Report">Bug Report</option>
                <option value="Praise">Compliment / Praise</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="rating">Rating (1 to 5 Stars)</label>
              <select
                id="rating"
                name="rating"
                value={formData.rating}
                onChange={handleChange}
              >
                <option value="5">⭐⭐⭐⭐⭐ (5 - Excellent)</option>
                <option value="4">⭐⭐⭐⭐ (4 - Very Good)</option>
                <option value="3">⭐⭐⭐ (3 - Average)</option>
                <option value="2">⭐⭐ (2 - Poor)</option>
                <option value="1">⭐ (1 - Very Bad)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="message">Your Message *</label>
            <textarea
              id="message"
              name="message"
              rows="4"
              placeholder="Write your feedback details here..."
              value={formData.message}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="submit-btn" disabled={status.loading}>
            {status.loading ? 'Saving to MongoDB...' : 'Submit Feedback 🚀'}
          </button>
        </form>
      </div>

      <div className="card feed-card">
        <div className="feed-header">
          <h2>Stored Feedback in MongoDB</h2>
          <button className="refresh-btn" onClick={fetchFeedbacks}>🔄 Refresh</button>
        </div>

        {loadingFeedbacks ? (
          <p className="loading-text">Loading feedbacks from MongoDB...</p>
        ) : feedbacks.length === 0 ? (
          <p className="empty-text">No feedback recorded in MongoDB yet. Be the first to submit!</p>
        ) : (
          <div className="feedback-list">
            {feedbacks.map((item) => (
              <div key={item._id} className="feedback-item">
                <div className="item-top">
                  <div>
                    <strong className="item-name">{item.name}</strong>
                    <span className="badge">{item.category}</span>
                  </div>
                  <span className="item-stars">{'⭐'.repeat(item.rating || 5)}</span>
                </div>
                <p className="item-msg">{item.message}</p>
                <div className="item-meta">
                  <span>✉️ {item.email}</span>
                  <span>🕒 {new Date(item.createdAt).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
