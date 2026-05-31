# 🎓 Greenwood Academy ERP — School Management System

A complete, production-ready School ERP Management System with three role-based panels.

![Stack](https://img.shields.io/badge/Frontend-React%20%2B%20Vite%20%2B%20Tailwind-blue)
![Stack](https://img.shields.io/badge/Backend-FastAPI%20%2B%20PostgreSQL-green)
![Stack](https://img.shields.io/badge/Auth-JWT-orange)
![Stack](https://img.shields.io/badge/Deploy-Docker%20Compose-purple)

---

## 🏗️ System Overview

| Module | Description |
|--------|-------------|
| **Admin Panel** | Full school management: students, teachers, fees, salary, certificates, analytics |
| **Teacher Panel** | Attendance marking, result entry, student analytics |
| **Student/Parent Panel** | View attendance, marks, fees, download reports |

---

## 🚀 Quick Start

### Option A: Docker Compose (Recommended)

```bash
# 1. Clone / navigate to project
cd "CN Mugalkod"

# 2. Copy environment file
copy .env.example .env

# 3. Start all services
docker-compose up --build

# 4. Access the app
# Frontend: http://localhost:5173
# Backend API: http://localhost:8000/api/docs
```

### Option B: Local Development

#### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate   # Windows
# source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Set environment variables
copy .env.example .env
# Edit .env with your PostgreSQL credentials

# Run the backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

---

## 🔑 Demo Login Credentials

| Role | Mobile | Password | Portal |
|------|--------|----------|--------|
| **Admin** | `9000000001` | `admin123` | `/login/admin` |
| **Teacher** | `9000000002` | `teacher123` | `/login/teacher` |
| **Student** | `9000000004` | `student123` | `/login/student` |

> Demo credentials are pre-filled on the login page — just click "Use these →"

---

## 📁 Project Structure

```
CN Mugalkod/
├── frontend/                  # React + Vite + Tailwind + ShadCN
│   ├── src/
│   │   ├── api/               # Axios API client
│   │   ├── components/        # Shared UI components
│   │   ├── layouts/           # Admin/Teacher/Student layouts
│   │   ├── pages/             # All pages by role
│   │   ├── store/             # Zustand auth store
│   │   └── lib/               # Utilities
│   └── Dockerfile
│
├── backend/                   # FastAPI + SQLAlchemy
│   ├── app/
│   │   ├── api/               # Route handlers
│   │   ├── core/              # Config, security, JWT
│   │   ├── db/                # Database session
│   │   ├── models/            # SQLAlchemy models
│   │   └── schemas/           # Pydantic schemas
│   ├── requirements.txt
│   └── Dockerfile
│
├── docker-compose.yml
├── .env.example
├── seed_data.sql
└── README.md
```

---

## 🗄️ Database Tables

| Table | Purpose |
|-------|---------|
| `users` | All users (admin, teacher, student, parent) |
| `students` | Student profiles |
| `teachers` | Teacher profiles |
| `classes` | School classes |
| `subjects` | Subjects per class |
| `attendance` | Daily attendance records |
| `exams` | Exam definitions |
| `marks` | Student exam marks |
| `fees` | Student fee records |
| `fee_payments` | Individual fee payments |
| `salary` | Teacher salary records |
| `salary_payments` | Individual salary payments |
| `certificates` | Generated certificates |
| `notifications` | School announcements |

---

## 📡 API Documentation

After starting the backend, visit:
- **Swagger UI**: http://localhost:8000/api/docs
- **ReDoc**: http://localhost:8000/api/redoc
- **Health Check**: http://localhost:8000/api/health

---

## 🔒 Security Features

- ✅ bcrypt password hashing
- ✅ JWT token authentication (access + refresh)
- ✅ Role-based access control (Admin / Teacher / Student)
- ✅ Protected routes on frontend and backend
- ✅ CORS configuration
- ✅ Input validation (Pydantic schemas)
- ✅ SQL injection protection (SQLAlchemy parameterized queries)
- ✅ API rate limiting (slowapi)

---

## 🎨 Design Features

- 🌙 Dark mode by default (premium dark theme)
- 📱 Fully responsive (mobile + desktop)
- ✨ Glassmorphism UI cards
- 🎨 Role-based gradient color schemes (Blue/Admin, Purple/Teacher, Green/Student)
- 📊 Interactive charts (Recharts — Bar, Pie, Line, Area)
- 🔄 Smooth animations and transitions
- 🎭 Collapsible sidebar navigation

---

## 📄 PDF Reports

Students can download:
- **Attendance Report** — Monthly attendance breakdown
- **Performance Report** — Subject-wise marks and grades
- **Fee Summary** — Payment history

Admin can generate:
- **Bonafide Certificate**
- **Study Certificate**
- **Transfer Certificate**

> PDFs are generated via browser print dialog. Select "Save as PDF" as the printer.

---

## 🐳 Production Deployment

```bash
# Build production images
docker-compose -f docker-compose.yml build

# Start in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env` and update:

```env
# Database
POSTGRES_USER=erp_user
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=school_erp

# JWT (CHANGE THIS!)
SECRET_KEY=your-super-secret-key-minimum-32-characters

# App
DEBUG=false
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Recharts, Zustand |
| Backend | FastAPI, SQLAlchemy, Alembic, Pydantic |
| Database | PostgreSQL 16 |
| Auth | JWT (python-jose), bcrypt (passlib) |
| HTTP Client | Axios + TanStack Query |
| Container | Docker, Docker Compose |
| Proxy | Nginx |

---

## 📞 Support

Built for **Greenwood Academy** | School ERP v1.0 | 2024
