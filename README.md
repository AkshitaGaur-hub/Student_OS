# Student OS — Student Organization Management System

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vite.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-38B2AC?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://neon.tech/)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-ORM-D71F00?style=flat-square&logo=python&logoColor=white)](https://sqlalchemy.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

> A full-stack platform for colleges and universities to manage student organizations — from member registration and event ticketing to merchandise sales, fundraisers, and financial reporting.

---

## Table of Contents

- [Problem Statement](#problem-statement)
- [Solution](#solution)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Application Flow](#application-flow)
- [Authentication Flow](#authentication-flow)
- [Database ER Diagram](#database-er-diagram)
- [API Overview](#api-overview)
- [Role-Based Access Control](#role-based-access-control)
- [Project Structure](#project-structure)
- [Setup and Installation](#setup-and-installation)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Future Scope](#future-scope)
- [Contributors](#contributors)

---

## Problem Statement

Student organizations at universities rely on disconnected, informal tools:

- WhatsApp groups for announcements
- Excel spreadsheets for member and finance tracking
- Google Forms for event registration
- Cash-in-hand for merchandise and fundraisers

This fragmented setup causes:

- No central visibility into membership, attendance, or revenue
- No role-based access — anyone can see or edit anything
- Difficult to audit finances or issue refunds/reimbursements
- No digital tickets — check-in is manual and error-prone

---

## Solution

**Student OS** consolidates every student organization operation into a single, role-secured web application. Administrators get a real-time operational dashboard; members get a seamless interface to register, purchase tickets, order merchandise, and stay informed — all secured by JWT authentication and enforced server-side role checks.

---

## Key Features

| Feature | Description |
|---|---|
| Authentication | JWT login and registration with role-based access control |
| Member Management | Add, view, search, filter and manage organization members |
| Event Management | Create and manage events with capacity, pricing and metadata |
| Ticket System | Issue event tickets with QR code display and check-in desk |
| Announcements | Publish and manage organization-wide announcements |
| Merchandise Store | Browse, cart and purchase official organization merchandise |
| Cart and Checkout | Full shopping cart flow with order summary and checkout |
| Order Tracking | View and manage merchandise orders per member or admin |
| Fundraiser Management | Create fundraisers with volunteer task tracking and progress |
| Finance Module | Track income, expenses, reimbursements and financial balance |
| Financial Dashboard | Recharts bar charts for monthly income vs. expense overview |
| Role-Based Navigation | Sidebar adapts dynamically to the signed-in user's role |

---

## Tech Stack

### Backend

| Technology | Role |
|---|---|
| FastAPI | REST API framework with auto OpenAPI docs |
| SQLAlchemy | ORM for database models and relationships |
| PostgreSQL (Neon) | Cloud-hosted relational database |
| PyJWT + bcrypt | JWT token generation and password hashing |
| python-dotenv | Environment variable management |
| Pydantic | Request and response schema validation |
| Uvicorn | ASGI server for serving the FastAPI app |

### Frontend

| Technology | Role |
|---|---|
| React 18 | UI component library |
| Vite 6 | Dev server and production build tool |
| Tailwind CSS 3 | Utility-first styling system |
| React Router v6 | Client-side routing and protected routes |
| Axios | HTTP client with JWT interceptors |
| Lucide React | Icon set for consistent UI |
| Recharts | Composable charts for financial dashboards |

---

## System Architecture

```
                    +---------------------------+
                    |       Web Browser         |
                    |   React 18 + Vite SPA     |
                    +---------------------------+
                                |
                    HTTP/HTTPS via Axios
                                |
                    +---------------------------+
                    |      FastAPI Backend      |
                    |   Python 3.10+  Port 8000 |
                    |                           |
                    |  +---------------------+  |
                    |  |   JWT Middleware     |  |
                    |  |   Role Guards        |  |
                    |  +---------------------+  |
                    |  |   Route Handlers    |  |
                    |  |   Pydantic Schemas  |  |
                    |  +---------------------+  |
                    |  |   Business Logic    |  |
                    |  |   (Services layer)  |  |
                    |  +---------------------+  |
                    |  |   SQLAlchemy ORM    |  |
                    +-----|-------------------|-+
                          |                   |
               +----------+     +-------------+
               | Neon PostgreSQL|     Neon PostgreSQL
               | (primary)      |     (connection pool)
               +-----------+----+
```

---

## Application Flow

```mermaid
flowchart TD
    Start([User visits app]) --> IsAuth{JWT in localStorage?}

    IsAuth -- No --> PublicHome[Landing Page]
    PublicHome --> AuthPage[Login / Register]
    AuthPage --> Creds{Valid Credentials?}
    Creds -- No --> AuthError[Show error message]
    AuthError --> AuthPage
    Creds -- Yes --> SaveToken[Save JWT to localStorage]
    SaveToken --> Dashboard

    IsAuth -- Yes --> Dashboard[Dashboard - Role-aware view]

    Dashboard --> Members[Members Management]
    Dashboard --> Events[Events Management]
    Dashboard --> Tickets[My Tickets / Check-in Desk]
    Dashboard --> Merch[Merchandise Store]
    Dashboard --> Finance[Finance Module]
    Dashboard --> Fundraisers[Fundraisers and Tasks]
    Dashboard --> Announcements[Announcements Feed]

    Merch --> Cart[Shopping Cart]
    Cart --> Checkout[Checkout]
    Checkout --> Orders[Order Confirmation / My Orders]
```

---

## Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant FastAPI
    participant Database

    User->>Frontend: Submit login credentials
    Frontend->>FastAPI: POST /auth/login { email, password }
    FastAPI->>Database: SELECT user WHERE email = ?
    Database-->>FastAPI: User record (hashed_password, role)
    FastAPI->>FastAPI: bcrypt.checkpw(password, hashed)

    alt Valid credentials
        FastAPI-->>Frontend: 200 OK { access_token, user }
        Frontend->>Frontend: localStorage.setItem("token", ...)
        Frontend->>Frontend: localStorage.setItem("user", ...)
        Frontend-->>User: Redirect to /dashboard
    else Invalid credentials
        FastAPI-->>Frontend: 401 Unauthorized
        Frontend-->>User: Display error message
    end

    Note over Frontend,FastAPI: Every protected request afterwards
    Frontend->>FastAPI: GET /members  Authorization: Bearer <token>
    FastAPI->>FastAPI: jwt.decode(token, JWT_SECRET)
    FastAPI->>Database: SELECT user WHERE id = decoded.sub
    Database-->>FastAPI: User record + role
    FastAPI-->>Frontend: Protected resource data
```

**Roles supported:** `Admin / President`, `Treasurer`, `Volunteer`, `Member`

---

## Database ER Diagram

```mermaid
erDiagram
    USER {
        int     id              PK
        string  full_name
        string  email
        string  hashed_password
        string  role
        bool    is_active
        datetime created_at
    }

    MEMBER {
        int     id              PK
        int     user_id         FK
        string  name
        string  email
        string  phone
        string  role
        string  status
        date    join_date
        date    expiry_date
        string  payment_status
        datetime created_at
    }

    EVENT {
        int      id              PK
        string   title
        string   description
        datetime date
        string   location
        int      capacity
        int      tickets_sold
        float    member_price
        float    non_member_price
        string   status
        datetime created_at
    }

    TICKET {
        int      id              PK
        int      event_id        FK
        int      member_id       FK
        string   ticket_code
        string   qr_data
        string   status
        bool     checked_in
        datetime checked_in_at
        datetime issued_at
    }

    ANNOUNCEMENT {
        int      id              PK
        int      author_id       FK
        string   title
        text     content
        datetime created_at
        datetime updated_at
    }

    PRODUCT {
        int      id              PK
        string   name
        string   description
        float    price
        int      stock
        string   category
        datetime created_at
    }

    ORDER {
        int      id              PK
        int      member_id       FK
        float    total_amount
        string   status
        string   payment_status
        datetime placed_at
    }

    ORDER_ITEM {
        int      id              PK
        int      order_id        FK
        int      product_id      FK
        int      quantity
        float    unit_price
    }

    FUNDRAISER {
        int      id              PK
        string   title
        text     description
        float    goal_amount
        float    raised_amount
        string   status
        datetime created_at
    }

    FUNDRAISER_TASK {
        int      id              PK
        int      fundraiser_id   FK
        int      assigned_to     FK
        string   description
        string   status
        datetime due_date
    }

    INCOME {
        int      id              PK
        string   source
        string   category
        float    amount
        string   description
        date     date
        datetime created_at
    }

    EXPENSE {
        int      id              PK
        string   description
        string   category
        float    amount
        date     date
        datetime created_at
    }

    REIMBURSEMENT {
        int      id              PK
        int      member_id       FK
        float    amount
        string   description
        string   status
        datetime requested_at
        datetime resolved_at
    }

    USER        ||--o{ MEMBER          : "is linked to"
    USER        ||--o{ ANNOUNCEMENT    : "authors"
    EVENT       ||--o{ TICKET          : "has"
    MEMBER      ||--o{ TICKET          : "holds"
    ORDER       ||--o{ ORDER_ITEM      : "contains"
    PRODUCT     ||--o{ ORDER_ITEM      : "referenced by"
    MEMBER      ||--o{ ORDER           : "places"
    FUNDRAISER  ||--o{ FUNDRAISER_TASK : "has"
    USER        ||--o{ FUNDRAISER_TASK : "is assigned"
    MEMBER      ||--o{ REIMBURSEMENT   : "requests"
```

---

## API Overview

### Authentication

| Method | Endpoint | Description | Protected |
|---|---|---|---|
| `POST` | `/auth/register` | Register a new user | No |
| `POST` | `/auth/login` | Login and receive JWT token | No |
| `GET` | `/auth/me` | Get current authenticated user | Yes |

### Members

| Method | Endpoint | Description | Protected |
|---|---|---|---|
| `GET` | `/members` | List all members | Yes |
| `POST` | `/members` | Create a new member | Admin |
| `GET` | `/members/{id}` | Get member by ID | Yes |
| `PUT` | `/members/{id}` | Update member details | Admin |
| `DELETE` | `/members/{id}` | Delete a member | Admin |

### Events

| Method | Endpoint | Description | Protected |
|---|---|---|---|
| `GET` | `/events` | List all events | Yes |
| `POST` | `/events` | Create a new event | Admin |
| `GET` | `/events/{id}` | Get event by ID | Yes |
| `PUT` | `/events/{id}` | Update event details | Admin |
| `DELETE` | `/events/{id}` | Cancel or delete event | Admin |

### Tickets

| Method | Endpoint | Description | Protected |
|---|---|---|---|
| `POST` | `/tickets` | Purchase a ticket for an event | Yes |
| `GET` | `/tickets/my` | Get my purchased tickets | Yes |
| `GET` | `/tickets/{id}` | Get ticket by ID | Yes |
| `POST` | `/tickets/{id}/check-in` | Mark ticket as checked in | Admin / Volunteer |

### Merchandise and Orders

| Method | Endpoint | Description | Protected |
|---|---|---|---|
| `GET` | `/products` | List all products | Yes |
| `POST` | `/products` | Add a product | Admin |
| `PUT` | `/products/{id}` | Update product details | Admin |
| `DELETE` | `/products/{id}` | Remove a product | Admin |
| `GET` | `/orders` | List all orders | Admin / Treasurer |
| `GET` | `/orders/my` | Get my orders | Yes |
| `POST` | `/orders` | Place a merchandise order | Yes |
| `GET` | `/orders/{id}` | Get order by ID | Yes |

### Announcements

| Method | Endpoint | Description | Protected |
|---|---|---|---|
| `GET` | `/announcements` | List all announcements | Yes |
| `POST` | `/announcements` | Create an announcement | Admin |
| `GET` | `/announcements/{id}` | Get announcement by ID | Yes |
| `PUT` | `/announcements/{id}` | Update announcement | Admin |
| `DELETE` | `/announcements/{id}` | Delete announcement | Admin |

### Fundraisers

| Method | Endpoint | Description | Protected |
|---|---|---|---|
| `GET` | `/fundraisers` | List all fundraisers | Yes |
| `POST` | `/fundraisers` | Create a fundraiser | Admin |
| `POST` | `/fundraisers/{id}/tasks` | Add a task to a fundraiser | Admin |
| `PUT` | `/tasks/{id}` | Update task status | Admin / Volunteer |
| `DELETE` | `/tasks/{id}` | Delete a task | Admin |

### Finance

| Method | Endpoint | Description | Protected |
|---|---|---|---|
| `GET` | `/finance/summary` | Get income, expense, balance summary | Admin / Treasurer |
| `GET` | `/finance/income` | List income transactions | Admin / Treasurer |
| `POST` | `/finance/income` | Record an income entry | Admin / Treasurer |
| `GET` | `/finance/expenses` | List expense transactions | Admin / Treasurer |
| `POST` | `/finance/expenses` | Record an expense | Admin / Treasurer |
| `GET` | `/finance/reimbursements` | List reimbursement requests | Admin / Treasurer |
| `POST` | `/finance/reimbursements` | Submit a reimbursement request | Yes |
| `PUT` | `/finance/reimbursements/{id}` | Approve or reject reimbursement | Admin / Treasurer |

### Analytics

| Method | Endpoint | Description | Protected |
|---|---|---|---|
| `GET` | `/analytics/dashboard` | Dashboard metrics (members, tickets, revenue) | Admin |
| `GET` | `/analytics/revenue` | Revenue breakdown by period and category | Admin / Treasurer |
| `GET` | `/analytics/events/{id}` | Per-event attendance and revenue stats | Admin |

> Full interactive documentation is available at `http://localhost:8000/docs` (Swagger UI) and `http://localhost:8000/redoc` (ReDoc).

---

## Role-Based Access Control

| Capability | Admin / President | Treasurer | Volunteer | Member |
|---|:---:|:---:|:---:|:---:|
| View Dashboard | Yes | Yes | Yes | Yes |
| Manage Members | Yes | View only | No | No |
| Create / Edit Events | Yes | No | No | No |
| Purchase Event Tickets | Yes | Yes | Yes | Yes |
| QR Check-in Desk | Yes | No | Yes | No |
| Manage Announcements | Yes | No | No | No |
| Manage Merchandise | Yes | No | No | No |
| Place Merchandise Orders | Yes | Yes | Yes | Yes |
| View All Orders | Yes | Yes | No | Own only |
| Create Fundraisers | Yes | No | No | No |
| Update Fundraiser Tasks | Yes | No | Yes | No |
| View Finance Module | Yes | Yes | No | No |
| Record Expenses / Income | Yes | Yes | No | No |
| Submit Reimbursements | Yes | Yes | Yes | Yes |
| Approve Reimbursements | Yes | Yes | No | No |

---

## Project Structure

```
Student_OS/
|-- backend/
|   |-- app/
|   |   |-- main.py              FastAPI app entry, CORS, router registration
|   |   |-- database.py          SQLAlchemy engine, session factory, Base
|   |   |-- dependencies.py      JWT decode, bcrypt, role-checking helpers
|   |   |-- models/              SQLAlchemy ORM table definitions
|   |   |   |-- user.py
|   |   |   |-- member.py
|   |   |   |-- event.py
|   |   |   |-- ticket.py
|   |   |   |-- product.py
|   |   |   |-- order.py
|   |   |   |-- fundraiser.py
|   |   |   |-- finance.py
|   |   |   `-- announcement.py
|   |   |-- routers/             API route handlers (one file per module)
|   |   |   |-- auth.py
|   |   |   |-- members.py
|   |   |   |-- events.py
|   |   |   |-- tickets.py
|   |   |   |-- products.py
|   |   |   |-- orders.py
|   |   |   |-- fundraisers.py
|   |   |   |-- finance.py
|   |   |   |-- announcements.py
|   |   |   `-- analytics.py
|   |   |-- schemas/             Pydantic request and response models
|   |   `-- services/            Business logic layer (capacity checks, etc.)
|   |-- .env                     DATABASE_URL, JWT_SECRET, ALGORITHM
|   |-- requirements.txt
|   |-- seed.py                  Database seeder with sample data
|   `-- migrate.py               Table creation / schema migration runner
|
`-- frontend/
    |-- src/
    |   |-- main.jsx             React application entry point
    |   |-- App.jsx              React Router route definitions
    |   `-- index.css            Tailwind CSS base directives
    |-- components/              Reusable UI component library
    |   |-- Button.jsx
    |   |-- Input.jsx
    |   |-- Select.jsx
    |   |-- Modal.jsx
    |   |-- Card.jsx
    |   |-- Table.jsx
    |   |-- Badge.jsx
    |   |-- SearchBar.jsx
    |   |-- Pagination.jsx
    |   |-- Toast.jsx
    |   |-- Loading.jsx
    |   |-- EmptyState.jsx
    |   |-- ConfirmDialog.jsx
    |   |-- QRCode.jsx
    |   `-- ProtectedRoute.jsx
    |-- layouts/                 Page layout wrappers
    |   |-- PublicLayout.jsx     Navbar + public footer
    |   |-- AuthLayout.jsx       Centered card for login/register
    |   `-- DashboardLayout.jsx  Sidebar + role-aware nav + header
    |-- pages/                   Route-level page components
    |   |-- Home.jsx
    |   |-- Auth.jsx
    |   |-- Profile.jsx
    |   |-- Dashboard.jsx
    |   |-- Members.jsx
    |   |-- Events.jsx
    |   |-- Tickets.jsx
    |   |-- Announcements.jsx
    |   |-- Merchandise.jsx
    |   |-- Cart.jsx
    |   |-- Checkout.jsx
    |   |-- Orders.jsx
    |   |-- Fundraisers.jsx
    |   |-- Finance.jsx
    |   |-- PrivacyPolicy.jsx
    |   `-- TermsConditions.jsx
    |-- services/                Axios API service modules
    |   |-- api.js               Axios instance + JWT + 401 interceptors
    |   |-- auth.js              Login, register, logout, JWT parsing
    |   |-- members.js
    |   |-- events.js
    |   |-- tickets.js
    |   |-- announcements.js
    |   |-- products.js
    |   |-- orders.js
    |   |-- fundraisers.js
    |   |-- finance.js
    |   `-- analytics.js
    |-- public/
    |   `-- favicon.svg
    |-- .env                     VITE_API_URL=http://localhost:8000
    |-- index.html
    |-- package.json
    |-- vite.config.js
    |-- tailwind.config.js
    `-- postcss.config.js
```

---

## Setup and Installation

### Prerequisites

- Python 3.10 or higher
- Node.js 18 or higher and npm
- A PostgreSQL database ([Neon](https://neon.tech/) free tier recommended)

### 1. Clone the Repository

```bash
git clone https://github.com/AkshitaGaur-hub/Student_OS.git
cd Student_OS
```

### 2. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate       # Windows
source venv/bin/activate    # macOS / Linux

# Install dependencies
pip install -r requirements.txt
```

Create `backend/.env` with the following variables:

```env
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
JWT_SECRET=replace-with-a-long-random-secret
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
```

```bash
# Create database tables
python migrate.py

# (Optional) Seed the database with sample data
python seed.py
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:8000
```

---

## Running the Application

### Start the Backend

```bash
cd backend
venv\Scripts\activate       # Windows
uvicorn app.main:app --reload --port 8000
```

Backend API available at: `http://localhost:8000`

### Start the Frontend

```bash
cd frontend
npm run dev
```

Frontend app available at: `http://localhost:5173`

### Build for Production

```bash
cd frontend
npm run build
```

---

## API Documentation

| Interface | URL |
|---|---|
| Swagger UI (interactive) | http://localhost:8000/docs |
| ReDoc (readable reference) | http://localhost:8000/redoc |
| Health Check | http://localhost:8000/health |

---

## Future Scope

- Email notifications for event registration and ticket confirmation
- PDF and CSV export for financial reports and member lists
- Real-time announcements via WebSockets
- OAuth 2.0 / SSO integration with university identity providers
- Mobile app (React Native) for on-the-go member access
- Multi-organization support — one platform, multiple clubs and societies
- Advanced analytics with per-event revenue breakdown and membership growth trends

---

## Contributors

| Name | Role |
|---|---|
| Akshita  | Full Stack Developer |
| Garima Verma| Frontend Developer |
| Mamta Bhati | Backend Developer |

---

> Built to simplify and streamline how student organizations operate, communicate, and grow.
