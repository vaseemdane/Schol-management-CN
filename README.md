# Greenwood Academy ERP

Greenwood Academy ERP is a modern, responsive full-stack School ERP Management System.

## Architecture Overview
- **Frontend**: React 19, Vite, TailwindCSS v4, Zustand, React Query, Lucide Icons, Recharts.
- **Backend**: FastAPI, SQLAlchemy, PostgreSQL, JWT Authentication, SlowAPI rate-limiting.
- **Production Server**: Nginx (serving static frontend files and proxying API traffic to the FastAPI backend).
- **Database**: PostgreSQL 15.

---

## Quick Start (Docker Compose - Recommended)

To run the entire system in a production-ready containerized environment:

1. **Pre-requisites**: Make sure [Docker](https://www.docker.com/) and Docker Compose are installed and running.
2. **Build and Start**:
   ```bash
   docker-compose up --build
   ```
3. **Seed the database** (if launching for the first time):
   While the containers are running, execute the following command to populate the database with demo users and settings:
   ```bash
   docker exec -i erp_database psql -U school_erp_prod -d school_erp_production < seed.sql
   ```
4. **Access the application**:
   - **Frontend**: [http://localhost](http://localhost) (Port 80)
   - **Backend API Docs**: [http://localhost:8000/api/docs](http://localhost:8000/api/docs)
   - **Backend Health Check**: [http://localhost:8000/api/health](http://localhost:8000/api/health)

---

## Local Development (Without Docker)

To run both services natively on your local machine:

### 1. Database Setup
Ensure PostgreSQL is running locally on port `5432` with a database named `school_erp_production` and a user `school_erp_prod` with password `Vaseem@2004` (as defined in `cn_backend/.env`).
To seed the database locally:
```bash
psql -h localhost -U school_erp_prod -d school_erp_production -f seed.sql
```

### 2. Backend Setup
1. Open a terminal in the `cn_backend` directory:
   ```bash
   cd cn_backend
   ```
2. Activate your virtual environment and install dependencies:
   ```bash
   # Windows PowerShell
   .\venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   ```
3. Start the FastAPI server:
   ```bash
   uvicorn app.main:app --reload
   ```
   The backend will run on [http://localhost:8000](http://localhost:8000).

### 3. Frontend Setup
1. Open a terminal in the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The frontend will run on [http://localhost:5173](http://localhost:5173). Any requests to `/api/*` will automatically be proxied to the backend at `http://localhost:8000`.

---

## Demo Credentials

You can log in to the dashboards using the following seeded credentials:

| Portal | Mobile Number | Password |
| :--- | :--- | :--- |
| **Admin Panel** | `9000000001` | `admin123` |
| **Teacher Panel** | `9000000002` | `teacher123` |
| **Student Portal** | `9000000003` | `student123` |
