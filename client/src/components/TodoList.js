import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import TodoForm from './TodoForm';
import EmailModal from './EmailModal';
import EmailInbox from './EmailInbox';
import { FaEnvelope, FaEdit, FaTrash, FaEye, FaTasks, FaInbox, FaWifi } from 'react-icons/fa';
import { useSocket } from '../context/SocketContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedTaskForEmail, setSelectedTaskForEmail] = useState(null);
  const [activeTab, setActiveTab] = useState('tasks'); // 'tasks' или 'email'
  const { socket, connected } = useSocket();

  useEffect(() => {
    fetchTodos();
  }, []);

  // Обработчики событий WebSocket
  useEffect(() => {
    if (!socket) return;

    // Обработчик создания новой задачи
    socket.on('todoCreated', (newTodo) => {
      console.log('New todo received:', newTodo);
      setTodos(prevTodos => [newTodo, ...prevTodos]);
    });

    // Обработчик обновления задачи
    socket.on('todoUpdated', (updatedTodo) => {
      console.log('Todo updated:', updatedTodo);
      setTodos(prevTodos => 
        prevTodos.map(todo => 
          todo._id === updatedTodo._id ? updatedTodo : todo
        )
      );
    });

    // Обработчик удаления задачи
    socket.on('todoDeleted', (data) => {
      console.log('Todo deleted:', data.id);
      setTodos(prevTodos => 
        prevTodos.filter(todo => todo._id !== data.id)
      );
    });

    // Отписка от событий при размонтировании
    return () => {
      socket.off('todoCreated');
      socket.off('todoUpdated');
      socket.off('todoDeleted');
    };
  }, [socket]);

  const fetchTodos = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/todos`);
      setTodos(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching todos:', error);
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await axios.delete(`${API_URL}/todos/${id}`);
        setTodos(todos.filter(todo => todo._id !== id));
      } catch (error) {
        console.error('Error deleting todo:', error);
      }
    }
  };

  const handleToggleComplete = async (todo) => {
    try {
      const updatedTodo = { ...todo, completed: !todo.completed };
      const response = await axios.put(`${API_URL}/todos/${todo._id}`, updatedTodo);
      setTodos(todos.map(t => t._id === todo._id ? response.data : t));
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const handleEdit = (todo) => {
    setEditingTodo(todo);
    setShowForm(true);
  };

  const handleSave = async (formData) => {
    try {
      if (editingTodo) {
        // Update existing todo
        const response = await axios.put(`${API_URL}/todos/${editingTodo._id}`, formData);
        setTodos(todos.map(t => t._id === editingTodo._id ? response.data : t));
      } else {
        // Create new todo
        const response = await axios.post(`${API_URL}/todos`, formData);
        setTodos([response.data, ...todos]);
      }
      setShowForm(false);
      setEditingTodo(null);
    } catch (error) {
      console.error('Error saving todo:', error);
    }
  };

  const handleSendEmail = (todo) => {
    setSelectedTaskForEmail(todo);
    setShowEmailModal(true);
  };

  const handleCloseEmailModal = () => {
    setShowEmailModal(false);
    setSelectedTaskForEmail(null);
  };

  if (isLoading && activeTab === 'tasks') {
    return (
      <div className="d-flex justify-content-center mt-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Navigation Tabs */}
      <ul className="nav nav-tabs">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'tasks' ? 'active' : ''}`} 
            onClick={() => setActiveTab('tasks')}
          >
            <FaTasks className="icon" /> Tasks
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'email' ? 'active' : ''}`} 
            onClick={() => setActiveTab('email')}
          >
            <FaInbox className="icon" /> Email Inbox
          </button>
        </li>
        {/* WebSocket Connection Status */}
        <li className="nav-item ms-auto">
          <span className={`nav-link ${connected ? 'text-success' : 'text-danger'}`}>
            <FaWifi className="icon" /> {connected ? 'Connected' : 'Disconnected'}
          </span>
        </li>
      </ul>

      {activeTab === 'tasks' ? (
        <div>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>My Tasks</h2>
            <button 
              className="btn btn-primary" 
              onClick={() => {
                setEditingTodo(null);
                setShowForm(!showForm);
              }}
            >
              {showForm ? 'Cancel' : 'Add New Task'}
            </button>
          </div>

          {showForm && (
            <div className="mb-4">
              <TodoForm 
                onSave={handleSave} 
                todo={editingTodo} 
                onCancel={() => {
                  setShowForm(false);
                  setEditingTodo(null);
                }}
              />
            </div>
          )}

          {todos.length === 0 ? (
            <div className="alert alert-info">
              No tasks found. Add one to get started!
            </div>
          ) : (
            <div className="list-group">
              {todos.map(todo => (
                <div key={todo._id} className="list-group-item list-group-item-action todo-item d-flex justify-content-between align-items-center">
                  <div className="flex-grow-1">
                    <div className="form-check">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        checked={todo.completed} 
                        onChange={() => handleToggleComplete(todo)}
                        id={`todo-${todo._id}`}
                      />
                      <label 
                        className={`form-check-label ${todo.completed ? 'todo-completed' : ''}`}
                        htmlFor={`todo-${todo._id}`}
                      >
                        {todo.title}
                      </label>
                    </div>
                  </div>
                  <div>
                    <Link to={`/todo/${todo._id}`} className="btn btn-sm btn-info btn-action">
                      <FaEye /> View
                    </Link>
                    <button 
                      className="btn btn-sm btn-warning btn-action" 
                      onClick={() => handleEdit(todo)}
                    >
                      <FaEdit /> Edit
                    </button>
                    <button 
                      className="btn btn-sm btn-danger btn-action" 
                      onClick={() => handleDelete(todo._id)}
                    >
                      <FaTrash /> Delete
                    </button>
                    <button
                      className="btn btn-sm btn-secondary btn-action btn-email"
                      onClick={() => handleSendEmail(todo)}
                      title="Send via Email"
                    >
                      <FaEnvelope /> Email
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Модальное окно для отправки email */}
          {showEmailModal && selectedTaskForEmail && (
            <EmailModal 
              taskId={selectedTaskForEmail._id}
              taskTitle={selectedTaskForEmail.title}
              onClose={handleCloseEmailModal}
            />
          )}
        </div>
      ) : (
        <EmailInbox />
      )}
    </div>
  );
};

export default TodoList; 