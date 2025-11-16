const express = require('express');
const router = express.Router();
const dbo = require('../db/conn');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');

const JWT_SECRET = 'your_jwt_secret'; // In a real app, this should be in an environment variable

router.post('/signup', async (req, res) => {
  const db = dbo.getDb();
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const existingUser = await db.collection('users').findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await db.collection('users').insertOne({ email, password: hashedPassword });

  res.status(201).json({ message: 'User created successfully' });
});

router.post('/signin', async (req, res) => {
    const db = dbo.getDb();
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await db.collection('users').findOne({ email });
    if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });
});

router.get('/me', auth, (req, res) => {
    // req.user is attached by the auth middleware
    const { password, ...user } = req.user;
    res.send(user);
});

module.exports = router;
