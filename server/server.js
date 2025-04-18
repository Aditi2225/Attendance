const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const authRoutes = require('./auth');
const db = require('./db');


const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static files from the ../public directory
app.use(express.static(path.join(__dirname, '..', 'public')));

// API routes
app.use('/api', authRoutes);

// Serve index.html on root and fallback
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
