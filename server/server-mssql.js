const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sql = require('mssql');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MSSQL Connection Pool config
const sqlConfig = {
  server: 'PRIYANSHU',
  port: 1433,
  database: 'dairy_farm',
  user: 'sa',
  password: '',
  options: {
    trustServerCertificate: true,
    encrypt: false
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

let pool;

// Connect to MSSQL
async function connectDB() {
  try {
    pool = await sql.connect(sqlConfig);
    console.log('✅ Connected to MSSQL database on PRIYANSHU');
    await initializeDatabase();
  } catch (err) {
    console.error('❌ MSSQL connection error:', err.message);
    console.log('Check: Server PRIYANSHU running, dairy_farm DB exists, sa user access');
  }
}

// Initialize database tables
async function initializeDatabase() {
  try {
    // Users table (for auth)
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'users')
      CREATE TABLE users (
        id NVARCHAR(255) PRIMARY KEY,
        email NVARCHAR(255) UNIQUE NOT NULL,
        password NVARCHAR(255) NOT NULL,
        name NVARCHAR(255) NOT NULL,
        createdAt DATETIME2 NOT NULL
      )
    `);

    // Animals table
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'animals')
      CREATE TABLE animals (
        id NVARCHAR(255) PRIMARY KEY,
        name NVARCHAR(255) NOT NULL,
        type NVARCHAR(50) NOT NULL,
        breed NVARCHAR(255) NOT NULL,
        age INT NOT NULL,
        weight DECIMAL(10,2) NOT NULL,
        status NVARCHAR(50) NOT NULL,
        dateAdded DATETIME2 NOT NULL
      )
    `);

    // Milk records
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'milk_records')
      CREATE TABLE milk_records (
        id NVARCHAR(255) PRIMARY KEY,
        animalId NVARCHAR(255) NOT NULL,
        date DATETIME2 NOT NULL,
        quantity DECIMAL(10,2) NOT NULL,
        quality NVARCHAR(50) NOT NULL,
        temperature DECIMAL(5,2) NOT NULL,
        FOREIGN KEY (animalId) REFERENCES animals(id)
      )
    `);

    // Health records
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'health_records')
      CREATE TABLE health_records (
        id NVARCHAR(255) PRIMARY KEY,
        animalId NVARCHAR(255) NOT NULL,
        date DATETIME2 NOT NULL,
        illness NVARCHAR(255) NOT NULL,
        treatment NVARCHAR(MAX) NOT NULL,
        veterinarian NVARCHAR(255) NOT NULL,
        cost DECIMAL(10,2) NOT NULL,
        status NVARCHAR(50) NOT NULL,
        FOREIGN KEY (animalId) REFERENCES animals(id)
      )
    `);

    // Feeding records
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'feeding_records')
      CREATE TABLE feeding_records (
        id NVARCHAR(255) PRIMARY KEY,
        animalId NVARCHAR(255) NOT NULL,
        date DATETIME2 NOT NULL,
        feedType NVARCHAR(255) NOT NULL,
        quantity DECIMAL(10,2) NOT NULL,
        cost DECIMAL(10,2) NOT NULL,
        notes NVARCHAR(MAX),
        FOREIGN KEY (animalId) REFERENCES animals(id)
      )
    `);

    // Create demo user if not exists
    const demoHash = require('crypto').createHash('sha256').update('demo123').digest('hex');
    await pool.request()
      .input('email', sql.NVarChar, 'demo@example.com')
      .query(`IF NOT EXISTS (SELECT 1 FROM users WHERE email = @email)
        INSERT INTO users (id, email, password, name, createdAt) 
        VALUES ('user_demo_001', @email, '${demoHash}', 'Demo User', GETDATE())`);

    console.log('✅ MSSQL Database tables initialized with demo user');
  } catch (err) {
    console.error('Table creation error:', err.message);
  }
}

// Auth middleware & utils (matching SQLite version)
const crypto = require('crypto');
const activeTokens = new Map();

function authMiddleware(req, res, next) {
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

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function generateToken(userId) {
  return crypto.randomBytes(32).toString('hex');
}

// Auth routes bypass
app.use('/api/auth', (req, res, next) => next());
app.use('/api', authMiddleware);

// ========== AUTH ENDPOINTS ==========
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name || password.length < 6) {
      return res.status(400).json({ message: 'Invalid input' });
    }
    const userId = 'user_' + Date.now();
    const hashedPassword = hashPassword(password);
    const token = generateToken(userId);
    
    await pool.request()
      .input('id', sql.NVarChar, userId)
      .input('email', sql.NVarChar, email)
      .input('password', sql.NVarChar, hashedPassword)
      .input('name', sql.NVarChar, name)
      .query('INSERT INTO users (id, email, password, name, createdAt) VALUES (@id, @email, @password, @name, GETDATE())');
    
    activeTokens.set(token, userId);
    res.json({ user: { id: userId, email, name }, token });
  } catch (err) {
    if (err.message.includes('Violation of UNIQUE KEY')) {
      res.status(400).json({ message: 'Email already registered' });
    } else {
      res.status(500).json({ message: 'Registration failed' });
    }
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = hashPassword(password);
    
    const result = await pool.request()
      .input('email', sql.NVarChar, email)
      .input('password', sql.NVarChar, hashedPassword)
      .query('SELECT * FROM users WHERE email = @email AND password = @password');
    
    if (result.recordset.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const user = result.recordset[0];
    const token = generateToken(user.id);
    activeTokens.set(token, user.id);
    
    res.json({
      user: { id: user.id, email: user.email, name: user.name },
      token
    });
  } catch (err) {
    res.status(500).json({ message: 'Login failed' });
  }
});

// ========== CRUD ENDPOINTS (same for all tables) ==========
const endpoints = [
  {
    path: 'animals',
    fields: ['id', 'name', 'type', 'breed', 'age', 'weight', 'status', 'dateAdded'],
    select: 'SELECT * FROM animals',
    insert: 'INSERT INTO animals (id, name, type, breed, age, weight, status, dateAdded) VALUES (@id, @name, @type, @breed, @age, @weight, @status, @dateAdded)',
    update: 'UPDATE animals SET name=@name, type=@type, breed=@breed, age=@age, weight=@weight, status=@status WHERE id=@id'
  },
  {
    path: 'milk_records',
    fields: ['id', 'animalId', 'date', 'quantity', 'quality', 'temperature'],
    select: 'SELECT * FROM milk_records',
    insert: 'INSERT INTO milk_records (id, animalId, date, quantity, quality, temperature) VALUES (@id, @animalId, @date, @quantity, @quality, @temperature)',
    update: 'UPDATE milk_records SET animalId=@animalId, date=@date, quantity=@quantity, quality=@quality, temperature=@temperature WHERE id=@id'
  },
  {
    path: 'health_records',
    fields: ['id', 'animalId', 'date', 'illness', 'treatment', 'veterinarian', 'cost', 'status'],
    select: 'SELECT * FROM health_records',
    insert: 'INSERT INTO health_records (id, animalId, date, illness, treatment, veterinarian, cost, status) VALUES (@id, @animalId, @date, @illness, @treatment, @veterinarian, @cost, @status)',
    update: 'UPDATE health_records SET illness=@illness, treatment=@treatment, veterinarian=@veterinarian, cost=@cost, status=@status WHERE id=@id'
  },
  {
    path: 'feeding_records',
    fields: ['id', 'animalId', 'date', 'feedType', 'quantity', 'cost', 'notes'],
    select: 'SELECT * FROM feeding_records',
    insert: 'INSERT INTO feeding_records (id, animalId, date, feedType, quantity, cost, notes) VALUES (@id, @animalId, @date, @feedType, @quantity, @cost, @notes)',
    update: 'UPDATE feeding_records SET feedType=@feedType, quantity=@quantity, cost=@cost, notes=@notes WHERE id=@id'
  }
];

endpoints.forEach(({ path, select, insert, update, fields }) => {
  // GET all
  app.get(`/api/${path}`, async (req, res) => {
    try {
      const result = await pool.request().query(select);
      res.json(result.recordset);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST new
  app.post(`/api/${path}`, async (req, res) => {
    try {
      const request = pool.request();
      fields.forEach(field => request.input(field, sql.NVarChar, req.body[field]));
      await request.query(insert);
      res.json(req.body);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // PUT update
  app.put(`/api/${path}/:id`, async (req, res) => {
    try {
      const request = pool.request().input('id', sql.NVarChar, req.params.id);
      fields.slice(1).forEach(field => request.input(field, sql.NVarChar, req.body[field]));
      await request.query(update);
      res.json({ id: req.params.id, ...req.body });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // DELETE
  app.delete(`/api/${path}/:id`, async (req, res) => {
    try {
      await pool.request().input('id', sql.NVarChar, req.params.id).query(`DELETE FROM ${path} WHERE id = @id`);
      res.json({ message: `${path.replace('_', ' ')} deleted` });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
});

// DB stats
app.get('/api/db-stats', async (req, res) => {
  try {
    const result = await pool.request().query(`
      SELECT 
        (SELECT COUNT(*) FROM animals) as animals,
        (SELECT COUNT(*) FROM milk_records) as milkRecords,
        (SELECT COUNT(*) FROM health_records) as healthRecords,
        (SELECT COUNT(*) FROM feeding_records) as feedingRecords
    `);
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health
app.get('/health', (req, res) => {
  res.json({ status: 'MSSQL Server running on PRIYANSHU', database: 'dairy_farm' });
});

// Start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 MSSQL Server running on http://localhost:${PORT}`);
  });
});
