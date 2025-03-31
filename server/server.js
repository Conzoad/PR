const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const emailService = require('./emailService');
const http = require('http');
const { Server } = require('socket.io');
const routes = require('./routes'); // Импортируем маршрутизатор из routes.js

// Load environment variables
dotenv.config();

const app = express();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO with improved configuration
const io = new Server(server, {
  cors: {
    origin: '*', // В продакшене лучше указать конкретный домен
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 30000,
  pingInterval: 25000
});

// Socket.IO connection handling with better logging
io.on('connection', (socket) => {
  console.log('New client connected', socket.id);
  
  // Broadcast to the client that they have connected successfully
  socket.emit('connected', { message: 'You are connected to the WebSocket server' });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected', socket.id);
  });
  
  // Handle any errors that occur during the connection
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Make io accessible to our router
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://mongodb:27017/todos';
console.log('Connecting to MongoDB at:', MONGODB_URI);

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Use API routes
app.use('/api', routes);

// Replace app.listen with server.listen
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 