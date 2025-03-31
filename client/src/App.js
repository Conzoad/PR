import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TodoList from './components/TodoList';
import TodoDetail from './components/TodoDetail';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <nav className="navbar navbar-dark bg-dark">
          <div className="container">
            <span className="navbar-brand mb-0 h1">ToDo List App</span>
          </div>
        </nav>
        <div className="container py-4">
          <Routes>
            <Route path="/" element={<TodoList />} />
            <Route path="/todo/:id" element={<TodoDetail />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App; 