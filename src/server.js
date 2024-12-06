// server.js
import express from 'express';
import cors from 'cors';
import router from './api/index.js';
import connectDB from './api/config/db.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB Atlas
connectDB()
  .then(() => console.log('Database connection established'))
  .catch(err => console.error('Error connecting to database:', err));

// Mount route handlers
app.use('/api', router);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error caught in middleware:', err);
  
  if (res.headersSent) {
    return next(err);
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.errors
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      error: 'Invalid ID format'
    });
  }

  return res.status(500).json({
    error: 'Something went wrong!',
    message: err.message
  });
});

// Default route
app.get('/', (req, res) => {
  res.send('Phoenix Automotive API');
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}`);
});

export default app;