import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { BiEdit, BiTrash, BiCheckCircle, BiMailSend, BiRefresh, BiListUl, BiEnvelope, BiPlus } from 'react-icons/bi';
import EmailInbox from './EmailInbox';
import EmailModal from './EmailModal';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showEmails, setShowEmails] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedTaskForEmail, setSelectedTaskForEmail] = useState(null);
  const [newTodo, setNewTodo] = useState({ title: '', description: '' });
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/todos`);
      setTodos(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching todos:', err);
      setError('Failed to load tasks. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await axios.delete(`${API_URL}/todos/${id}`);
      setTodos(todos.filter(todo => todo._id !== id));
    } catch (err) {
      console.error('Error deleting todo:', err);
      setError('Failed to delete task. Please try again.');
    }
  };

  const handleToggleComplete = async (todo) => {
    try {
      const updatedTodo = { ...todo, completed: !todo.completed };
      await axios.put(`${API_URL}/todos/${todo._id}`, updatedTodo);
      setTodos(todos.map(t => t._id === todo._id ? updatedTodo : t));
    } catch (err) {
      console.error('Error updating todo:', err);
      setError('Failed to update task status. Please try again.');
    }
  };

  const handleSendEmail = (todo) => {
    setSelectedTaskForEmail(todo);
    setShowEmailModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newTodo.title.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL}/todos`, newTodo);
      setTodos([response.data, ...todos]);
      setNewTodo({ title: '', description: '' });
      setError(null);
    } catch (err) {
      console.error('Error adding task:', err);
      setError('Failed to add task. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="row mb-4">
        <div className="col-12">
          <ul className="nav nav-tabs">
            <li className="nav-item">
              <button 
                className={`nav-link ${!showEmails ? 'active' : ''}`}
                onClick={() => setShowEmails(false)}
              >
                <BiListUl className="icon" /> Tasks
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${showEmails ? 'active' : ''}`}
                onClick={() => setShowEmails(true)}
              >
                <BiEnvelope className="icon" /> Email Inbox
              </button>
            </li>
          </ul>
        </div>
      </div>

      {!showEmails ? (
        <>
          <div className="row mb-4">
            <div className="col-md-8">
              <h2 className="mb-0 text-primary">
                My Tasks
              </h2>
            </div>
            <div className="col-md-4 d-flex justify-content-md-end mt-3 mt-md-0">
              <button 
                className="btn btn-primary" 
                data-bs-toggle="modal" 
                data-bs-target="#addTaskModal"
              >
                <BiPlus className="icon" /> Add New Task
              </button>
            </div>
          </div>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
              <button 
                type="button" 
                className="btn-close float-end" 
                onClick={() => setError(null)}
              ></button>
            </div>
          )}

          <div className="row">
            <div className="col-12">
              <div className="card shadow-sm">
                <div className="card-header bg-white d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Task List</h5>
                  <button 
                    className="btn btn-sm btn-outline-primary" 
                    onClick={fetchTodos} 
                    disabled={isLoading}
                  >
                    <BiRefresh className={`icon ${isLoading ? 'fa-spin' : ''}`} /> Refresh
                  </button>
                </div>
                <div className="card-body">
                  {isLoading ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="mt-2 text-muted">Loading your tasks...</p>
                    </div>
                  ) : todos.length === 0 ? (
                    <div className="text-center py-5">
                      <p className="mb-0 text-muted">No tasks found. Add one to get started!</p>
                    </div>
                  ) : (
                    <div className="list-group">
                      {todos.map(todo => (
                        <div 
                          key={todo._id} 
                          className={`list-group-item todo-item d-flex justify-content-between align-items-center ${todo.completed ? 'completed' : ''}`}
                        >
                          <div className="form-check d-flex align-items-center">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              checked={todo.completed}
                              onChange={() => handleToggleComplete(todo)}
                              id={`checkbox-${todo._id}`}
                            />
                            <label 
                              className={`form-check-label ms-2 ${todo.completed ? 'todo-completed' : ''}`}
                              htmlFor={`checkbox-${todo._id}`}
                            >
                              {todo.title}
                            </label>
                          </div>
                          <div className="btn-group">
                            <Link to={`/todo/${todo._id}`} className="btn btn-sm btn-info btn-action">
                              <BiCheckCircle className="icon" /> View
                            </Link>
                            <button className="btn btn-sm btn-warning btn-action" onClick={() => {/* Handle edit */}}>
                              <BiEdit className="icon" /> Edit
                            </button>
                            <button className="btn btn-sm btn-danger btn-action" onClick={() => handleDelete(todo._id)}>
                              <BiTrash className="icon" /> Delete
                            </button>
                            <button className="btn btn-sm btn-secondary btn-action" onClick={() => handleSendEmail(todo)}>
                              <BiMailSend className="icon" /> Email
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Modal for adding task */}
          <div className="modal fade" id="addTaskModal" tabIndex="-1" aria-labelledby="addTaskModalLabel" aria-hidden="true">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title" id="addTaskModalLabel">Add New Task</h5>
                  <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div className="modal-body">
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label htmlFor="taskTitle" className="form-label">Title</label>
                      <input
                        type="text"
                        className="form-control"
                        id="taskTitle"
                        placeholder="Enter task title"
                        value={newTodo.title}
                        onChange={(e) => setNewTodo({...newTodo, title: e.target.value})}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="taskDescription" className="form-label">Description (optional)</label>
                      <textarea
                        className="form-control"
                        id="taskDescription"
                        rows="3"
                        placeholder="Enter task description"
                        value={newTodo.description}
                        onChange={(e) => setNewTodo({...newTodo, description: e.target.value})}
                      ></textarea>
                    </div>
                    <div className="d-flex justify-content-end">
                      <button type="button" className="btn btn-secondary me-2" data-bs-dismiss="modal">Cancel</button>
                      <button type="submit" className="btn btn-primary" disabled={isLoading}>
                        {isLoading ? 'Adding...' : 'Add Task'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>

          {/* Email Modal */}
          {showEmailModal && (
            <EmailModal 
              taskId={selectedTaskForEmail._id} 
              taskTitle={selectedTaskForEmail.title} 
              onClose={() => setShowEmailModal(false)} 
            />
          )}
        </>
      ) : (
        <EmailInbox />
      )}
    </div>
  );
};

export default TodoList;