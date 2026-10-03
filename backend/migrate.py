"""Apply incremental schema migrations for new columns added in Step 4."""
from app.database import engine
from sqlalchemy import text

migrations = [
    # Ticket new columns
    "ALTER TABLE tickets ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) NOT NULL DEFAULT 'mock_paid'",
    "ALTER TABLE tickets ADD COLUMN IF NOT EXISTS checked_in BOOLEAN NOT NULL DEFAULT FALSE",
    "ALTER TABLE tickets ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMPTZ",
    # Member expiry_date (already applied but safe to repeat)
    "ALTER TABLE members ADD COLUMN IF NOT EXISTS expiry_date TIMESTAMPTZ",
    # Event new columns
    "ALTER TABLE events ADD COLUMN IF NOT EXISTS venue VARCHAR(255)",
    "ALTER TABLE events ADD COLUMN IF NOT EXISTS non_member_price NUMERIC(10,2)",
    # Product size column
    "ALTER TABLE products ADD COLUMN IF NOT EXISTS size VARCHAR(50)",
    # Announcement creator and published_at
    "ALTER TABLE announcements ADD COLUMN IF NOT EXISTS creator_id INTEGER REFERENCES users(id) ON DELETE SET NULL",
    "ALTER TABLE announcements ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ DEFAULT NOW()",
]

with engine.connect() as conn:
    for sql in migrations:
        try:
            conn.execute(text(sql))
            print(f"OK: {sql[:70]}...")
        except Exception as e:
            print(f"SKIP: {str(e)[:80]}")
    conn.commit()

print("\nMigrations complete.")

