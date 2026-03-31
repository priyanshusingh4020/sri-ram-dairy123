const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MySQL Connection Pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'dairy_farm',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test database connection
pool.getConnection()
  .then(() => {
    console.log('✅ Connected to MySQL database');
    initializeDatabase();
  })
  .catch((err) => {
    console.error('❌ Database connection error:', err.message);
    console.log('\nPlease ensure:');
    console.log('  1. MySQL is running');
    console.log('  2. Database "dairy_farm" exists');
    console.log('  3. Username is "root" with no password');
  });

// Initialize database tables
async function initializeDatabase() {
  const conn = await pool.getConnection();
  try {
    // Animals table
    await conn.query(`CREATE TABLE IF NOT EXISTS animals (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      type VARCHAR(50) NOT NULL,
      breed VARCHAR(255) NOT NULL,
      age INTEGER NOT NULL,
      weight DECIMAL(10, 2) NOT NULL,
      status VARCHAR(50) NOT NULL,
      dateAdded TEXT NOT NULL
    )`);

    // Milk records table
    await conn.query(`CREATE TABLE IF NOT EXISTS milk_records (
      id VARCHAR(255) PRIMARY KEY,
      animalId VARCHAR(255) NOT NULL,
      date TEXT NOT NULL,
      quantity DECIMAL(10, 2) NOT NULL,
      quality VARCHAR(50) NOT NULL,
      temperature DECIMAL(5, 2) NOT NULL,
      FOREIGN KEY (animalId) REFERENCES animals(id)
    )`);

    // Health records table
    await conn.query(`CREATE TABLE IF NOT EXISTS health_records (
      id VARCHAR(255) PRIMARY KEY,
      animalId VARCHAR(255) NOT NULL,
      date TEXT NOT NULL,
      illness VARCHAR(255) NOT NULL,
      treatment TEXT NOT NULL,
      veterinarian VARCHAR(255) NOT NULL,
      cost DECIMAL(10, 2) NOT NULL,
      status VARCHAR(50) NOT NULL,
      FOREIGN KEY (animalId) REFERENCES animals(id)
    )`);

    // Feeding records table
    await conn.query(`CREATE TABLE IF NOT EXISTS feeding_records (
      id VARCHAR(255) PRIMARY KEY,
      animalId VARCHAR(255) NOT NULL,
      date TEXT NOT NULL,
      feedType VARCHAR(255) NOT NULL,
      quantity DECIMAL(10, 2) NOT NULL,
      cost DECIMAL(10, 2) NOT NULL,
      notes TEXT,
      FOREIGN KEY (animalId) REFERENCES animals(id)
    )`);

    console.log('✅ Database tables initialized');
  } catch (err) {
    console.error('Error initializing tables:', err.message);
  } finally {
    conn.release();
  }
}

// ========== ANIMAL ENDPOINTS ==========
app.get('/api/animals', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM animals');
    res.json(rows || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/animals', async (req, res) => {
  try {
    const { id, name, type, breed, age, weight, status, dateAdded } = req.body;
    await pool.query(
      'INSERT INTO animals (id, name, type, breed, age, weight, status, dateAdded) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, name, type, breed, age, weight, status, dateAdded]
    );
    res.json({ id, name, type, breed, age, weight, status, dateAdded });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/animals/:id', async (req, res) => {
  try {
    const { name, type, breed, age, weight, status } = req.body;
    await pool.query(
      'UPDATE animals SET name=?, type=?, breed=?, age=?, weight=?, status=? WHERE id=?',
      [name, type, breed, age, weight, status, req.params.id]
    );
    res.json({ id: req.params.id, name, type, breed, age, weight, status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/animals/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM animals WHERE id=?', [req.params.id]);
    res.json({ message: 'Animal deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== MILK RECORDS ENDPOINTS ==========
app.get('/api/milk-records', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM milk_records');
    res.json(rows || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/milk-records', async (req, res) => {
  try {
    const { id, animalId, date, quantity, quality, temperature } = req.body;
    await pool.query(
      'INSERT INTO milk_records (id, animalId, date, quantity, quality, temperature) VALUES (?, ?, ?, ?, ?, ?)',
      [id, animalId, date, quantity, quality, temperature]
    );
    res.json({ id, animalId, date, quantity, quality, temperature });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/milk-records/:id', async (req, res) => {
  try {
    const { quantity, quality, temperature } = req.body;
    await pool.query(
      'UPDATE milk_records SET quantity=?, quality=?, temperature=? WHERE id=?',
      [quantity, quality, temperature, req.params.id]
    );
    res.json({ id: req.params.id, quantity, quality, temperature });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/milk-records/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM milk_records WHERE id=?', [req.params.id]);
    res.json({ message: 'Milk record deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== HEALTH RECORDS ENDPOINTS ==========
app.get('/api/health-records', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM health_records');
    res.json(rows || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/health-records', async (req, res) => {
  try {
    const { id, animalId, date, illness, treatment, veterinarian, cost, status } = req.body;
    await pool.query(
      'INSERT INTO health_records (id, animalId, date, illness, treatment, veterinarian, cost, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, animalId, date, illness, treatment, veterinarian, cost, status]
    );
    res.json({ id, animalId, date, illness, treatment, veterinarian, cost, status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/health-records/:id', async (req, res) => {
  try {
    const { illness, treatment, veterinarian, cost, status } = req.body;
    await pool.query(
      'UPDATE health_records SET illness=?, treatment=?, veterinarian=?, cost=?, status=? WHERE id=?',
      [illness, treatment, veterinarian, cost, status, req.params.id]
    );
    res.json({ id: req.params.id, illness, treatment, veterinarian, cost, status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/health-records/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM health_records WHERE id=?', [req.params.id]);
    res.json({ message: 'Health record deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== FEEDING RECORDS ENDPOINTS ==========
app.get('/api/feeding-records', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM feeding_records');
    res.json(rows || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/feeding-records', async (req, res) => {
  try {
    const { id, animalId, date, feedType, quantity, cost, notes } = req.body;
    await pool.query(
      'INSERT INTO feeding_records (id, animalId, date, feedType, quantity, cost, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, animalId, date, feedType, quantity, cost, notes]
    );
    res.json({ id, animalId, date, feedType, quantity, cost, notes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/feeding-records/:id', async (req, res) => {
  try {
    const { feedType, quantity, cost, notes } = req.body;
    await pool.query(
      'UPDATE feeding_records SET feedType=?, quantity=?, cost=?, notes=? WHERE id=?',
      [feedType, quantity, cost, notes, req.params.id]
    );
    res.json({ id: req.params.id, feedType, quantity, cost, notes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/feeding-records/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM feeding_records WHERE id=?', [req.params.id]);
    res.json({ message: 'Feeding record deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== DATABASE MANAGEMENT ENDPOINTS ==========
app.get('/api/db-stats', async (req, res) => {
  try {
    const [[{ animals }]] = await pool.query('SELECT COUNT(*) as animals FROM animals');
    const [[{ milkRecords }]] = await pool.query('SELECT COUNT(*) as milkRecords FROM milk_records');
    const [[{ healthRecords }]] = await pool.query('SELECT COUNT(*) as healthRecords FROM health_records');
    const [[{ feedingRecords }]] = await pool.query('SELECT COUNT(*) as feedingRecords FROM feeding_records');

    res.json({
      animals: animals || 0,
      milkRecords: milkRecords || 0,
      healthRecords: healthRecords || 0,
      feedingRecords: feedingRecords || 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/export-data', async (req, res) => {
  try {
    const [animals] = await pool.query('SELECT * FROM animals');
    const [milkRecords] = await pool.query('SELECT * FROM milk_records');
    const [healthRecords] = await pool.query('SELECT * FROM health_records');
    const [feedingRecords] = await pool.query('SELECT * FROM feeding_records');

    res.json({
      exportDate: new Date().toISOString(),
      data: {
        animals,
        milk_records: milkRecords,
        health_records: healthRecords,
        feeding_records: feedingRecords
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/backup-db', async (req, res) => {
  try {
    // For MySQL, create a backup record/dump
    const [animals] = await pool.query('SELECT * FROM animals');
    const [milkRecords] = await pool.query('SELECT * FROM milk_records');
    const [healthRecords] = await pool.query('SELECT * FROM health_records');
    const [feedingRecords] = await pool.query('SELECT * FROM feeding_records');

    const backupData = {
      timestamp: new Date().toISOString(),
      animals,
      milk_records: milkRecords,
      health_records: healthRecords,
      feeding_records: feedingRecords
    };

    // Save to file (optional)
    const fs = require('fs');
    const path = require('path');
    const backupDir = path.join(__dirname, 'backups');
    
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir);
    }

    const backupFile = path.join(backupDir, `dairy_farm_backup_${new Date().getTime()}.json`);
    fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));

    res.json({ 
      message: 'Database backed up successfully',
      backupFile: backupFile,
      backupSize: backupData
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/clear-all-data', async (req, res) => {
  try {
    // Drop foreign key constraints first
    await pool.query('SET FOREIGN_KEY_CHECKS = 0');
    
    await pool.query('TRUNCATE TABLE feeding_records');
    await pool.query('TRUNCATE TABLE health_records');
    await pool.query('TRUNCATE TABLE milk_records');
    await pool.query('TRUNCATE TABLE animals');
    
    await pool.query('SET FOREIGN_KEY_CHECKS = 1');
    
    res.json({ message: 'All data cleared successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running', database: 'MySQL' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
