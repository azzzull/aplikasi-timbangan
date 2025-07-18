const express = require('express');
const path = require('path');
const Database = require('./database');

// Minimal config untuk IoT
const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.static(__dirname));

// Database - bisa switch ke in-memory untuk testing
const dbPath = process.env.NODE_ENV === 'development' ? ':memory:' : './database/timbangan.db';
const db = new Database(dbPath);

// Routes
app.get('/api/weights', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        
        // Validate pagination parameters
        if (page < 1 || limit < 1 || limit > 100) {
            return res.status(400).json({ error: 'Invalid pagination parameters' });
        }
        
        const result = await db.getAllWeights(page, limit);
        res.json(result);
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
