import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getAsync, runAsync, allAsync } from '../db.js';
import { emitStudentRegistered } from '../socket.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, secretCode } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!['student', 'mentor'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Validate secret code for mentor registration
    if (role === 'mentor') {
      if (!secretCode) {
        return res.status(400).json({ error: 'Secret code is required for mentor registration' });
      }
      
      if (secretCode !== process.env.MENTOR_SECRET_CODE) {
        return res.status(400).json({ error: 'Invalid secret code' });
      }
    }

    const existingUser = await getAsync('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await runAsync(
      'INSERT INTO users (name, email, passwordHash, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role]
    );

    const newUser = { id: result.id, name, email, role };

    // Emit real-time event to all mentors when a new student registers
    if (role === 'student') {
      emitStudentRegistered(newUser);
    }

    const token = jwt.sign(
      { id: result.id, email, role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: newUser
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await getAsync('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

export default router;
