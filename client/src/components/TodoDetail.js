import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const TodoDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [todo, setTodo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTodo = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${API_URL}/todos/${id}`);
        setTodo(response.data);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching todo:', err);
        setError('Failed to load task. It may have been deleted or does not exist.');
        setIsLoading(false);
      }
    };

    fetchTodo();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await axios.delete(`${API_URL}/todos/${id}`);
        navigate('/');
      } catch (err) {
        console.error('Error deleting todo:', err);
        alert('Failed to delete task. Please try again.');
      }
    }
  };

  const handleToggleComplete = async () => {
    try {
      const updatedTodo = { ...todo, completed: !todo.completed };
      const response = await axios.put(`${API_URL}/todos/${id}`, updatedTodo);
      setTodo(response.data);
    } catch (err) {
      console.error('Error updating todo:', err);
      alert('Failed to update task. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
        <div className="mt-3">
          <Link to="/" className="btn btn-primary">Back to List</Link>
        </div>
      </div>
    );
  }

  if (!todo) return null;

  return (
    <div className="detail-card">
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Task Details</h5>
          <div>
            <button 
              className="btn btn-sm btn-success me-2" 
              onClick={handleToggleComplete}
            >
              {todo.completed ? 'Mark as Incomplete' : 'Mark as Complete'}
            </button>
            <Link to="/" className="btn btn-sm btn-primary me-2">
              Back to List
            </Link>
          </div>
        </div>
        <div className="card-body">
          <h5 className="card-title">
            {todo.title} 
            {todo.completed && (
              <span className="badge bg-success ms-2">Completed</span>
            )}
          </h5>
          <p className="card-text mt-3">{todo.description || 'No description provided.'}</p>
          <div className="d-flex justify-content-between mt-4">
            <div>
              <small className="text-muted">
                Created: {new Date(todo.createdAt).toLocaleString()}
              </small>
            </div>
            <div>
              <Link 
                to={`/?edit=${todo._id}`} 
                className="btn btn-warning btn-sm me-2"
              >
                Edit
              </Link>
              <button 
                className="btn btn-danger btn-sm"
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodoDetail; 