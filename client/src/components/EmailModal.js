import React, { useState } from 'react';
import axios from 'axios';
import { FaPaperPlane, FaTimes } from 'react-icons/fa';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const EmailModal = ({ taskId, taskTitle, onClose }) => {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Email address is required');
      return;
    }
    
    try {
      setSending(true);
      setError('');
      
      const response = await axios.post(`${API_URL}/email/send-task`, {
        taskId,
        emailTo: email
      });
      
      setSending(false);
      setSuccess(true);
      setEmail('');
      
      // Автоматически закрыть модальное окно через 2 секунды после успешной отправки
      setTimeout(() => {
        onClose();
      }, 2000);
      
    } catch (err) {
      setSending(false);
      setError(err.response?.data?.message || 'Error sending email. Please try again.');
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h5 className="modal-title">
            <FaPaperPlane className="icon" /> Send Task via Email
          </h5>
          <button type="button" className="btn-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="modal-body">
          {success ? (
            <div className="alert alert-success">
              Email sent successfully!
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="task-title" className="form-label">Task</label>
                <input
                  type="text"
                  className="form-control"
                  id="task-title"
                  value={taskTitle}
                  disabled
                />
              </div>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Recipient Email</label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  placeholder="recipient@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                {error && <div className="text-danger mt-1">{error}</div>}
              </div>
              <div className="d-flex justify-content-end">
                <button
                  type="button"
                  className="btn btn-secondary me-2"
                  onClick={onClose}
                >
                  <FaTimes className="icon" /> Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={sending}
                >
                  {sending ? 'Sending...' : <><FaPaperPlane className="icon" /> Send Email</>}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailModal; 