const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const emailService = require('./emailService');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://mongodb:27017/todos';
console.log('Connecting to MongoDB at:', MONGODB_URI);

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Define Todo schema
const todoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const Todo = mongoose.model('Todo', todoSchema);

// API routes
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

// Get todo by ID
router.get('/todos/:id', async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) return res.status(404).json({ message: 'Todo not found' });
    res.json(todo);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create new todo
router.post('/todos', async (req, res) => {
  try {
    console.log('Creating new todo with data:', JSON.stringify(req.body));
    
    // Проверяем, что title существует и не пустой
    if (!req.body.title || req.body.title.trim() === '') {
      console.log('Title is missing or empty in request');
      return res.status(400).json({ message: 'Title is required' });
    }
    
    const newTodo = new Todo({
      title: req.body.title,
      description: req.body.description || '',
      completed: req.body.completed || false
    });
    
    console.log('Created new Todo object:', JSON.stringify(newTodo));
    const savedTodo = await newTodo.save();
    console.log('Saved Todo successfully:', JSON.stringify(savedTodo));
    res.status(201).json(savedTodo);
  } catch (err) {
    console.error('Error creating todo:', err);
    res.status(400).json({ message: err.message });
  }
});

// Update todo
router.put('/todos/:id', async (req, res) => {
  try {
    const updatedTodo = await Todo.findByIdAndUpdate(
      req.params.id, 
      req.body,
      { new: true }
    );
    
    if (!updatedTodo) return res.status(404).json({ message: 'Todo not found' });
    res.json(updatedTodo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete todo
router.delete('/todos/:id', async (req, res) => {
  try {
    const todo = await Todo.findByIdAndDelete(req.params.id);
    if (!todo) return res.status(404).json({ message: 'Todo not found' });
    res.json({ message: 'Todo deleted successfully' });
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

// Use API routes
app.use('/api', router);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 