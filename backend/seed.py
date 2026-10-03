"""
Seed / Demo Data Script for Student Organization Management System
Populates realistic demo data across Users, Members, Events, Tickets,
Announcements, Products, Orders, Fundraisers, and Finance.
"""

from datetime import datetime, timedelta, timezone
from app.database import SessionLocal, engine, Base
from app.dependencies import hash_password
from app.models import (
    User, Member, Event, Ticket, Announcement,
    Product, Order, OrderItem,
    Fundraiser, FundraiserTask,
    Income, Expense, Reimbursement,
)


def seed_database():
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        print("[*] Seeding Student Organization Management System demo data...")

        # ─── 1. Users ───────────────────────────────────────────────
        users_data = [
            {"email": "admin@org.edu", "full_name": "Alice Admin", "role": "admin", "password": "password123"},
            {"email": "organizer@org.edu", "full_name": "Bob Organizer", "role": "organizer", "password": "password123"},
            {"email": "treasurer@org.edu", "full_name": "Charlie Treasurer", "role": "treasurer", "password": "password123"},
            {"email": "student1@org.edu", "full_name": "Diana Student", "role": "student", "password": "password123"},
            {"email": "student2@org.edu", "full_name": "Ethan Student", "role": "student", "password": "password123"},
            {"email": "student3@org.edu", "full_name": "Fiona Student", "role": "student", "password": "password123"},
        ]

        user_objs = {}
        for u in users_data:
            existing = db.query(User).filter(User.email == u["email"]).first()
            if not existing:
                user = User(
                    email=u["email"],
                    full_name=u["full_name"],
                    role=u["role"],
                    hashed_password=hash_password(u["password"]),
                    is_active=True,
                )
                db.add(user)
                db.flush()
                user_objs[u["email"]] = user
            else:
                user_objs[u["email"]] = existing
        print(f"  [+] Users verified ({len(user_objs)} users)")

        # ─── 2. Members ─────────────────────────────────────────────
        now = datetime.now(timezone.utc)
        members_data = [
            {
                "user_id": user_objs["student1@org.edu"].id,
                "student_id": "STU-2026-001",
                "department": "Computer Science",
                "year_of_study": 3,
                "phone": "+1-555-0101",
                "membership_status": "active",
                "expiry_date": now + timedelta(days=180),
            },
            {
                "user_id": user_objs["student2@org.edu"].id,
                "student_id": "STU-2026-002",
                "department": "Mechanical Engineering",
                "year_of_study": 2,
                "phone": "+1-555-0102",
                "membership_status": "active",
                "expiry_date": now + timedelta(days=10),  # Expiring soon
            },
            {
                "user_id": user_objs["student3@org.edu"].id,
                "student_id": "STU-2026-003",
                "department": "Business Administration",
                "year_of_study": 4,
                "phone": "+1-555-0103",
                "membership_status": "expired",
                "expiry_date": now - timedelta(days=30),  # Expired
            },
        ]

        member_objs = []
        for m in members_data:
            existing = db.query(Member).filter(Member.user_id == m["user_id"]).first()
            if not existing:
                member = Member(**m)
                db.add(member)
                db.flush()
                member_objs.append(member)
            else:
                member_objs.append(existing)
        print(f"  [+] Members verified ({len(member_objs)} members)")

        # ─── 3. Events ──────────────────────────────────────────────
        events_data = [
            {
                "title": "Spring Gala 2026",
                "description": "Annual student gala dinner, awards, and networking evening.",
                "location": "Grand Ballroom",
                "venue": "Campus Center, 3rd Floor",
                "event_date": now + timedelta(days=20),
                "end_date": now + timedelta(days=20, hours=5),
                "max_capacity": 250,
                "ticket_price": 25.00,
                "non_member_price": 40.00,
                "status": "upcoming",
            },
            {
                "title": "AI & Web3 Tech Workshop",
                "description": "Hands-on coding workshop exploring modern web APIs and AI agents.",
                "location": "Innovation Lab 402",
                "venue": "Science & Tech Building",
                "event_date": now + timedelta(days=7),
                "end_date": now + timedelta(days=7, hours=3),
                "max_capacity": 60,
                "ticket_price": 0.00,
                "non_member_price": 10.00,
                "status": "upcoming",
            },
            {
                "title": "Campus Sports Tournament & BBQ",
                "description": "Inter-department soccer and volleyball tournament followed by BBQ.",
                "location": "Main Athletics Field",
                "venue": "Outdoor Sports Complex",
                "event_date": now + timedelta(days=14),
                "end_date": now + timedelta(days=14, hours=6),
                "max_capacity": 150,
                "ticket_price": 15.00,
                "non_member_price": 20.00,
                "status": "upcoming",
            },
        ]

        event_objs = []
        for e in events_data:
            existing = db.query(Event).filter(Event.title == e["title"]).first()
            if not existing:
                event = Event(**e)
                db.add(event)
                db.flush()
                event_objs.append(event)
            else:
                event_objs.append(existing)
        print(f"  [+] Events verified ({len(event_objs)} events)")

        # ─── 4. Tickets ─────────────────────────────────────────────
        tickets_data = [
            {
                "event_id": event_objs[0].id,
                "member_id": member_objs[0].id,
                "ticket_code": "TKT-GALA-001",
                "price_paid": 25.00,
                "payment_status": "mock_paid",
                "status": "active",
                "checked_in": False,
            },
            {
                "event_id": event_objs[1].id,
                "member_id": member_objs[0].id,
                "ticket_code": "TKT-WORK-002",
                "price_paid": 0.00,
                "payment_status": "mock_paid",
                "status": "checked_in",
                "checked_in": True,
                "checked_in_at": now - timedelta(hours=1),
            },
        ]

        for t in tickets_data:
            existing = db.query(Ticket).filter(Ticket.ticket_code == t["ticket_code"]).first()
            if not existing:
                db.add(Ticket(**t))
        print("  [+] Tickets created")

        # ─── 5. Announcements ───────────────────────────────────────
        announcements_data = [
            {
                "title": "Welcome to the New Academic Semester!",
                "content": "Join us for exciting events, club projects, and networking opportunities this term.",
                "priority": "normal",
                "target_audience": "all",
            },
            {
                "title": "Spring Gala Tickets Now Available",
                "content": "Early-bird tickets for Spring Gala 2026 are live. Reserve your spot today!",
                "priority": "high",
                "target_audience": "all",
            },
            {
                "title": "General Body Meeting: Oct 15",
                "content": "Mandatory meeting for all members to discuss upcoming semester goals and elect new committee heads. See you at Room 101.",
                "priority": "high",
                "target_audience": "all",
            },
            {
                "title": "Volunteer Recruitment for Tech Workshop",
                "content": "We need 5 volunteers to help manage the registration desk and coordinate food at the upcoming AI & Web3 Tech Workshop.",
                "priority": "normal",
                "target_audience": "volunteer",
            },
            {
                "title": "Intramural Sports Deadline Extended",
                "content": "The deadline to register for the Campus Sports Tournament has been extended to Friday. Don't miss out!",
                "priority": "normal",
                "target_audience": "all",
            },
            {
                "title": "New Club Merchandise Drop!",
                "content": "Check out our new premium cotton hoodies and snapbacks available in the online store. Limited stock!",
                "priority": "normal",
                "target_audience": "member",
            },
            {
                "title": "Annual Hackathon Sponsorship Secured",
                "content": "Great news! TechCorp has agreed to sponsor our Annual Hackathon. Increased prize pool for all tracks.",
                "priority": "normal",
                "target_audience": "all",
            },
            {
                "title": "Important: Membership Renewals",
                "content": "Please check your membership status. If your membership expires this month, renew it via the dashboard to keep your perks.",
                "priority": "high",
                "target_audience": "member",
            },
            {
                "title": "Venue Change for Code Review Session",
                "content": "The peer code review session will now be held in the Library Study Room B instead of the Innovation Lab.",
                "priority": "normal",
                "target_audience": "member",
            },
            {
                "title": "Student Leadership Scholarship",
                "content": "Applications are now open for the Annual Student Leadership Scholarship. Deadline is next month.",
                "priority": "normal",
                "target_audience": "student",
            },
            {
                "title": "Food Drive Kickoff",
                "content": "Our annual food drive starts next Monday. Drop off non-perishable items at the student center.",
                "priority": "normal",
                "target_audience": "all",
            }
        ]

        for a in announcements_data:
            existing = db.query(Announcement).filter(Announcement.title == a["title"]).first()
            if not existing:
                db.add(Announcement(**a))
        print("  [+] Announcements created")

        # ─── 6. Products & Merchandise ──────────────────────────────
        products_data = [
            {
                "name": "Official Club T-Shirt",
                "description": "100% premium cotton tee with embroidered organization crest.",
                "price": 20.00,
                "stock": 45,
                "size": "M",
                "category": "Apparel",
                "is_available": True,
            },
            {
                "name": "Club Zip Hoodie",
                "description": "Heavyweight fleece hoodie for campus winters.",
                "price": 45.00,
                "stock": 25,
                "size": "L",
                "category": "Apparel",
                "is_available": True,
            },
            {
                "name": "Embroidered Snapback Cap",
                "description": "Classic adjustable snapback cap with logo.",
                "price": 15.00,
                "stock": 30,
                "size": "One Size",
                "category": "Accessories",
                "is_available": True,
            },
        ]

        product_objs = []
        for p in products_data:
            existing = db.query(Product).filter(Product.name == p["name"]).first()
            if not existing:
                prod = Product(**p)
                db.add(prod)
                db.flush()
                product_objs.append(prod)
            else:
                product_objs.append(existing)
        print(f"  [+] Merchandise products verified ({len(product_objs)} items)")

        # ─── 7. Orders ──────────────────────────────────────────────
        if member_objs and product_objs:
            count_orders = db.query(Order).count()
            if count_orders < 10:
                orders_to_create = [
                    (member_objs[0].id, "confirmed", [(product_objs[0], 1), (product_objs[1], 1)]),
                    (member_objs[1].id, "pending", [(product_objs[2], 2)]),
                    (member_objs[2].id, "delivered", [(product_objs[0], 2), (product_objs[2], 1)]),
                    (member_objs[0].id, "cancelled", [(product_objs[1], 1)]),
                    (member_objs[1].id, "confirmed", [(product_objs[0], 1), (product_objs[2], 1)]),
                    (member_objs[2].id, "processing", [(product_objs[1], 2)]),
                    (member_objs[0].id, "delivered", [(product_objs[0], 1)]),
                    (member_objs[1].id, "delivered", [(product_objs[2], 3)]),
                    (member_objs[2].id, "confirmed", [(product_objs[1], 1), (product_objs[2], 2)]),
                    (member_objs[0].id, "pending", [(product_objs[0], 3)]),
                    (member_objs[1].id, "processing", [(product_objs[1], 1)]),
                    (member_objs[2].id, "cancelled", [(product_objs[2], 1)]),
                ]
                
                for m_id, status, items in orders_to_create:
                    total = sum(p.price * q for p, q in items)
                    order = Order(member_id=m_id, total_amount=total, status=status)
                    db.add(order)
                    db.flush()
                    for p, q in items:
                        db.add(OrderItem(order_id=order.id, product_id=p.id, quantity=q, unit_price=p.price, subtotal=p.price * q))
        print("  [+] Orders created")

        # ─── 8. Fundraiser & Tasks ──────────────────────────────────
        f_title = "Annual Charity Hackathon & Fund Drive 2026"
        existing_f = db.query(Fundraiser).filter(Fundraiser.title == f_title).first()
        if not existing_f:
            fundraiser = Fundraiser(
                title=f_title,
                description="Raising funds for local STEM education and student scholarships.",
                goal_amount=5000.00,
                raised_amount=2150.00,
                status="active",
                start_date=now - timedelta(days=10),
                end_date=now + timedelta(days=20),
            )
            db.add(fundraiser)
            db.flush()

            tasks_data = [
                {
                    "fundraiser_id": fundraiser.id,
                    "title": "Outreach to Local Tech Sponsors",
                    "description": "Send sponsorship packages to 10 local tech companies.",
                    "assigned_to": user_objs["organizer@org.edu"].id,
                    "status": "completed",
                    "due_date": now - timedelta(days=2),
                },
                {
                    "fundraiser_id": fundraiser.id,
                    "title": "Design Social Media Graphics",
                    "description": "Create promotional banners for Instagram and LinkedIn campaigns.",
                    "assigned_to": user_objs["student1@org.edu"].id,
                    "status": "in_progress",
                    "due_date": now + timedelta(days=5),
                },
                {
                    "fundraiser_id": fundraiser.id,
                    "title": "Bake Sale Logistics",
                    "description": "Book student center table and coordinate volunteer schedule.",
                    "assigned_to": user_objs["treasurer@org.edu"].id,
                    "status": "pending",
                    "due_date": now + timedelta(days=8),
                },
            ]
            for td in tasks_data:
                db.add(FundraiserTask(**td))
        print("  [+] Fundraiser & tasks created")

        # ─── 9. Finance Records ─────────────────────────────────────
        existing_income = db.query(Income).first()
        if not existing_income:
            incomes_data = [
                {"source": "Membership Dues (Fall)", "amount": 1200.00, "category": "membership", "received_date": now - timedelta(days=30)},
                {"source": "Sponsorship - TechCorp", "amount": 2000.00, "category": "fundraiser", "received_date": now - timedelta(days=15)},
                {"source": "Club Merchandise Pop-up", "amount": 450.00, "category": "merch", "received_date": now - timedelta(days=5)},
            ]
            for inc in incomes_data:
                db.add(Income(**inc))

        existing_expense = db.query(Expense).first()
        if not existing_expense:
            expenses_data = [
                {"description": "Venue Deposit for Spring Gala", "amount": 500.00, "category": "venue", "vendor": "Campus Center", "expense_date": now - timedelta(days=20), "status": "approved"},
                {"description": "Workshop Refreshments & Snacks", "amount": 150.00, "category": "food", "vendor": "Campus Catering", "expense_date": now - timedelta(days=8), "status": "approved"},
            ]
            for exp in expenses_data:
                db.add(Expense(**exp))

        existing_reimb = db.query(Reimbursement).first()
        if not existing_reimb:
            reimb_data = [
                {"requested_by": "Bob Organizer", "description": "Stationery & Name tags for Tech Workshop", "amount": 45.50, "receipt_url": "https://example.com/receipts/001.pdf", "status": "pending"},
                {"requested_by": "Charlie Treasurer", "description": "Banner Printing for Fundraiser", "amount": 80.00, "receipt_url": "https://example.com/receipts/002.pdf", "status": "approved"},
            ]
            for rm in reimb_data:
                db.add(Reimbursement(**rm))
        print("  [+] Finance (Income, Expenses, Reimbursements) created")

        db.commit()
        print("\n[SUCCESS] Seed data successfully committed to Neon PostgreSQL database!")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Error seeding database: {e}")
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()

