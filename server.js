const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const skillRoutes = require('./routes/skills');
const requestRoutes = require('./routes/requests');
const ratingRoutes = require('./routes/ratings');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/ratings', ratingRoutes);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const MONGODB_URI = YOUR_MONGODB_URL
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB Atlas');
    const PORT = process.env.PORT || 3002;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Visit http://localhost:${PORT} to view the application`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});
