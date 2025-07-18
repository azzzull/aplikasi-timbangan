const express = require('express');
const cors = require('cors');
const path = require('path');
const Database = require('./database');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// SQLite Database Connection
const dbPath = process.env.DATABASE_PATH || './database/timbangan.db';
const db = new Database(dbPath);

// Serve static files
app.use(express.static(__dirname));

// Routes
app.get('/api/weights', async (req, res) => {
    try {
        const weights = await db.getAllWeights();
        res.json(weights);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/weights', async (req, res) => {
    try {
        const savedWeight = await db.saveWeight(req.body);
        res.json(savedWeight);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Basic route untuk testing
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!' });
});

const port = process.env.PORT || 5050;
app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
