import requests
import json
import sys

BASE = "http://localhost:8000"
PASS = 0
FAIL = 0

def test(name, response, expected_status, check_fn=None):
    global PASS, FAIL
    ok = response.status_code == expected_status
    extra = ""
    if ok and check_fn:
        try:
            ok = check_fn(response)
        except Exception as e:
            ok = False
            extra = f" | check error: {e}"
    status = "PASS" if ok else "FAIL"
    if ok:
        PASS += 1
    else:
        FAIL += 1
    print(f"  [{status}] {name} - HTTP {response.status_code} (expected {expected_status}){extra}")
    if not ok:
        try:
            print(f"         Body: {response.json()}")
        except:
            print(f"         Body: {response.text[:200]}")
    return response


# ──────────────────────────────────────────
print("=" * 60)
print("1. EXISTING ENDPOINTS")
print("=" * 60)
test("GET /", requests.get(f"{BASE}/"), 200)
test("GET /health", requests.get(f"{BASE}/health"), 200,
     lambda r: r.json().get("database") == "connected")
test("GET /docs", requests.get(f"{BASE}/docs"), 200)

# ──────────────────────────────────────────
print("\n" + "=" * 60)
print("2. AUTHENTICATION")
print("=" * 60)

import time
ts = int(time.time())
admin_email = f"admin_{ts}@test.com"
org_email = f"org_{ts}@test.com"
student_email = f"student_{ts}@test.com"

# Register admin
r = test("Register admin user",
    requests.post(f"{BASE}/auth/register", json={
        "name": "Admin User", "email": admin_email,
        "password": "adminpassword123", "role": "admin"
    }), 201)
admin_id = r.json().get("id")

# Register organizer
r = test("Register organizer",
    requests.post(f"{BASE}/auth/register", json={
        "name": "Org User", "email": org_email,
        "password": "orgpassword123", "role": "organizer"
    }), 201)
org_id = r.json().get("id")

# Register student
r = test("Register student",
    requests.post(f"{BASE}/auth/register", json={
        "name": "Student User", "email": student_email,
        "password": "studentpassword123", "role": "student"
    }), 201)
student_id = r.json().get("id")

# Duplicate email
test("Duplicate email rejected",
    requests.post(f"{BASE}/auth/register", json={
        "name": "Dup", "email": admin_email,
        "password": "dup12345", "role": "student"
    }), 409)

# Invalid role
test("Invalid role rejected",
    requests.post(f"{BASE}/auth/register", json={
        "name": "Bad", "email": f"bad_{ts}@test.com",
        "password": "bad12345", "role": "superuser"
    }), 400)

# Login admin
r = test("Login admin",
    requests.post(f"{BASE}/auth/login", json={
        "email": admin_email, "password": "adminpassword123"
    }), 200, lambda r: "access_token" in r.json())
admin_token = r.json().get("access_token", "")

# Login organizer
r = test("Login organizer",
    requests.post(f"{BASE}/auth/login", json={
        "email": org_email, "password": "orgpassword123"
    }), 200)
org_token = r.json().get("access_token", "")

# Login student
r = test("Login student",
    requests.post(f"{BASE}/auth/login", json={
        "email": student_email, "password": "studentpassword123"
    }), 200)
student_token = r.json().get("access_token", "")

# Wrong password
test("Wrong password rejected",
    requests.post(f"{BASE}/auth/login", json={
        "email": admin_email, "password": "wrongpassword"
    }), 401)

# /auth/me with valid token
test("GET /auth/me with JWT",
    requests.get(f"{BASE}/auth/me",
        headers={"Authorization": f"Bearer {admin_token}"}
    ), 200, lambda r: r.json().get("email") == admin_email)

# /auth/me without token
test("GET /auth/me without JWT rejected",
    requests.get(f"{BASE}/auth/me"), 401)

# /auth/me with invalid token
test("GET /auth/me with invalid JWT rejected",
    requests.get(f"{BASE}/auth/me",
        headers={"Authorization": "Bearer invalidtoken123"}
    ), 401)

admin_headers = {"Authorization": f"Bearer {admin_token}"}
org_headers = {"Authorization": f"Bearer {org_token}"}
student_headers = {"Authorization": f"Bearer {student_token}"}

# ──────────────────────────────────────────
print("\n" + "=" * 60)
print("3. MEMBER CRUD")
print("=" * 60)

# Create member (admin)
student_code = f"STU_{ts}"
r = test("Create member (admin)",
    requests.post(f"{BASE}/members/", json={
        "user_id": student_id, "student_id": student_code,
        "department": "Computer Science", "year_of_study": 2
    }, headers=admin_headers), 201)
member_id = r.json().get("id")

# Create member (student — should fail)
test("Create member (student role denied)",
    requests.post(f"{BASE}/members/", json={
        "user_id": admin_id, "student_id": f"STU2_{ts}",
        "department": "Math"
    }, headers=student_headers), 403)

# List members
test("List members",
    requests.get(f"{BASE}/members/", headers=admin_headers), 200,
    lambda r: len(r.json()) >= 1)

# Get member by ID
test("Get member by ID",
    requests.get(f"{BASE}/members/{member_id}", headers=admin_headers), 200,
    lambda r: r.json().get("student_id") == student_code)

# Update member (organizer)
test("Update member (organizer)",
    requests.put(f"{BASE}/members/{member_id}", json={
        "department": "Data Science", "year_of_study": 3
    }, headers=org_headers), 200,
    lambda r: r.json().get("department") == "Data Science")

# Get members without auth
test("Get members without auth rejected",
    requests.get(f"{BASE}/members/"), 401)

# ──────────────────────────────────────────
print("\n" + "=" * 60)
print("4. EVENT CRUD")
print("=" * 60)

# Create event (admin)
r = test("Create event (admin)",
    requests.post(f"{BASE}/events/", json={
        "title": "Hackathon 2026",
        "description": "24-hour coding marathon",
        "venue": "Main Hall",
        "event_date": "2026-11-15T09:00:00Z",
        "max_capacity": 200,
        "ticket_price": 10.00,
        "non_member_price": 15.00
    }, headers=admin_headers), 201,
    lambda r: r.json().get("title") == "Hackathon 2026")
event_id = r.json().get("id")

# Create event (organizer)
r2 = test("Create event (organizer)",
    requests.post(f"{BASE}/events/", json={
        "title": "Workshop",
        "event_date": "2026-12-01T14:00:00Z",
        "ticket_price": 0,
        "max_capacity": 50
    }, headers=org_headers), 201)
event_id_2 = r2.json().get("id")

# Create event (student — should fail)
test("Create event (student role denied)",
    requests.post(f"{BASE}/events/", json={
        "title": "Unauthorized",
        "event_date": "2026-12-01T14:00:00Z",
        "ticket_price": 0
    }, headers=student_headers), 403)

# List events
test("List events",
    requests.get(f"{BASE}/events/", headers=admin_headers), 200,
    lambda r: len(r.json()) >= 2)

# Get event by ID
test("Get event by ID",
    requests.get(f"{BASE}/events/{event_id}", headers=admin_headers), 200,
    lambda r: r.json().get("venue") == "Main Hall")

# Update event
test("Update event",
    requests.put(f"{BASE}/events/{event_id}", json={
        "title": "Hackathon 2026 - Updated",
        "max_capacity": 300
    }, headers=admin_headers), 200,
    lambda r: r.json().get("max_capacity") == 300)

# Delete event (admin)
test("Delete event (admin)",
    requests.delete(f"{BASE}/events/{event_id_2}", headers=admin_headers), 204)

# Verify deleted
test("Verify deleted event returns 404",
    requests.get(f"{BASE}/events/{event_id_2}", headers=admin_headers), 404)

# Delete event (student — should fail)
test("Delete event (student role denied)",
    requests.delete(f"{BASE}/events/{event_id}", headers=student_headers), 403)

# Invalid event data — negative price
test("Negative price rejected",
    requests.post(f"{BASE}/events/", json={
        "title": "Bad Event",
        "event_date": "2026-12-01T14:00:00Z",
        "ticket_price": -5.00
    }, headers=admin_headers), 422)

# Invalid event data — zero capacity
test("Zero capacity rejected",
    requests.post(f"{BASE}/events/", json={
        "title": "Bad Event",
        "event_date": "2026-12-01T14:00:00Z",
        "ticket_price": 0,
        "max_capacity": 0
    }, headers=admin_headers), 422)

# Events without auth
test("Get events without auth rejected",
    requests.get(f"{BASE}/events/"), 401)

# ──────────────────────────────────────────
# Delete member (admin cleanup)
test("Delete member (admin)",
    requests.delete(f"{BASE}/members/{member_id}", headers=admin_headers), 204)

# Delete member (student — should fail)
test("Delete member (student role denied)",
    requests.delete(f"{BASE}/members/999", headers=student_headers), 403)

# ──────────────────────────────────────────
print("\n" + "=" * 60)
print(f"RESULTS: {PASS} passed, {FAIL} failed out of {PASS + FAIL} tests")
print("=" * 60)

sys.exit(0 if FAIL == 0 else 1)

