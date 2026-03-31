# Dairy Farm Management System - Setup Guide

## 🚀 Getting Started

### Prerequisites
- Node.js (v14+)
- npm or yarn

### Installation & Running

#### 1. Frontend (Angular) - Already Running ✅
- The frontend is running on **http://localhost:4200/**
- All changes auto-reload (Watch mode enabled)

#### 2. Backend (Node.js/Express) - Just Started ✅
- The backend server is running on **http://localhost:3000/**
- Database: SQLite (`dairy_farm.db`)
- All data is persisted to the database

## 📋 Features

### Dashboard
- View key metrics:
  - Total animals on farm
  - Total milk production
  - Health issues count
  - Feeding expenses

### Animal Management
- Add, edit, delete animals
- Track: name, type, breed, age, weight, status
- Click status badge to toggle status quickly

### Milk Production Records
- Record daily milk production
- Track quality (high/medium/low)
- Monitor temperature
- Click quality badge to toggle

### Animal Health
- Log health issues and treatments
- Track veterinarian details and costs
- Monitor treatment status
- Click status badge to toggle

### Feeding Management
- Record feeding activities
- Track feed type, quantity, and cost
- Add notes for special instructions
- View total feeding costs

## 📁 Project Structure

```
sri-ram-dairy/
├── src/
│   ├── app/
│   │   ├── models/         (Data models)
│   │   ├── services/       (Animal, Milk, Health, Feeding, API)
│   │   ├── components/     (Dashboard, Animal, Milk, Health, Feeding)
│   │   ├── app.config.ts
│   │   ├── app.routes.ts
│   │   └── app.ts
│   ├── main.ts
│   ├── styles.css
│   └── index.html
├── server/
│   ├── server.js           (Express API server)
│   ├── package.json
│   └── dairy_farm.db       (SQLite database)
├── angular.json
├── package.json
└── README.md
```

## 🔌 API Endpoints

### Animals
- `GET /api/animals` - Get all animals
- `POST /api/animals` - Add new animal
- `PUT /api/animals/:id` - Update animal
- `DELETE /api/animals/:id` - Delete animal

### Milk Records
- `GET /api/milk-records` - Get all milk records
- `POST /api/milk-records` - Add milk record
- `PUT /api/milk-records/:id` - Update milk record
- `DELETE /api/milk-records/:id` - Delete milk record

### Health Records
- `GET /api/health-records` - Get all health records
- `POST /api/health-records` - Add health record
- `PUT /api/health-records/:id` - Update health record
- `DELETE /api/health-records/:id` - Delete health record

### Feeding Records
- `GET /api/feeding-records` - Get all feeding records
- `POST /api/feeding-records` - Add feeding record
- `PUT /api/feeding-records/:id` - Update feeding record
- `DELETE /api/feeding-records/:id` - Delete feeding record

## 🔧 Technologies Used

**Frontend:**
- Angular 20.3
- TypeScript
- RxJS
- CSS3

**Backend:**
- Node.js
- Express.js
- SQLite3
- CORS

## 💾 Data Persistence

All data is now stored in:
- **SQLite Database**: `server/dairy_farm.db`
- Persistent across sessions
- Full CRUD operations supported

## 🎨 Key Features

✅ Real-time data synchronization  
✅ Clickable status/quality badges for quick updates  
✅ Responsive UI design  
✅ Professional dashboard with metrics  
✅ Complete CRUD for all modules  
✅ Server-based data persistence  
✅ Error handling and validation  

## 📞 Support

If you encounter any issues:
1. Check that both servers are running (Frontend: 4200, Backend: 3000)
2. Check browser console for errors (F12)
3. Check terminal for backend errors
4. Clear browser cache if needed

## 🎯 Next Steps

1. Start adding animals to the farm
2. Record milk production daily
3. Log health issues as they occur
4. Track feeding and expenses
5. Monitor metrics on the dashboard

Enjoy managing your dairy farm! 🐄🥛
