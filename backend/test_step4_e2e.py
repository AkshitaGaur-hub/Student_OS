"""
Comprehensive End-to-End (E2E) Test Suite for Step 4
Tests the complete student journey and all business workflows:
Register/Login -> Membership -> Ticket Purchase -> Check-In ->
Merchandise Order & Stock Deduction -> Fundraiser Tasks ->
Finance -> Dashboard Analytics.
"""

import sys
import time
import requests

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
        except Exception:
            print(f"         Body: {response.text[:200]}")
    return response


def run_tests():
    global PASS, FAIL
    ts = int(time.time())

    print("=" * 65)
    print("1. SYSTEM & DOCS VERIFICATION")
    print("=" * 65)
    test("GET /", requests.get(f"{BASE}/"), 200)
    test("GET /health", requests.get(f"{BASE}/health"), 200, lambda r: r.json().get("database") == "connected")
    test("GET /docs", requests.get(f"{BASE}/docs"), 200)

    # ─── 2. AUTHENTICATION & ROLES ─────────────────────────────────
    print("\n" + "=" * 65)
    print("2. AUTHENTICATION & ROLE TOKENS")
    print("=" * 65)

    # Login with seeded demo accounts
    r_admin = test("Login seeded Admin", requests.post(f"{BASE}/auth/login", json={"email": "admin@org.edu", "password": "password123"}), 200)
    admin_token = r_admin.json()["access_token"]
    admin_h = {"Authorization": f"Bearer {admin_token}"}

    r_org = test("Login seeded Organizer", requests.post(f"{BASE}/auth/login", json={"email": "organizer@org.edu", "password": "password123"}), 200)
    org_token = r_org.json()["access_token"]
    org_h = {"Authorization": f"Bearer {org_token}"}

    r_tres = test("Login seeded Treasurer", requests.post(f"{BASE}/auth/login", json={"email": "treasurer@org.edu", "password": "password123"}), 200)
    tres_token = r_tres.json()["access_token"]
    tres_h = {"Authorization": f"Bearer {tres_token}"}

    # Register a new student for E2E flow
    student_email = f"e2e_student_{ts}@org.edu"
    r_reg = test("Register new student", requests.post(f"{BASE}/auth/register", json={
        "name": "E2E Student", "email": student_email, "password": "studentpass123", "role": "student"
    }), 201)
    new_student_id = r_reg.json()["id"]

    r_stud = test("Login new student", requests.post(f"{BASE}/auth/login", json={"email": student_email, "password": "studentpass123"}), 200)
    student_token = r_stud.json()["access_token"]
    student_h = {"Authorization": f"Bearer {student_token}"}

    test("Verify /auth/me with student token", requests.get(f"{BASE}/auth/me", headers=student_h), 200,
         lambda r: r.json()["email"] == student_email)

    # ─── 3. MEMBERSHIP WORKFLOW ────────────────────────────────────
    print("\n" + "=" * 65)
    print("3. MEMBERSHIP REGISTRATION & ACCESS")
    print("=" * 65)
    r_mem = test("Admin registers student as Member", requests.post(f"{BASE}/members/", json={
        "user_id": new_student_id,
        "student_id": f"STU-E2E-{ts}",
        "department": "Computer Science",
        "year_of_study": 3,
        "phone": "+1-555-9999",
        "membership_status": "active"
    }, headers=admin_h), 201)
    e2e_member_id = r_mem.json()["id"]

    test("Get Member details", requests.get(f"{BASE}/members/{e2e_member_id}", headers=student_h), 200,
         lambda r: r.json()["student_id"] == f"STU-E2E-{ts}")

    # ─── 4. EVENT & TICKET WORKFLOW (Check-in & Capacity) ─────────
    print("\n" + "=" * 65)
    print("4. EVENT CREATION, TICKET PURCHASE & CHECK-IN")
    print("=" * 65)
    r_evt = test("Organizer creates limited capacity event (capacity=2)", requests.post(f"{BASE}/events/", json={
        "title": f"E2E Limited Hackathon {ts}",
        "description": "Exclusive coding event with limited seats",
        "venue": "Lab 101",
        "event_date": "2026-11-20T10:00:00Z",
        "max_capacity": 2,
        "ticket_price": 10.00,
        "non_member_price": 20.00
    }, headers=org_h), 201)
    e2e_event_id = r_evt.json()["id"]

    # Purchase ticket 1
    r_tkt1 = test("Student purchases Ticket 1", requests.post(f"{BASE}/tickets/", json={
        "event_id": e2e_event_id,
        "member_id": e2e_member_id
    }, headers=student_h), 201, lambda r: r.json()["price_paid"] == 10.00 and r.json()["ticket_code"].startswith("TKT-"))
    tkt1_id = r_tkt1.json()["id"]
    tkt1_code = r_tkt1.json()["ticket_code"]

    # Check-in ticket 1
    test("Check-in Ticket 1", requests.post(f"{BASE}/tickets/{tkt1_id}/check-in", headers=org_h), 200,
         lambda r: r.json()["checked_in"] is True and r.json()["status"] == "checked_in")

    # Prevent duplicate check-in
    test("Reject Duplicate Check-in for Ticket 1", requests.post(f"{BASE}/tickets/{tkt1_id}/check-in", headers=org_h), 400)

    # ─── 5. ANNOUNCEMENTS WORKFLOW ─────────────────────────────────
    print("\n" + "=" * 65)
    print("5. ANNOUNCEMENTS (Role Protected)")
    print("=" * 65)
    r_ann = test("Organizer posts announcement", requests.post(f"{BASE}/announcements/", json={
        "title": f"Hackathon Update {ts}",
        "content": "Check-in is now open at Lab 101.",
        "priority": "high",
        "target_audience": "all"
    }, headers=org_h), 201)
    ann_id = r_ann.json()["id"]

    test("Student denied creating announcement", requests.post(f"{BASE}/announcements/", json={
        "title": "Unauthorized", "content": "test"
    }, headers=student_h), 403)

    test("List announcements (Student)", requests.get(f"{BASE}/announcements/", headers=student_h), 200,
         lambda r: len(r.json()) >= 1)

    # ─── 6. MERCHANDISE & STOCK DEDUCTION ──────────────────────────
    print("\n" + "=" * 65)
    print("6. MERCHANDISE & INVENTORY DEDUCTION")
    print("=" * 65)
    r_prod = test("Admin creates product with stock=5", requests.post(f"{BASE}/products", json={
        "name": f"E2E Limited Jersey {ts}",
        "description": "Exclusive hackathon jersey",
        "price": 30.00,
        "stock": 5,
        "size": "L",
        "category": "Apparel"
    }, headers=admin_h), 201)
    prod_id = r_prod.json()["id"]

    # Student purchases 2 units
    r_ord = test("Student orders 2 Jerseys (Total=$60)", requests.post(f"{BASE}/orders", json={
        "member_id": e2e_member_id,
        "items": [{"product_id": prod_id, "quantity": 2}]
    }, headers=student_h), 201, lambda r: r.json()["total_amount"] == 60.00)

    # Verify inventory reduced from 5 to 3
    test("Verify Stock Decreased to 3", requests.get(f"{BASE}/products", headers=student_h), 200,
         lambda r: any(p["id"] == prod_id and p["stock"] == 3 for p in r.json()))

    # Attempt to order more than available stock (4 units when only 3 remain)
    test("Reject Order Exceeding Stock (Quantity=4)", requests.post(f"{BASE}/orders", json={
        "member_id": e2e_member_id,
        "items": [{"product_id": prod_id, "quantity": 4}]
    }, headers=student_h), 400)

    # ─── 7. FUNDRAISER & TASK WORKFLOW ─────────────────────────────
    print("\n" + "=" * 65)
    print("7. FUNDRAISER & TASKS MANAGEMENT")
    print("=" * 65)
    r_fund = test("Treasurer creates Fundraiser ($2000 goal)", requests.post(f"{BASE}/fundraisers", json={
        "title": f"Robotics Kit Fund {ts}",
        "description": "Purchasing kits for freshman robotics club",
        "goal_amount": 2000.00,
        "start_date": "2026-10-01T00:00:00Z"
    }, headers=tres_h), 201)
    fund_id = r_fund.json()["id"]

    r_task = test("Organizer assigns Task on Fundraiser", requests.post(f"{BASE}/fundraisers/{fund_id}/tasks", json={
        "title": "Contact Parts Supplier",
        "description": "Request 15% educational discount",
        "assigned_to": new_student_id,
        "status": "pending"
    }, headers=org_h), 201)
    task_id = r_task.json()["id"]

    test("Update Task Status to in_progress", requests.put(f"{BASE}/fundraiser-tasks/{task_id}", json={
        "status": "in_progress"
    }, headers=student_h), 200, lambda r: r.json()["status"] == "in_progress")

    # ─── 8. FINANCE & SUMMARY ──────────────────────────────────────
    print("\n" + "=" * 65)
    print("8. FINANCE (Income, Expenses, Reimbursements & Summary)")
    print("=" * 65)
    test("Treasurer records Income ($500)", requests.post(f"{BASE}/finance/income", json={
        "source": "Alumni Donation",
        "amount": 500.00,
        "category": "donation",
        "received_date": "2026-10-03T10:00:00Z"
    }, headers=tres_h), 201)

    test("Treasurer records Expense ($120)", requests.post(f"{BASE}/finance/expenses", json={
        "description": "Event Lanyards & Badges",
        "amount": 120.00,
        "category": "supplies",
        "vendor": "Office Depot",
        "expense_date": "2026-10-03T11:00:00Z"
    }, headers=tres_h), 201)

    test("Student submits Reimbursement ($35)", requests.post(f"{BASE}/finance/reimbursements", json={
        "requested_by": "E2E Student",
        "description": "Coffee for morning standup",
        "amount": 35.00
    }, headers=student_h), 201)

    test("Student denied Finance Summary", requests.get(f"{BASE}/finance/summary", headers=student_h), 403)

    test("Treasurer retrieves Finance Summary", requests.get(f"{BASE}/finance/summary", headers=tres_h), 200,
         lambda r: r.json()["total_income"] > 0 and "balance" in r.json())

    # ─── 9. DASHBOARD SUMMARY ──────────────────────────────────────
    print("\n" + "=" * 65)
    print("9. DASHBOARD REAL-TIME ANALYTICS")
    print("=" * 65)
    test("Retrieve Dashboard Summary (Student/Any Authenticated User)", requests.get(f"{BASE}/dashboard/summary", headers=student_h), 200,
         lambda r: r.json()["total_members"] >= 4 and r.json()["tickets_sold"] >= 2 and r.json()["total_attendance"] >= 2)

    # ─── 10. CLEANUP & TEARDOWN ────────────────────────────────────
    print("\n" + "=" * 65)
    print("10. ROLE-BASED CLEANUP")
    print("=" * 65)
    test("Organizer deletes announcement", requests.delete(f"{BASE}/announcements/{ann_id}", headers=org_h), 204)

    print("\n" + "=" * 65)
    print(f"FINAL RESULT: {PASS} passed, {FAIL} failed out of {PASS + FAIL} tests")
    print("=" * 65)
    sys.exit(0 if FAIL == 0 else 1)


if __name__ == "__main__":
    run_tests()

