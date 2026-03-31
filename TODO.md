# MSSQL Database Setup for Sri Ram Dairy Frontend

## Steps:

### 1. Plan Approved
- [x] User confirmed MSSQL connection details (PRIYANSHU, dairy_farm, sa, empty pass, 1433)

### 2. Install MSSQL driver
- cd server
- npm install mssql@^10.1.1

### 3. Create server-mssql.js
- Complete Express server with MSSQL pool and auth
- Matching API endpoints

### 4. Create server/dairy_farm_mssql.sql
- Schema + sample data for manual DB init

### 5. Test & Run
- node server-mssql.js
- Verify /api/db-stats has data

### 6. Complete
- Update proxy.conf.json port if needed
- Frontend fully connected

**Current Progress: ✅ Steps 1-4 Complete! Ready for testing**

- [x] 1. Plan Approved
- [x] 2. Added mssql to package.json
- [x] 3. Created server-mssql.js (MSSQL backend + auth + CRUD APIs)
- [x] 4. Created dairy_farm_mssql.sql (schema + 15+ sample records)

**Next Steps for User:**
1. cd server
2. npm install  (installs mssql)
3. Ensure MSSQL Server PRIYANSHU running, create DB `dairy_farm` if missing
4. Run SQL: sqlcmd -S PRIYANSHU -U sa -i dairy_farm_mssql.sql  (or SSMS)
5. npm start-mssql  (runs server-mssql.js)
6. Test: http://localhost:3000/health , /api/db-stats (should show counts: animals:5, etc.)
7. Login demo@example.com / demo123
