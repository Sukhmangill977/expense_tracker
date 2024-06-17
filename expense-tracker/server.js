// server.js

require('dotenv').config(); // Load environment variables

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Expense = require('./models/Expense');

const app = express();
const port = process.env.PORT || 3001; // Use the PORT from .env or default to 3000

// Use the JWT secret from environment variables
const jwtSecret = process.env.JWT_SECRET;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// MongoDB connection
const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// User registration
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new User({ username, password: hashedPassword });
        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// User login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: '1h' });
        res.json({ token });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Middleware to protect routes
function auth(req, res, next) {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, jwtSecret);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
}

// Add a new expense (protected)
app.post('/expenses', auth, async (req, res) => {
    const { name, amount, date } = req.body;
    const newExpense = new Expense({ name, amount, date, user: req.user.id });
    try {
        const savedExpense = await newExpense.save();
        res.status(201).json(savedExpense);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Get all expenses (protected)
app.get('/expenses', auth, async (req, res) => {
    try {
        const expenses = await Expense.find({ user: req.user.id });
        res.json(expenses);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get a single expense by ID (protected)
app.get('/expenses/:id', auth, async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id);
        if (!expense || expense.user.toString() !== req.user.id) {
            return res.status(404).json({ message: 'Expense not found' });
        }
        res.json(expense);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update an expense (protected)
app.put('/expenses/:id', auth, async (req, res) => {
    try {
        const { name, amount, date } = req.body;
        const expense = await Expense.findById(req.params.id);

        if (!expense || expense.user.toString() !== req.user.id) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        if (name) {
            expense.name = name;
        }
        if (amount) {
            expense.amount = amount;
        }
        if (date) {
            expense.date = date;
        }

        const updatedExpense = await expense.save();
        res.json(updatedExpense);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete an expense (protected)
app.delete('/expenses/:id', auth, async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id);

        if (!expense || expense.user.toString() !== req.user.id) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        await expense.remove();
        res.json({ message: 'Expense deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on localhost:${port}`);
});
