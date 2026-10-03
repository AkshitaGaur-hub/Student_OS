# ?? Student OS — Student Organization Management System

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vite.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-38B2AC?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://neon.tech/)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-ORM-D71F00?style=flat-square&logo=python&logoColor=white)](https://sqlalchemy.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

> A full-stack platform for colleges and universities to manage student organizations — from member registration and event ticketing to merchandise sales, fundraisers, and financial reporting.

---

## ?? Table of Contents

- [Problem Statement](#-problem-statement)
- [Solution](#-solution)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Application Flow](#-application-flow)
- [Authentication Flow](#-authentication-flow)
- [Database Flow](#-database-flow)
- [API Overview](#-api-overview)
- [Project Structure](#-project-structure)
- [Setup & Installation](#-setup--installation)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [Screenshots](#-screenshots)
- [Future Scope](#-future-scope)
- [Contributors](#-contributors)

---

## ? Problem Statement

Student organizations at universities often rely on disconnected tools — WhatsApp groups for announcements, spreadsheets for finances, Google Forms for event registration, and cash for merchandise. This fragmented setup leads to:

- Poor visibility into member engagement and attendance
- No centralized financial tracking or reporting
- Difficult event and ticket management
- No secure role-based access control

---

## ? Solution

**Student OS** is a unified management platform that consolidates all student organization operations into a single, role-secured web application. It provides organizers with a real-time dashboard while giving members a seamless interface to register, buy tickets, order merchandise, and stay informed.

---

## ? Key Features

| Feature | Description |
|---|---|
| ?? **Authentication** | JWT-based login/register with role-based access control |
| ?? **Member Management** | Add, view, and manage organization members |
| ?? **Event Management** | Create and manage events with full metadata |
| ??? **Ticket System** | Issue and check-in event tickets |
| ?? **Announcements** | Publish and track organization-wide announcements |
| ??? **Merchandise Store** | Browse, cart, and purchase organization merchandise |
| ?? **Cart & Checkout** | Full shopping cart and order checkout flow |
| ?? **Order Tracking** | View and manage merchandise orders |
| ?? **Fundraiser Management** | Create fundraisers with task tracking |
| ?? **Finance Module** | Track income, expenses, and reimbursements |
| ?? **Financial Dashboard** | Visualize budget summaries and transaction history |

---

## ?? Tech Stack

### Backend
| Technology | Role |
|---|---|
| **FastAPI** | REST API framework |
| **SQLAlchemy** | ORM for database models |
| **PostgreSQL (Neon)** | Cloud-hosted relational database |
| **PyJWT + bcrypt** | JWT token generation, password hashing |
| **python-dotenv** | Environment variable management |
| **Uvicorn** | ASGI server |
| **Pydantic** | Request/response schema validation |

### Frontend
| Technology | Role |
|---|---|
| **React 18** | UI library |
| **Vite** | Build tool and dev server |
| **React Router v6** | Client-side routing |
| **Tailwind CSS v3** | Utility-first styling |
| **Axios** | HTTP client for API communication |
| **Lucide React** | Icon library |

---

## ?? System Architecture

```mermaid
graph TD
    Browser["?? Browser (React SPA)"]
    Vite["? Vite Dev Server :5173"]
    FastAPI["?? FastAPI Backend :8000"]
    DB["??? PostgreSQL Neon Cloud"]

    Browser -->|HTTP Requests| Vite
    Vite -->|Proxy to backend| FastAPI
    FastAPI -->|SQLAlchemy ORM| DB
    FastAPI -->|JWT Auth| Browser
```

```mermaid
graph LR
    subgraph Frontend
        Pages["Pages"]
        Services["Services Layer"]
        Components["Shared Components"]
        Layout["Layouts"]
    end

    subgraph Backend
        Routers["Routers"]
        Services2["Services"]
        Models["SQLAlchemy Models"]
        Schemas["Pydantic Schemas"]
    end

    Pages --> Services
    Services -->|Axios| Routers
    Routers --> Services2
    Services2 --> Models
    Routers --> Schemas
```

---

## ?? Application Flow

```mermaid
flowchart TD
    Start([User visits Student OS]) --> IsAuth{Authenticated?}

    IsAuth -- No --> PublicHome[Landing Page]
    PublicHome --> AuthPage[Login / Register]
    AuthPage --> Creds{Valid Credentials?}
    Creds -- No --> AuthError[Show Error]
    AuthError --> AuthPage
    Creds -- Yes --> SaveToken[Save JWT to localStorage]
    SaveToken --> Dashboard

    IsAuth -- Yes --> Dashboard[Dashboard]

    Dashboard --> Members[Members]
    Dashboard --> Events[Events]
    Dashboard --> Tickets[Tickets]
    Dashboard --> Merch[Merchandise Store]
    Dashboard --> Finance[Finance Module]
    Dashboard --> Fundraisers[Fundraisers]
    Dashboard --> Announcements[Announcements]

    Merch --> Cart[Cart]
    Cart --> Checkout[Checkout]
    Checkout --> Orders[My Orders]
```

---

## ?? Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant FastAPI
    participant Database

    User->>Frontend: Submit login form
    Frontend->>FastAPI: POST /auth/login
    FastAPI->>Database: Query user by email
    Database-->>FastAPI: Return user record
    FastAPI->>FastAPI: bcrypt.checkpw
    alt Valid credentials
        FastAPI-->>Frontend: 200 OK with access_token
        Frontend->>Frontend: Store token in localStorage
        Frontend-->>User: Redirect to /dashboard
    else Invalid credentials
        FastAPI-->>Frontend: 401 Unauthorized
        Frontend-->>User: Show error message
    end

    Note over Frontend,FastAPI: Subsequent protected requests
    Frontend->>FastAPI: GET /members with Bearer token
    FastAPI->>FastAPI: jwt.decode token
    FastAPI->>Database: Fetch user by ID
    Database-->>FastAPI: User record
    FastAPI-->>Frontend: Protected resource data
```

**Roles supported:** `student`, `volunteer`, `organizer`, `treasurer`, `admin`

---

## ?? Database Flow

```mermaid
erDiagram
    USER {
        int id PK
        string full_name
        string email
        string hashed_password
        string role
        bool is_active
    }
    MEMBER {
        int id PK
        string name
        string email
        string role
        string status
    }
    EVENT {
        int id PK
        string title
        string description
        datetime date
        string location
        int capacity
    }
    TICKET {
        int id PK
        int event_id FK
        int member_id FK
        string status
        bool checked_in
    }
    PRODUCT {
        int id PK
        string name
        float price
        int stock
        string category
    }
    ORDER {
        int id PK
        int member_id FK
        float total_amount
        string status
    }
    ORDER_ITEM {
        int id PK
        int order_id FK
        int product_id FK
        int quantity
        float unit_price
    }
    FUNDRAISER {
        int id PK
        string title
        float goal_amount
        float raised_amount
    }
    FUNDRAISER_TASK {
        int id PK
        int fundraiser_id FK
        string description
        string status
    }
    INCOME {
        int id PK
        string source
        float amount
        date date
    }
    EXPENSE {
        int id PK
        string description
        float amount
        date date
    }
    REIMBURSEMENT {
        int id PK
        int member_id FK
        float amount
        string status
    }

    EVENT ||--o{ TICKET : "has"
    MEMBER ||--o{ TICKET : "holds"
    ORDER ||--o{ ORDER_ITEM : "contains"
    PRODUCT ||--o{ ORDER_ITEM : "referenced by"
    FUNDRAISER ||--o{ FUNDRAISER_TASK : "has"
    MEMBER ||--o{ REIMBURSEMENT : "requests"
```

---

## ?? API Overview

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/auth/register` | Register a new user | ? |
| `POST` | `/auth/login` | Login and get JWT token | ? |
| `GET` | `/auth/me` | Get current user info | ? |
| `GET` | `/members` | List all members | ? |
| `POST` | `/members` | Add a new member | ? |
| `GET` | `/events` | List all events | ? |
| `POST` | `/events` | Create a new event | ? |
| `GET` | `/tickets` | List all tickets | ? |
| `POST` | `/tickets` | Issue a ticket | ? |
| `POST` | `/tickets/{id}/checkin` | Check in a ticket | ? |
| `GET` | `/products` | List merchandise | ? |
| `POST` | `/products` | Add a product | ? |
| `GET` | `/orders` | List all orders | ? |
| `POST` | `/orders` | Place an order | ? |
| `GET` | `/finance/summary` | Financial summary | ? |
| `POST` | `/finance/income` | Record income | ? |
| `POST` | `/finance/expense` | Record expense | ? |
| `GET` | `/announcements` | List announcements | ? |
| `GET` | `/health` | API health check | ? |

> ?? Full interactive docs at `http://localhost:8000/docs` (Swagger UI) and `http://localhost:8000/redoc`.

---

## ?? Project Structure

```
Student_OS/
+-- backend/
¦   +-- app/
¦   ¦   +-- main.py                 # FastAPI app, CORS, router registration
¦   ¦   +-- database.py             # SQLAlchemy engine, session, Base
¦   ¦   +-- dependencies.py         # JWT, bcrypt, role-checking helpers
¦   ¦   +-- models/                 # SQLAlchemy table definitions
¦   ¦   +-- routers/                # API route handlers
¦   ¦   +-- schemas/                # Pydantic request/response models
¦   ¦   +-- services/               # Business logic layer
¦   +-- .env                        # DATABASE_URL, JWT_SECRET
¦   +-- requirements.txt
¦   +-- seed.py                     # Database seeding script
¦   +-- migrate.py
¦
+-- frontend/
    +-- src/
    ¦   +-- main.jsx                # React entry point
    ¦   +-- App.jsx                 # Route definitions
    +-- pages/                      # Page components
    +-- components/                 # Shared UI components
    +-- layouts/                    # PublicLayout, AuthLayout, DashboardLayout
    +-- services/                   # Axios API service modules
    +-- package.json
    +-- vite.config.js
    +-- tailwind.config.js
```

---

## ?? Setup & Installation

### Prerequisites

- **Python 3.10+**
- **Node.js 18+** and **npm**
- A **PostgreSQL** database ([Neon](https://neon.tech/) recommended)

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/Student_OS.git
cd Student_OS
```

### 2. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # macOS/Linux

# Install dependencies
pip install -r requirements.txt
```

Create `backend/.env`:

```env
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
JWT_SECRET=your-secret-key-here
```

```bash
# Optional: seed the database with sample data
python seed.py
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

---

## ?? Running the Application

### Backend

```bash
cd backend
venv\Scripts\activate
uvicorn app.main:app --reload --port 8000
```

API available at: `http://localhost:8000`

### Frontend

```bash
cd frontend
npm run dev
```

App available at: `http://localhost:5173`

---

## ?? API Documentation

| Interface | URL |
|---|---|
| **Swagger UI** | http://localhost:8000/docs |
| **ReDoc** | http://localhost:8000/redoc |
| **Health Check** | http://localhost:8000/health |

---

## ?? Screenshots

> _Screenshots to be added here._

| Page | Screenshot |
|---|---|
| Landing Page | `screenshots/home.png` |
| Login / Register | `screenshots/auth.png` |
| Dashboard | `screenshots/dashboard.png` |
| Members | `screenshots/members.png` |
| Events & Tickets | `screenshots/events.png` |
| Merchandise Store | `screenshots/merchandise.png` |
| Finance Module | `screenshots/finance.png` |

---

## ?? Future Scope

- [ ] Email notifications for event registrations and ticket confirmations
- [ ] QR code generation for ticket check-in
- [ ] Role-specific dashboards with granular permission management
- [ ] Export reports (PDF/CSV) for finance and member data
- [ ] Real-time announcements using WebSockets
- [ ] Mobile app (React Native) for on-the-go access
- [ ] OAuth 2.0 / SSO integration with university identity providers
- [ ] Multi-organization support — one platform, many clubs

---

## ?? Contributors

| Name | Role |
|---|---|
| Akshita Gaur | Full-Stack Developer |

---

> Built with ?? for student organizations everywhere.
