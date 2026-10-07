const express = require('express');
const path = require('node:path');
const { requireAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();
router.post('/', requireAuth, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Choose an image to upload.' });
  return res.status(201).json({ imageUrl: `/uploads/${path.basename(req.file.filename)}` });
});

module.exports = router;