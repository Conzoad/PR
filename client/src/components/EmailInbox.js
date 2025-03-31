import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaInbox, FaSync, FaEnvelope, FaServer, FaDatabase, FaTimes } from 'react-icons/fa';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const EmailInbox = () => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [protocol, setProtocol] = useState('imap'); // 'imap' или 'pop3'
  const [selectedEmail, setSelectedEmail] = useState(null);

  useEffect(() => {
    fetchEmails();
  }, [protocol]);

  const fetchEmails = async () => {
    try {
      setLoading(true);
      setError('');
      
      const url = `${API_URL}/email/${protocol}`;
      
      const response = await axios.get(url);
      setEmails(response.data);
      
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError(`Failed to load emails via ${protocol.toUpperCase()}: ${err.response?.data?.error || err.message}`);
    }
  };

  const handleSelectEmail = (email) => {
    setSelectedEmail(email);
  };

  const handleCloseEmail = () => {
    setSelectedEmail(null);
  };

  const formatSender = (from) => {
    if (!from) return 'Unknown sender';
    if (typeof from === 'object' && from.text) return from.text;
    return from;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    try {
      return new Date(dateString).toLocaleString();
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="email-inbox">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3><FaInbox className="icon" /> Email Inbox</h3>
        <div>
          <div className="btn-group me-2">
            <button 
              className={`btn ${protocol === 'imap' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setProtocol('imap')}
            >
              <FaServer className="icon" /> IMAP
            </button>
            <button 
              className={`btn ${protocol === 'pop3' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setProtocol('pop3')}
            >
              <FaDatabase className="icon" /> POP3
            </button>
          </div>
          <button 
            className="btn btn-success" 
            onClick={fetchEmails}
            disabled={loading}
          >
            <FaSync className={`icon ${loading ? 'fa-spin' : ''}`} /> {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {selectedEmail ? (
        <div className="email-detail card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="mb-0">{selectedEmail.subject || 'No Subject'}</h5>
            <button className="btn-close" onClick={handleCloseEmail}>
              <FaTimes />
            </button>
          </div>
          <div className="card-body">
            <div className="mb-3">
              <strong>From:</strong> {formatSender(selectedEmail.from) || selectedEmail.header?.from?.[0] || 'Unknown sender'}
            </div>
            <div className="mb-3">
              <strong>Date:</strong> {formatDate(selectedEmail.date || selectedEmail.header?.date?.[0])}
            </div>
            <hr />
            <div className="email-content">
              {selectedEmail.html ? (
                <div dangerouslySetInnerHTML={{ __html: selectedEmail.html }} />
              ) : (
                <pre className="email-text">{selectedEmail.text || selectedEmail.body || 'No content'}</pre>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="email-list list-group">
          {loading ? (
            <div className="d-flex justify-content-center my-5">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : emails.length > 0 ? (
            emails.map((email, index) => (
              <button 
                key={email.id || email.seqno || index}
                className="list-group-item list-group-item-action"
                onClick={() => handleSelectEmail(email)}
              >
                <div className="d-flex w-100 justify-content-between">
                  <h5 className="mb-1">
                    <FaEnvelope className="icon" />
                    {email.subject || email.header?.subject?.[0] || 'No Subject'}
                  </h5>
                  <small>
                    {formatDate(email.date || email.header?.date?.[0])}
                  </small>
                </div>
                <p className="mb-1">
                  From: {formatSender(email.from) || email.header?.from?.[0] || 'Unknown sender'}
                </p>
              </button>
            ))
          ) : (
            <div className="alert alert-info">
              No emails found. Try refreshing or switching the protocol.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EmailInbox; 