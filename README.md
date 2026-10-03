### Student_OS

# Student Organization System

## Team Task Allocation & Development Responsibilities

### 👥 Team Structure

| Role                                 | Main Responsibility                                       | Primary Tech                |
| ------------------------------------ | --------------------------------------------------------- | --------------------------- |
| **Frontend Developer**               | UI, pages, user interactions, API integration             | React, Tailwind CSS, Axios  |
| **Backend Developer**                | APIs, authentication, business logic                      | FastAPI, Python, SQLAlchemy |
| **Database & Integration Developer** | Database, relationships, seed data, testing & integration | PostgreSQL, SQLAlchemy      |

---

# 1. 🎨 FRONTEND DEVELOPER

## Main Responsibility

Build the complete user interface and connect it with the backend APIs.

The frontend developer should **not create fake/static data for the final application**. All important data should come from the backend API.

---

## A. Project Setup

* [ ] Create React/Vite project
* [ ] Configure Tailwind CSS
* [ ] Configure React Router
* [ ] Configure Axios
* [ ] Configure Lucide React icons
* [ ] Create global layout
* [ ] Create responsive navbar/sidebar
* [ ] Create reusable UI components

### Reusable Components

* [ ] Button
* [ ] Input
* [ ] Select
* [ ] Modal
* [ ] Card
* [ ] Table
* [ ] Badge
* [ ] Search bar
* [ ] Pagination
* [ ] Toast/notification
* [ ] Loading state
* [ ] Empty state
* [ ] Confirmation dialog

---

# B. Authentication UI

### Pages

* [ ] Login
* [ ] Register (if required)
* [ ] Forgot password UI (optional)
* [ ] Profile

### Authentication Tasks

* [ ] Store JWT token
* [ ] Send token with API requests
* [ ] Protected routes
* [ ] Redirect unauthenticated users
* [ ] Show UI based on user role

### Roles

* Admin / President
* Treasurer
* Volunteer
* Member

---

# C. Member Management

### Admin Pages

* [ ] Members dashboard
* [ ] Members table
* [ ] Add member
* [ ] Edit member
* [ ] View member details
* [ ] Search members
* [ ] Filter members
* [ ] Active members
* [ ] Expired members
* [ ] Expiring-soon members

### Member Details

Display:

* Name
* Email
* Phone
* Membership status
* Join date
* Expiry date
* Payment status
* Membership history

---

# D. Events

### Admin

* [ ] Create event
* [ ] Edit event
* [ ] Delete/cancel event
* [ ] Set event capacity
* [ ] Set member ticket price
* [ ] Set non-member ticket price
* [ ] View event statistics

### Member

* [ ] Browse events
* [ ] View event details
* [ ] Purchase ticket
* [ ] View purchased tickets

---

# E. Ticket & QR System

This should be one of the main demo features.

* [ ] Generate/display QR ticket
* [ ] My Tickets page
* [ ] Ticket details
* [ ] QR check-in page
* [ ] Check-in success state
* [ ] Already checked-in state
* [ ] Invalid ticket state
* [ ] Event capacity indicator
* [ ] Attendance count

### Event Dashboard

Show:

```text
Capacity:       200
Tickets Sold:   157
Checked In:     121
Revenue:        ₹31,400
```

---

# F. Announcements

* [ ] Announcement list
* [ ] Create announcement
* [ ] Edit announcement
* [ ] Delete announcement
* [ ] View announcement
* [ ] Show announcement date
* [ ] Show author
* [ ] Member announcement feed

---

# G. Merchandise

### Product Pages

* [ ] Product list
* [ ] Product details
* [ ] Product size selection
* [ ] Stock availability
* [ ] Add to cart
* [ ] Cart page
* [ ] Checkout
* [ ] Order confirmation

### Admin

* [ ] Add product
* [ ] Edit product
* [ ] Delete product
* [ ] Update stock
* [ ] View orders
* [ ] View sales

---

# H. Fundraiser

* [ ] Fundraiser dashboard
* [ ] Create fundraiser
* [ ] Create tasks
* [ ] Assign task to volunteer
* [ ] Task status
* [ ] Progress indicator
* [ ] Task owner

Example:

```text
Fundraiser: Spring Charity Drive

████████████░░░░ 75%

Tasks:
✓ Sponsorship       Rahul
✓ Posters           Akshita
○ Venue             Priya
○ Promotion         Rahul
```

---

# I. Finance Dashboard

### Display

* [ ] Total income
* [ ] Total expenses
* [ ] Current balance
* [ ] Ticket revenue
* [ ] Membership revenue
* [ ] Merchandise revenue
* [ ] Fundraiser income
* [ ] Expenses
* [ ] Reimbursements

### Charts

* [ ] Income vs expenses
* [ ] Revenue by category
* [ ] Event revenue
* [ ] Monthly financial overview

Use:

```text
Recharts
```

---

# J. Dashboard

Create a useful dashboard rather than just displaying random cards.

### Admin Dashboard

```text
Members
Active / Expiring / Expired

Upcoming Events
Tickets Sold
Event Capacity

Revenue
Expenses
Balance

Pending Actions
Low Stock
Expiring Memberships
Pending Reimbursements
```

---

# K. Frontend API Integration

The frontend developer must integrate with backend endpoints.

Example:

```text
POST   /auth/login

GET    /members
POST   /members
PUT    /members/{id}

GET    /events
POST   /events

POST   /tickets
GET    /tickets/my
POST   /tickets/{id}/check-in

GET    /announcements
POST   /announcements

GET    /products
POST   /orders

GET    /finance/summary
```

The exact API contract will be finalized by all 3 team members before development.

---

# 2. ⚙️ BACKEND DEVELOPER

## Main Responsibility

Build the complete API, authentication, authorization and business logic.

The backend must make sure that the application rules are enforced **server-side**, not only by the frontend.

---

# A. Backend Setup

* [ ] Create FastAPI project
* [ ] Configure PostgreSQL connection
* [ ] Configure SQLAlchemy
* [ ] Configure Pydantic
* [ ] Configure environment variables
* [ ] Configure CORS
* [ ] Create API structure
* [ ] Configure Swagger/OpenAPI

Suggested structure:

```text
backend/
└── app/
    ├── models/
    ├── schemas/
    ├── routers/
    ├── services/
    ├── database.py
    └── main.py
```

---

# B. Authentication

Implement:

* [ ] User registration
* [ ] Login
* [ ] Password hashing
* [ ] JWT generation
* [ ] JWT validation
* [ ] Current-user dependency
* [ ] Role-based authorization

Example:

```text
Admin
  ↓
Can manage everything

Treasurer
  ↓
Finance + relevant financial records

Volunteer
  ↓
Assigned tasks + event operations

Member
  ↓
Membership + tickets + merchandise
```

---

# C. Member APIs

Implement:

```text
POST   /members
GET    /members
GET    /members/{id}
PUT    /members/{id}
DELETE /members/{id}
```

Business logic:

* [ ] Membership status
* [ ] Join date
* [ ] Expiry date
* [ ] Payment status
* [ ] Membership renewal
* [ ] Expiring membership detection

---

# D. Event APIs

Implement:

```text
POST   /events
GET    /events
GET    /events/{id}
PUT    /events/{id}
DELETE /events/{id}
```

Business rules:

* [ ] Capacity cannot be exceeded
* [ ] Ticket price differs for member/non-member
* [ ] Event date validation
* [ ] Only authorized roles can create/manage events

---

# E. Ticket APIs

Implement:

```text
POST   /tickets
GET    /tickets/my
GET    /tickets/{id}
POST   /tickets/{id}/check-in
```

Business logic:

* [ ] Generate unique ticket
* [ ] Generate QR data
* [ ] Check event capacity
* [ ] Prevent duplicate ticket
* [ ] Prevent duplicate check-in
* [ ] Validate ticket
* [ ] Update attendance
* [ ] Calculate event revenue

---

# F. Announcement APIs

```text
POST   /announcements
GET    /announcements
GET    /announcements/{id}
PUT    /announcements/{id}
DELETE /announcements/{id}
```

Store:

* Title
* Content
* Author
* Created time
* Updated time

---

# G. Merchandise APIs

Implement:

```text
GET    /products
POST   /products
PUT    /products/{id}
DELETE /products/{id}

POST   /orders
GET    /orders
GET    /orders/my
GET    /orders/{id}
```

Business logic:

* [ ] Check stock
* [ ] Prevent negative stock
* [ ] Decrease stock after successful order
* [ ] Store size
* [ ] Calculate order total
* [ ] Store payment status

---

# H. Fundraiser APIs

```text
POST   /fundraisers
GET    /fundraisers
POST   /fundraisers/{id}/tasks
PUT    /tasks/{id}
DELETE /tasks/{id}
```

Business logic:

* [ ] Assign volunteer
* [ ] Task status
* [ ] Progress calculation
* [ ] Task ownership

---

# I. Finance APIs

Implement:

```text
GET    /finance/summary
GET    /finance/income
POST   /finance/income

GET    /finance/expenses
POST   /finance/expenses

GET    /finance/reimbursements
POST   /finance/reimbursements
PUT    /finance/reimbursements/{id}
```

Calculate:

```text
Balance =
Total Income - Total Expenses
```

Income categories:

* Membership
* Tickets
* Merchandise
* Fundraiser

Expense categories:

* Event
* Merchandise
* Operations
* Reimbursement
* Other

---

# J. Analytics APIs

Create endpoints for dashboard data:

```text
GET /analytics/dashboard
GET /analytics/events
GET /analytics/revenue
GET /analytics/members
```

Return data that the frontend can directly use for charts.

---

# K. Backend Validation & Security

* [ ] Validate request data
* [ ] Validate user permissions
* [ ] Handle invalid IDs
* [ ] Handle duplicate records
* [ ] Handle database errors
* [ ] Prevent unauthorized access
* [ ] Never trust frontend role information
* [ ] Never allow negative inventory
* [ ] Never allow ticket sales beyond capacity

---

# 3. 🗄️ DATABASE & INTEGRATION DEVELOPER

## Main Responsibility

Design and maintain the PostgreSQL database, relationships, constraints, seed data and integration/testing support.

This role is **not just "make tables."**

The database developer should make sure that the backend has a reliable database and realistic data for the frontend demo.

---

# A. Database Setup

* [ ] Create PostgreSQL database
* [ ] Configure database credentials
* [ ] Connect PostgreSQL with SQLAlchemy
* [ ] Configure `database.py`
* [ ] Test connection
* [ ] Create environment variables

Example:

```env
DATABASE_URL=postgresql://...
```

---

# B. Database Models

Create/maintain models for:

```text
User
Member
Event
Ticket
Announcement
Product
Order
OrderItem
Fundraiser
FundraiserTask
Income
Expense
Reimbursement
```

---

# C. Relationships

Define relationships correctly.

Example:

```text
User
 │
 └── Member

Member
 │
 ├── Tickets
 └── Orders

Event
 │
 └── Tickets

Order
 │
 └── OrderItems

Product
 │
 └── OrderItems

Fundraiser
 │
 └── FundraiserTasks
```

---

# D. Database Constraints

Implement important constraints.

### Membership

* [ ] Valid user/member relationship
* [ ] Valid membership dates

### Tickets

* [ ] Unique ticket ID
* [ ] Prevent duplicate check-in

### Events

* [ ] Valid capacity
* [ ] Valid prices

### Products

* [ ] Stock cannot become negative

### Orders

* [ ] Valid product
* [ ] Valid quantity
* [ ] Correct order total

### Finance

* [ ] Valid amount
* [ ] Valid category

---

# E. Seed Data

Create:

```text
backend/seed.py
```

Seed realistic demo data.

### Users

```text
Admin
Treasurer
Volunteer
Member
```

### Members

Create approximately:

```text
20–30 members
```

with a mixture of:

```text
Active
Expiring Soon
Expired
```

### Events

Create:

```text
Spring Gala
Sports Day
Cultural Night
Fundraiser
```

### Tickets

Create some:

```text
Purchased
Checked-in
Not checked-in
```

### Merchandise

Create:

```text
T-Shirts
Hoodies
Caps
```

with different:

```text
sizes
prices
stock levels
```

### Finance

Create realistic:

```text
Membership income
Ticket income
Merchandise income
Event expenses
Reimbursements
```

The dashboard should look populated immediately after running the seed script.

---

# F. Database Queries

Help backend developer create efficient queries for:

* [ ] Active members
* [ ] Expired members
* [ ] Expiring memberships
* [ ] Event attendance
* [ ] Event revenue
* [ ] Merchandise sales
* [ ] Current inventory
* [ ] Total income
* [ ] Total expenses
* [ ] Current balance
* [ ] Pending reimbursements
* [ ] Fundraiser progress

---

# G. API Testing

Work with the backend developer to test:

* [ ] Authentication
* [ ] Members
* [ ] Events
* [ ] Tickets
* [ ] QR check-in
* [ ] Announcements
* [ ] Products
* [ ] Orders
* [ ] Fundraisers
* [ ] Finance

Use:

```text
Swagger
Postman
```

---

# H. Integration Responsibility

The database/integration developer should also help connect:

```text
Frontend
    ↓
Backend API
    ↓
PostgreSQL
```

Tasks:

* [ ] Verify API responses
* [ ] Verify database records
* [ ] Check frontend data matches database
* [ ] Test complete user flows
* [ ] Find broken API integrations
* [ ] Help resolve merge conflicts
* [ ] Help with deployment database
* [ ] Verify production environment variables

---

# 4. 🔗 SHARED RESPONSIBILITIES

Some things should **NOT belong to only one person**.

## API Contract

Before coding, all 3 members agree on:

```text
Endpoint
HTTP Method
Request body
Response body
Authentication
Required role
Error responses
```

Example:

```text
POST /events

Request:
{
    "name": "Spring Gala",
    "date": "...",
    "venue": "Main Hall",
    "capacity": 200,
    "member_price": 150,
    "non_member_price": 250
}

Response:
{
    "id": 1,
    "name": "Spring Gala",
    "capacity": 200
}
```

---

# 5. 🔄 END-TO-END DEMO FLOW

The final application should support this complete flow:

```text
Student
   ↓
Creates account
   ↓
Becomes member
   ↓
Pays membership
   ↓
Browses Spring Gala
   ↓
Buys ticket
   ↓
Receives QR ticket
   ↓
Arrives at event
   ↓
QR scanned
   ↓
Attendance updated
   ↓
Event revenue updated
   ↓
Student buys merchandise
   ↓
Inventory decreases
   ↓
Order revenue recorded
   ↓
Treasurer opens dashboard
   ↓
Sees income + expenses + balance
```

This is the **main integration test** for the entire team.

---

# 6. 🚨 24-HOUR PRIORITY

## P0 — MUST WORK

### Frontend

* [ ] Login
* [ ] Dashboard
* [ ] Members
* [ ] Events
* [ ] Ticket purchase
* [ ] QR ticket
* [ ] QR check-in
* [ ] Announcements
* [ ] Merchandise
* [ ] Finance dashboard

### Backend

* [ ] Authentication
* [ ] Members API
* [ ] Events API
* [ ] Tickets API
* [ ] Check-in API
* [ ] Products API
* [ ] Orders API
* [ ] Finance API
* [ ] Role authorization

### Database

* [ ] PostgreSQL
* [ ] All core models
* [ ] Relationships
* [ ] Constraints
* [ ] Seed data
* [ ] Database testing

---

# P1 — SHOULD WORK

* [ ] Fundraiser
* [ ] Reimbursements
* [ ] Membership renewal
* [ ] Analytics
* [ ] Low-stock alerts
* [ ] Expiring membership alerts

---

# P2 — ONLY IF TIME REMAINS

* [ ] AI assistant
* [ ] Email notifications
* [ ] Advanced analytics
* [ ] Animations
* [ ] Dark mode
* [ ] Advanced filtering
* [ ] PDF reports

---

# 7. 🚫 IMPORTANT RULES

### Frontend

Do NOT:

* Hardcode important business data
* Fake API responses for final demo
* Implement business rules only on frontend

### Backend

Do NOT:

* Trust frontend permissions
* Allow invalid data
* Skip authentication
* Allow duplicate check-ins
* Allow sales beyond capacity

### Database

Do NOT:

* Create unnecessary duplicate tables
* Store everything as plain strings
* Skip relationships
* Allow negative stock
* Seed unrealistic/empty data

---

# 8. 🏁 DEFINITION OF DONE

A feature is considered **DONE** only when:

```text
Frontend UI
     ↓
API
     ↓
Backend Logic
     ↓
Database
     ↓
Real Response
     ↓
Frontend Update
```

works successfully.

For example, **Ticket Purchase is NOT done** just because the frontend has a "Buy Ticket" button.

It is done only when:

```text
Buy Ticket
   ↓
POST /tickets
   ↓
Backend validates capacity
   ↓
Database creates ticket
   ↓
QR ticket generated
   ↓
Frontend displays ticket
```

and then:

```text
QR Scan
   ↓
POST /tickets/{id}/check-in
   ↓
Backend validates ticket
   ↓
Database marks checked-in
   ↓
Attendance increases
   ↓
Dashboard updates
```

---

# 9. 👥 FINAL OWNERSHIP

| Feature         | Frontend | Backend | Database |
| --------------- | :------: | :-----: | :------: |
| Authentication  |     ✅    |    ✅    |    🔸    |
| Members         |     ✅    |    ✅    |     ✅    |
| Events          |     ✅    |    ✅    |     ✅    |
| Tickets         |     ✅    |    ✅    |     ✅    |
| QR Check-in     |     ✅    |    ✅    |     ✅    |
| Announcements   |     ✅    |    ✅    |     ✅    |
| Merchandise     |     ✅    |    ✅    |     ✅    |
| Orders          |     ✅    |    ✅    |     ✅    |
| Fundraiser      |     ✅    |    ✅    |     ✅    |
| Finance         |     ✅    |    ✅    |     ✅    |
| Analytics       |     ✅    |    ✅    |    🔸    |
| Seed Data       |    🔸    |    🔸   |     ✅    |
| API Testing     |    🔸    |    ✅    |     ✅    |
| UI/UX           |     ✅    |    🔸   |    🔸    |
| Business Logic  |    🔸    |    ✅    |    🔸    |
| DB Architecture |    🔸    |    🔸   |     ✅    |
| Integration     |     ✅    |    ✅    |     ✅    |
| Deployment      |     ✅    |    ✅    |     ✅    |

**Legend:**

* ✅ = Primary responsibility
* 🔸 = Support responsibility

---

# 🎯 TEAM GOAL

Don't build three separate projects.

Build **one connected system**:

```text
              STUDENT ORGANIZATION SYSTEM

        ┌────────────── FRONTEND ──────────────┐
        │                                      │
        │ Members • Events • Tickets • Shop   │
        │ Announcements • Finance • Dashboard │
        │                                      │
        └─────────────────┬────────────────────┘
                          │
                         API
                          │
        ┌─────────────────▼────────────────────┐
        │              BACKEND                 │
        │                                      │
        │ Auth • Business Logic • Validation  │
        │ Tickets • Orders • Finance • APIs   │
        │                                      │
        └─────────────────┬────────────────────┘
                          │
                       SQLAlchemy
                          │
        ┌─────────────────▼────────────────────┐
        │             POSTGRESQL               │
        │                                      │
        │ Users • Members • Events • Tickets  │
        │ Products • Orders • Finance         │
        │ Fundraisers • Announcements         │
        │                                      │
        └──────────────────────────────────────┘
```

**The goal for the 24-hour hackathon is not maximum number of features. The goal is a small number of features that are actually connected and demonstrable end-to-end.**
