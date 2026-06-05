from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator
from app.core.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
    pool_recycle=300,
    connect_args={"sslmode": "require"} if "supabase" in settings.DATABASE_URL else {},
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def check_and_seed_admin():
    from app.models.user import User
    from app.core.security import get_password_hash, verify_password
    from sqlalchemy import text
    
    # Dynamically alter table to add columns if they do not exist
    try:
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS security_question VARCHAR(255);"))
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS security_answer VARCHAR(255);"))
            conn.execute(text("ALTER TABLE students ADD COLUMN IF NOT EXISTS dob DATE;"))
            conn.execute(text("ALTER TABLE students ADD COLUMN IF NOT EXISTS academic_year VARCHAR(20) NOT NULL DEFAULT '2026-27';"))
            conn.execute(text("ALTER TABLE students ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'active';"))
    except Exception as e:
        print(f"Error altering tables: {e}")

    db = SessionLocal()
    try:
        new_mobile = "7996812234"
        admin = db.query(User).filter(User.role == "admin").first()
        if admin:
            if admin.mobile != new_mobile:
                admin.mobile = new_mobile
                db.commit()
                print(f"Successfully updated admin mobile to {new_mobile} on startup.")
            
            # Seed default security question/answer if not set
            if not admin.security_question or not admin.security_answer:
                admin.security_question = "What is your school name?"
                admin.security_answer = get_password_hash("mugalkod")
                db.commit()
                print("Seeded default security question and answer for admin.")
        else:
            new_admin = User(
                mobile=new_mobile,
                password_hash=get_password_hash("Kiran@123"),
                role="admin",
                is_active=True,
                security_question="What is your school name?",
                security_answer=get_password_hash("mugalkod")
            )
            db.add(new_admin)
            db.commit()
            print(f"Successfully created default admin user on startup: mobile={new_mobile}")
    except Exception as e:
        db.rollback()
        print(f"Error checking/seeding admin user: {e}")
    finally:
        db.close()
