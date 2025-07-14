const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/balanced-app';
async function connectDB() {
    try {
        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB database connection established successfully');
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        process.exit(1);
    }
}
connectDB();

// Model
const weightSchema = new mongoose.Schema({
    scaleId: String,
    itemCode: String,
    itemName: String,
    weight: Number,
    location: String,
    date: String,
    time: String
});
const Weight = mongoose.model('Weight', weightSchema);

// Routes
app.get('/api/weights', async (req, res) => {
    try {
        const weights = await Weight.find();
        res.json(weights);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.post('/api/weights', async (req, res) => {
    try {
        const newWeight = new Weight(req.body);
        const savedWeight = await newWeight.save();
        res.json(savedWeight);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete data timbangan berdasarkan scaleId
app.delete('/api/weights/:scaleId', async (req, res) => {
    try {
        const result = await Weight.findOneAndDelete({ scaleId: req.params.scaleId });
        if (!result) {
            return res.status(404).json({ error: 'Data tidak ditemukan' });
        }
        res.json({ message: 'Data berhasil dihapus' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Update nama barang berdasarkan scaleId
app.patch('/api/weights/:scaleId', async (req, res) => {
    try {
        const { itemName } = req.body;
        if (!itemName) {
            return res.status(400).json({ error: 'Nama barang tidak boleh kosong' });
        }
        const updatedWeight = await Weight.findOneAndUpdate(
            { scaleId: req.params.scaleId }, 
            { itemName }, 
            { new: true }
        );
        if (!updatedWeight) {
            return res.status(404).json({ error: 'Data tidak ditemukan' });
        }
        res.json(updatedWeight);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Basic route untuk testing
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Balanced App API' });
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
