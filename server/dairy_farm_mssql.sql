-- Sri Ram Dairy Farm MSSQL Database Setup
-- Run on server PRIYANSHU with sa user

USE [dairy_farm];
GO

-- Create tables if not exist
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'users')
CREATE TABLE users (
  id NVARCHAR(255) PRIMARY KEY,
  email NVARCHAR(255) UNIQUE NOT NULL,
  password NVARCHAR(255) NOT NULL,
  name NVARCHAR(255) NOT NULL,
  createdAt DATETIME2 NOT NULL
);
GO

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
);
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'milk_records')
CREATE TABLE milk_records (
  id NVARCHAR(255) PRIMARY KEY,
  animalId NVARCHAR(255) NOT NULL,
  [date] DATETIME2 NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  quality NVARCHAR(50) NOT NULL,
  temperature DECIMAL(5,2) NOT NULL,
  FOREIGN KEY (animalId) REFERENCES animals(id)
);
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'health_records')
CREATE TABLE health_records (
  id NVARCHAR(255) PRIMARY KEY,
  animalId NVARCHAR(255) NOT NULL,
  [date] DATETIME2 NOT NULL,
  illness NVARCHAR(255) NOT NULL,
  treatment NVARCHAR(MAX) NOT NULL,
  veterinarian NVARCHAR(255) NOT NULL,
  cost DECIMAL(10,2) NOT NULL,
  status NVARCHAR(50) NOT NULL,
  FOREIGN KEY (animalId) REFERENCES animals(id)
);
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'feeding_records')
CREATE TABLE feeding_records (
  id NVARCHAR(255) PRIMARY KEY,
  animalId NVARCHAR(255) NOT NULL,
  [date] DATETIME2 NOT NULL,
  feedType NVARCHAR(255) NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  cost DECIMAL(10,2) NOT NULL,
  notes NVARCHAR(MAX),
  FOREIGN KEY (animalId) REFERENCES animals(id)
);
GO

-- Sample Data for Animals (matching frontend models)
INSERT INTO animals (id, name, type, breed, age, weight, status, dateAdded) VALUES
('animal_001', 'Lakshmi', 'cow', 'Sahiwal', 4, 450.5, 'healthy', GETDATE()),
('animal_002', 'Ganga', 'buffalo', 'Murrah', 5, 550.0, 'healthy', GETDATE()),
('animal_003', 'Meera', 'cow', 'Gir', 3, 420.0, 'healthy', GETDATE()),
('animal_004', 'Yamuna', 'goat', 'Jamnapari', 2, 35.5, 'sick', GETDATE()),
('animal_005', 'Saraswati', 'cow', 'HF Cross', 6, 480.0, 'inactive', GETDATE());
GO

-- Sample Milk Records
INSERT INTO milk_records (id, animalId, [date], quantity, quality, temperature) VALUES
('milk_001', 'animal_001', GETDATE(), 12.5, 'high', 38.2),
('milk_002', 'animal_002', GETDATE(), 8.0, 'medium', 39.0),
('milk_003', 'animal_001', DATEADD(day, -1, GETDATE()), 11.8, 'high', 38.1),
('milk_004', 'animal_003', GETDATE(), 10.2, 'high', 38.5);
GO

-- Sample Health Records
INSERT INTO health_records (id, animalId, [date], illness, treatment, veterinarian, cost, status) VALUES
('health_001', 'animal_004', GETDATE(), 'Mastitis', 'Antibiotic injection', 'Dr. Rajesh', 1500.00, 'ongoing'),
('health_002', 'animal_005', DATEADD(day, -2, GETDATE()), 'Lameness', 'Anti-inflammatory', 'Dr. Priya', 800.00, 'recovering');
GO

-- Sample Feeding Records
INSERT INTO feeding_records (id, animalId, [date], feedType, quantity, cost, notes) VALUES
('feed_001', 'animal_001', GETDATE(), 'Green Fodder + Concentrate', 25.0, 150.00, 'Normal feeding'),
('feed_002', 'animal_002', GETDATE(), 'Silage + Minerals', 30.0, 200.00, 'Extra minerals'),
('feed_003', 'animal_003', GETDATE(), 'Hay + Grain', 22.0, 120.00, 'Good appetite');
GO

-- Demo User (password: demo123 hashed)
DECLARE @demoHash NVARCHAR(255) = '6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b';
IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'demo@example.com')
INSERT INTO users (id, email, password, name, createdAt) 
VALUES ('user_demo_001', 'demo@example.com', @demoHash, 'Demo User', GETDATE());
GO

PRINT '✅ Sri Ram Dairy database populated with sample data!';
SELECT 'Database ready for frontend connection!' AS Status;
