const path = require('node:path');
const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

app.use(cors({ origin: [clientUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'], credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), { maxAge: '1d', immutable: true }));

app.use('/api', require('./routes/health.routes'));
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/tutorials', require('./routes/tutorial.routes'));
app.use('/api/categories', require('./routes/category.routes'));
app.use('/api/comments', require('./routes/comment.routes'));
app.use('/api/ratings', require('./routes/rating.routes'));
app.use('/api/bookmarks', require('./routes/bookmark.routes'));
app.use('/api/profile', require('./routes/profile.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/uploads', require('./routes/upload.routes'));

app.get('/', (_req, res) => {
  res.json({ message: 'Welcome to the Skilled Trade Knowledge Documentation Platform API', healthCheck: '/api/health' });
});
app.use((_req, res) => res.status(404).json({ message: 'The requested endpoint was not found.' }));
app.use(errorHandler);

module.exports = app;