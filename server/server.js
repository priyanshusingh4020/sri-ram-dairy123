const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json({strict: false})); // Lenient JSON parsing for Windows curl

  // Simple in-memory token store (for demo)
  const activeTokens = new Map();

  // Skip auth for /api/auth
app.use('/api/auth', (req, res, next) => {
  next();
});
  



// Auth middleware
function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access token required' });
  }
  
  const token = authHeader.substring(7);
  if (!activeTokens.has(token)) {
    return res.status(401).json({ message: 'Invalid token' });
  }
  
  // Token valid, add userId to req for potential use
  req.userId = activeTokens.get(token);
  next();
}

// Database setup
const dbPath = path.join(__dirname, 'dairy_farm.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database error:', err);
  } else {
    console.log('✅ Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize database tables
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

// ========== AUTH ENDPOINTS ==========
app.post('/api/auth/register', (req, res) => {
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

app.put('/api/animals/:id', (req, res) => {
  const { name, type, breed, age, weight, status } = req.body;
  db.run(
    'UPDATE animals SET name=?, type=?, breed=?, age=?, weight=?, status=? WHERE id=?',
    [name, type, breed, age, weight, status, req.params.id],
    (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ id: req.params.id, name, type, breed, age, weight, status });
      }
    }
  );
});

app.delete('/api/animals/:id', (req, res) => {
  db.run('DELETE FROM animals WHERE id=?', [req.params.id], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: 'Animal deleted' });
    }
  });
});

// ========== MILK RECORDS ENDPOINTS ==========
app.get('/api/milk-records', (req, res) => {
  db.all('SELECT * FROM milk_records', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows || []);
    }
  });
});

app.post('/api/milk-records', (req, res) => {
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

app.put('/api/milk-records/:id', (req, res) => {
  const { quantity, quality, temperature } = req.body;
  db.run(
    'UPDATE milk_records SET quantity=?, quality=?, temperature=? WHERE id=?',
    [quantity, quality, temperature, req.params.id],
    (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ id: req.params.id, quantity, quality, temperature });
      }
    }
  );
});

app.delete('/api/milk-records/:id', (req, res) => {
  db.run('DELETE FROM milk_records WHERE id=?', [req.params.id], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: 'Milk record deleted' });
    }
  });
});

// ========== HEALTH RECORDS ENDPOINTS ==========
app.get('/api/health-records', (req, res) => {
  db.all('SELECT * FROM health_records', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows || []);
    }
  });
});

app.post('/api/health-records', (req, res) => {
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

app.put('/api/health-records/:id', (req, res) => {
  const { illness, treatment, veterinarian, cost, status } = req.body;
  db.run(
    'UPDATE health_records SET illness=?, treatment=?, veterinarian=?, cost=?, status=? WHERE id=?',
    [illness, treatment, veterinarian, cost, status, req.params.id],
    (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ id: req.params.id, illness, treatment, veterinarian, cost, status });
      }
    }
  );
});

app.delete('/api/health-records/:id', (req, res) => {
  db.run('DELETE FROM health_records WHERE id=?', [req.params.id], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: 'Health record deleted' });
    }
  });
});

// ========== FEEDING RECORDS ENDPOINTS ==========
app.get('/api/feeding-records', (req, res) => {
  db.all('SELECT * FROM feeding_records', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows || []);
    }
  });
});

app.post('/api/feeding-records', (req, res) => {
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

app.put('/api/feeding-records/:id', (req, res) => {
  const { feedType, quantity, cost, notes } = req.body;
  db.run(
    'UPDATE feeding_records SET feedType=?, quantity=?, cost=?, notes=? WHERE id=?',
    [feedType, quantity, cost, notes, req.params.id],
    (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ id: req.params.id, feedType, quantity, cost, notes });
      }
    }
  );
});

app.delete('/api/feeding-records/:id', (req, res) => {
  db.run('DELETE FROM feeding_records WHERE id=?', [req.params.id], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: 'Feeding record deleted' });
    }
  });
});

// ========== DATABASE MANAGEMENT ENDPOINTS ==========
app.get('/api/db-stats', (req, res) => {
  db.serialize(() => {
    let stats = {
      animals: 0,
      milkRecords: 0,
      healthRecords: 0,
      feedingRecords: 0
    };

    db.get('SELECT COUNT(*) as count FROM animals', (err, row) => {
      if (!err) stats.animals = row.count;
    });

    db.get('SELECT COUNT(*) as count FROM milk_records', (err, row) => {
      if (!err) stats.milkRecords = row.count;
    });

    db.get('SELECT COUNT(*) as count FROM health_records', (err, row) => {
      if (!err) stats.healthRecords = row.count;
    });

    db.get('SELECT COUNT(*) as count FROM feeding_records', (err, row) => {
      if (!err) stats.feedingRecords = row.count;
    });

    setTimeout(() => {
      res.json(stats);
    }, 100);
  });
});

app.get('/api/export-data', (req, res) => {
  const exportData = {};

  db.all('SELECT * FROM animals', (err, animals) => {
    if (!err) exportData.animals = animals;

    db.all('SELECT * FROM milk_records', (err, milkRecords) => {
      if (!err) exportData.milk_records = milkRecords;

      db.all('SELECT * FROM health_records', (err, healthRecords) => {
        if (!err) exportData.health_records = healthRecords;

        db.all('SELECT * FROM feeding_records', (err, feedingRecords) => {
          if (!err) exportData.feeding_records = feedingRecords;

          res.json({
            exportDate: new Date().toISOString(),
            data: exportData
          });
        });
      });
    });
  });
});

app.get('/api/backup-db', (req, res) => {
  const fs = require('fs');
  const path = require('path');
  const srcPath = path.join(__dirname, 'dairy_farm.db');
  const backupPath = path.join(__dirname, `backups/dairy_farm_backup_${new Date().getTime()}.db`);

  // Create backups directory if it doesn't exist
  const backupDir = path.join(__dirname, 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir);
  }

  fs.copyFile(srcPath, backupPath, (err) => {
    if (err) {
      res.status(500).json({ error: 'Backup failed: ' + err.message });
    } else {
      res.json({ message: 'Database backed up successfully', backupPath });
    }
  });
});

app.post('/api/clear-all-data', (req, res) => {
  db.serialize(() => {
    db.run('DELETE FROM feeding_records');
    db.run('DELETE FROM health_records');
    db.run('DELETE FROM milk_records');
    db.run('DELETE FROM animals', (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ message: 'All data cleared successfully' });
      }
    });
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
