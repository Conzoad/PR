const express = require('express');
const Todo = require('./models/Todo');
const emailService = require('./emailService');
const router = express.Router();

// Get all todos
router.get('/todos', async (req, res) => {
  try {
    const todos = await Todo.find().sort({ createdAt: -1 });
    res.json(todos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get todo by id
router.get('/todos/:id', async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) return res.status(404).json({ message: 'Todo not found' });
    res.json(todo);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create todo
router.post('/todos', async (req, res) => {
  try {
    console.log('Creating new todo with data:', JSON.stringify(req.body));
    
    // Проверяем, что title существует и не пустой
    if (!req.body.title || req.body.title.trim() === '') {
      console.log('Title is missing or empty in request');
      return res.status(400).json({ message: 'Title is required' });
    }
    
    const todo = new Todo({
      title: req.body.title,
      description: req.body.description || '',
      completed: req.body.completed || false
    });
    
    console.log('Created new Todo object:', JSON.stringify(todo));
    const newTodo = await todo.save();
    console.log('Saved Todo successfully:', JSON.stringify(newTodo));
    
    // Emit event to all clients
    req.io.emit('todoCreated', newTodo);
    console.log('WebSocket event todoCreated emitted');
    
    res.status(201).json(newTodo);
  } catch (err) {
    console.error('Error creating todo:', err);
    res.status(400).json({ message: err.message });
  }
});

// Update todo
router.put('/todos/:id', async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) return res.status(404).json({ message: 'Todo not found' });

    if (req.body.title) todo.title = req.body.title;
    if (req.body.description) todo.description = req.body.description;
    if (req.body.completed !== undefined) todo.completed = req.body.completed;

    const updatedTodo = await todo.save();
    
    // Emit event to all clients
    req.io.emit('todoUpdated', updatedTodo);
    console.log('WebSocket event todoUpdated emitted for id:', req.params.id);
    
    res.json(updatedTodo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete todo
router.delete('/todos/:id', async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) return res.status(404).json({ message: 'Todo not found' });

    await todo.deleteOne();
    
    // Emit event to all clients
    req.io.emit('todoDeleted', { id: req.params.id });
    console.log('WebSocket event todoDeleted emitted for id:', req.params.id);
    
    res.json({ message: 'Todo deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Email routes
// Отправка задачи по email (SMTP)
router.post('/email/send-task', async (req, res) => {
  try {
    const { taskId, emailTo } = req.body;
    
    if (!taskId || !emailTo) {
      return res.status(400).json({ message: 'Task ID and recipient email are required' });
    }
    
    const task = await Todo.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    const result = await emailService.sendTaskViaEmail(emailTo, task);
    
    if (result.success) {
      res.json({ message: 'Email sent successfully', messageId: result.messageId });
    } else {
      res.status(500).json({ message: 'Failed to send email', error: result.error });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Отправка произвольного письма (SMTP)
router.post('/email/send', async (req, res) => {
  try {
    const { to, subject, text, html } = req.body;
    
    if (!to || !subject) {
      return res.status(400).json({ message: 'Recipient email and subject are required' });
    }
    
    const result = await emailService.sendEmail(to, subject, text || '', html || '');
    
    if (result.success) {
      res.json({ message: 'Email sent successfully', messageId: result.messageId });
    } else {
      res.status(500).json({ message: 'Failed to send email', error: result.error });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Получение писем через IMAP
router.get('/email/imap', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const emails = await emailService.getEmailsIMAP(limit);
    res.json(emails);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch emails via IMAP', error: err.message });
  }
});

// Получение писем через POP3
router.get('/email/pop3', async (req, res) => {
  try {
    const emails = await emailService.getEmailsPOP3();
    res.json(emails);
  } catch (error) {
    console.error('Error retrieving emails via POP3:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 