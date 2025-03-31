import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import EmailModal from './EmailModal';
import { BiArrowBack, BiCheckCircle, BiEdit, BiTrash, BiMailSend } from 'react-icons/bi';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const TodoDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [todo, setTodo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showEmailModal, setShowEmailModal] = useState(false);

  useEffect(() => {
    const fetchTodo = async () => {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/todos/${id}`);
      setTodo(response.data);
      setIsLoading(false);
    };
    fetchTodo();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await axios.delete(`${API_URL}/todos/${id}`);
      navigate('/');
    }
  };

  const handleToggleComplete = async () => {
    const updatedTodo = { ...todo, completed: !todo.completed };
    const response = await axios.put(`${API_URL}/todos/${id}`, updatedTodo);
    setTodo(response.data);
  };

  if (isLoading) return <div className="d-flex justify-content-center mt-5"><div className="spinner-border" role="status"></div></div>;

  return (
    <div className="detail-card">
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0 display-6">Task Details</h5>
          <div className="d-flex gap-2">
            <button className="btn btn-sm btn-success" onClick={handleToggleComplete}>
              {todo.completed ? 'Mark as Incomplete' : <><BiCheckCircle className="me-2" />Mark as Complete</>}
            </button>
            <Link to="/" className="btn btn-sm btn-primary"><BiArrowBack className="me-2" />Back</Link>
          </div>
        </div>
        <div className="card-body">
          <h5 className="card-title display-5">{todo.title} {todo.completed && <span className="badge bg-success ms-2">Completed</span>}</h5>
          <p className="card-text lead">{todo.description || 'No description provided.'}</p>
          <div className="d-flex justify-content-between mt-4">
            <small className="text-muted">Created: {new Date(todo.createdAt).toLocaleString()}</small>
            <div className="d-flex gap-2">
              <button className="btn btn-sm btn-secondary" onClick={() => setShowEmailModal(true)}><BiMailSend /></button>
              <Link to={`/?edit=${todo._id}`} className="btn btn-sm btn-warning"><BiEdit /></Link>
              <button className="btn btn-sm btn-danger" onClick={handleDelete}><BiTrash /></button>
            </div>
          </div>
        </div>
      </div>
      {showEmailModal && <EmailModal taskId={todo._id} taskTitle={todo.title} onClose={() => setShowEmailModal(false)} />}
    </div>
  );
};

export default TodoDetail;