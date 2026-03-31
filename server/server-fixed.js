const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json({strict: false}));

const activeTokens = new Map();

// Database setup first
const dbPath = path.join(__dirname, 'dairy_farm.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database error:', err);
  } else {
    console.log('✅ Connected to SQLite database');
    initializeDatabase();
  }
});

function initializeDatabase() {
  db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      createdAt TEXT NOT NULL
    )`);

    // Animals table
    db.run(`CREATE TABLE IF NOT EXISTS animals (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      breed TEXT NOT NULL,
      age INTEGER NOT NULL,
      weight REAL NOT NULL,
      status TEXT NOT NULL,
      dateAdded TEXT NOT NULL
    )`);

    // Milk records table
    db.run(`CREATE TABLE IF NOT EXISTS milk_records (
      id TEXT PRIMARY KEY,
      animalId TEXT NOT NULL,
      date TEXT NOT NULL,
      quantity REAL NOT NULL,
      quality TEXT NOT NULL,
      temperature REAL NOT NULL,
      FOREIGN KEY (animalId) REFERENCES animals(id)
    )`);

    // Health records table
    db.run(`CREATE TABLE IF NOT EXISTS health_records (
      id TEXT PRIMARY KEY,
      animalId TEXT NOT NULL,
      date TEXT NOT NULL,
      illness TEXT NOT NULL,
      treatment TEXT NOT NULL,
      veterinarian TEXT NOT NULL,
      cost REAL NOT NULL,
      status TEXT NOT NULL,
      FOREIGN KEY (animalId) REFERENCES animals(id)
    )`);

    // Feeding records table
    db.run(`CREATE TABLE IF NOT EXISTS feeding_records (
      id TEXT PRIMARY KEY,
      animalId TEXT NOT NULL,
      date TEXT NOT NULL,
      feedType TEXT NOT NULL,
      quantity REAL NOT NULL,
      cost REAL NOT NULL,
      notes TEXT,
      FOREIGN KEY (animalId) REFERENCES animals(id)
    )`);

    // Create demo user
    const demoUserId = 'user_demo_001';
    const demoEmail = 'demo@example.com';
    const demoPassword = crypto.createHash('sha256').update('demo123').digest('hex');
    const demoName = 'Demo User';

    db.get('SELECT * FROM users WHERE email = ?', [demoEmail], (err, row) => {
      if (!row) {
        db.run(
          'INSERT INTO users (id, email, password, name, createdAt) VALUES (?, ?, ?, ?, ?)',
          [demoUserId, demoEmail, demoPassword, demoName, new Date().toISOString()],
          (err) => {
            if (err) {
              console.error('Error creating demo user:', err.message);
            } else {
              console.log('✅ Demo user created');
            }
          }
        );
      }
    });

    console.log('✅ Database tables initialized');
  });
}

// Utility function to hash password
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Utility function to generate token
function generateToken(userId) {
  return crypto.randomBytes(32).toString('hex');
}

// Auth middleware
function authMiddleware(req, res, next) {
  console.log('Auth check:', req.method, req.path);
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access token required' });
  }
  
  const token = authHeader.substring(7);
  if (!activeTokens.has(token)) {
    return res.status(401).json({ message: 'Invalid token' });
  }
  
  req.userId = activeTokens.get(token);
  next();
}

// ROUTES - auth endpoints BEFORE general middleware
app.post('/api/auth/register', (req, res) => {
  console.log('Register hit');
  const { email, password, name } = req.body;

  // Validation
  if (!email || !password || !name) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  const userId = 'user_' + Date.now();
  const hashedPassword = hashPassword(password);
  const token = generateToken(userId);

  db.run(
    'INSERT INTO users (id, email, password, name, createdAt) VALUES (?, ?, ?, ?, ?)',
    [userId, email, hashedPassword, name, new Date().toISOString()],
    (err) => {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ message: 'Email already registered' });
        }
        return res.status(500).json({ message: 'Registration failed' });
      }

      // Store token for register
      activeTokens.set(token, userId);
      
      res.json({
        user: { id: userId, email, name },
        token
      });
    }
  );
});

app.post('/api/auth/login', (req, res) => {
  console.log('Login hit:', req.body.email);
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' });
  }

  const hashedPassword = hashPassword(password);

  db.get(
    'SELECT * FROM users WHERE email = ? AND password = ?',
    [email, hashedPassword],
    (err, user) => {
      if (err) {
        return res.status(500).json({ message: 'Login failed' });
      }

      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const token = generateToken(user.id);

      // Store token
      activeTokens.set(token, user.id);
      
      res.json({
        user: { id: user.id, email: user.email, name: user.name },
        token
      });
    }
  );
});

// NOW general /api protection (after auth endpoints)
app.use('/api', authMiddleware);

// ========== ANIMAL ENDPOINTS ==========
app.get('/api/animals', authMiddleware, (req, res) => {
  db.all('SELECT * FROM animals', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows || []);
    }
  });
});

app.post('/api/animals', (req, res) => {
  const { id, name, type, breed, age, weight, status, dateAdded } = req.body;
  db.run(
    'INSERT INTO animals (id, name, type, breed, age, weight, status, dateAdded) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [id, name, type, breed, age, weight, status, dateAdded],
    (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ id, name, type, breed, age, weight, status, dateAdded });
      }
    }
  );
});

app.put('/api/animals/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const { name, type, breed, age, weight, status, dateAdded } = req.body;
  db.run(
    'UPDATE animals SET name = ?, type = ?, breed = ?, age = ?, weight = ?, status = ?, dateAdded = ? WHERE id = ?',
    [name, type, breed, age, weight, status, dateAdded, id],
    (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ id, name, type, breed, age, weight, status, dateAdded });
      }
    }
  );
});

app.delete('/api/animals/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM animals WHERE id = ?', [id], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: 'Animal deleted' });
    }
  });
});

// ========== MILK RECORDS ENDPOINTS ==========
app.get('/api/milk-records', authMiddleware, (req, res) => {
  db.all('SELECT * FROM milk_records', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows || []);
    }
  });
});

app.post('/api/milk-records', authMiddleware, (req, res) => {
  const { id, animalId, date, quantity, quality, temperature } = req.body;
  db.run(
    'INSERT INTO milk_records (id, animalId, date, quantity, quality, temperature) VALUES (?, ?, ?, ?, ?, ?)',
    [id, animalId, date, quantity, quality, temperature],
    (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ id, animalId, date, quantity, quality, temperature });
      }
    }
  );
});

app.put('/api/milk-records/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const { animalId, date, quantity, quality, temperature } = req.body;
  db.run(
    'UPDATE milk_records SET animalId = ?, date = ?, quantity = ?, quality = ?, temperature = ? WHERE id = ?',
    [animalId, date, quantity, quality, temperature, id],
    (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ id, animalId, date, quantity, quality, temperature });
      }
    }
  );
});

app.delete('/api/milk-records/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM milk_records WHERE id = ?', [id], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: 'Milk record deleted' });
    }
  });
});

// ========== HEALTH RECORDS ENDPOINTS ==========
app.get('/api/health-records', authMiddleware, (req, res) => {
  db.all('SELECT * FROM health_records', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows || []);
    }
  });
});

app.post('/api/health-records', authMiddleware, (req, res) => {
  const { id, animalId, date, illness, treatment, veterinarian, cost, status } = req.body;
  db.run(
    'INSERT INTO health_records (id, animalId, date, illness, treatment, veterinarian, cost, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [id, animalId, date, illness, treatment, veterinarian, cost, status],
    (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ id, animalId, date, illness, treatment, veterinarian, cost, status });
      }
    }
  );
});

app.put('/api/health-records/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const { animalId, date, illness, treatment, veterinarian, cost, status } = req.body;
  db.run(
    'UPDATE health_records SET animalId = ?, date = ?, illness = ?, treatment = ?, veterinarian = ?, cost = ?, status = ? WHERE id = ?',
    [animalId, date, illness, treatment, veterinarian, cost, status, id],
    (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ id, animalId, date, illness, treatment, veterinarian, cost, status });
      }
    }
  );
});

app.delete('/api/health-records/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM health_records WHERE id = ?', [id], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: 'Health record deleted' });
    }
  });
});

// ========== FEEDING RECORDS ENDPOINTS ==========
app.get('/api/feeding-records', authMiddleware, (req, res) => {
  db.all('SELECT * FROM feeding_records', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows || []);
    }
  });
});

app.post('/api/feeding-records', authMiddleware, (req, res) => {
  const { id, animalId, date, feedType, quantity, cost, notes } = req.body;
  db.run(
    'INSERT INTO feeding_records (id, animalId, date, feedType, quantity, cost, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, animalId, date, feedType, quantity, cost, notes],
    (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ id, animalId, date, feedType, quantity, cost, notes });
      }
    }
  );
});

app.put('/api/feeding-records/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const { animalId, date, feedType, quantity, cost, notes } = req.body;
  db.run(
    'UPDATE feeding_records SET animalId = ?, date = ?, feedType = ?, quantity = ?, cost = ?, notes = ? WHERE id = ?',
    [animalId, date, feedType, quantity, cost, notes, id],
    (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ id, animalId, date, feedType, quantity, cost, notes });
      }
    }
  );
});

app.delete('/api/feeding-records/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM feeding_records WHERE id = ?', [id], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: 'Feeding record deleted' });
    }
  });
});

// Other endpoints
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});