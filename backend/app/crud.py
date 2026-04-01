from sqlalchemy.orm import Session
from . import models, schemas
from uuid import UUID
from .auth import get_password_hash

# User CRUD
def get_user_by_id(db: Session, user_id: UUID):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        email=user.email,
        password_hash=hashed_password,
        full_name=user.full_name,
        role=user.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user_id: UUID, user_update: schemas.UserUpdate):
    db_user = get_user_by_id(db, user_id)
    if not db_user:
        return None
    update_data = user_update.dict(exclude_unset=True)
    if "password" in update_data:
        update_data["password_hash"] = get_password_hash(update_data.pop("password"))
    for field, value in update_data.items():
        setattr(db_user, field, value)
    db.commit()
    db.refresh(db_user)
    return db_user

def delete_user(db: Session, user_id: UUID):
    db_user = get_user_by_id(db, user_id)
    if db_user:
        db.delete(db_user)
        db.commit()
    return db_user

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()

# Ticket CRUD
def get_ticket_by_id(db: Session, ticket_id: UUID):
    return db.query(models.Ticket).filter(models.Ticket.id == ticket_id).first()

def get_tickets(db: Session, user_id: UUID = None, skip: int = 0, limit: int = 100, role: str = None):
    query = db.query(models.Ticket)
    if role != "admin" and role != "agent" and user_id:
        query = query.filter(models.Ticket.created_by == user_id)
    return query.offset(skip).limit(limit).all()

def create_ticket(db: Session, ticket: schemas.TicketCreate, created_by: UUID, category: str = None, confidence: float = None):
    db_ticket = models.Ticket(
        title=ticket.title,
        description=ticket.description,
        priority=ticket.priority,
        created_by=created_by,
        category=category,
        classification_confidence=confidence
    )
    db.add(db_ticket)
    db.commit()
    db.refresh(db_ticket)
    return db_ticket

def update_ticket(db: Session, ticket_id: UUID, ticket_update: schemas.TicketUpdate, user_role: str, user_id: UUID):
    db_ticket = get_ticket_by_id(db, ticket_id)
    if not db_ticket:
        return None
    # Permission checks: only admin/agent or creator if status open
    if user_role not in ["admin", "agent"]:
        if db_ticket.created_by != user_id or db_ticket.status != models.TicketStatus.OPEN:
            return None
    update_data = ticket_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_ticket, field, value)
    db.commit()
    db.refresh(db_ticket)
    return db_ticket

def delete_ticket(db: Session, ticket_id: UUID):
    db_ticket = get_ticket_by_id(db, ticket_id)
    if db_ticket:
        db.delete(db_ticket)
        db.commit()
    return db_ticket

def get_ticket_stats(db: Session):
    total = db.query(models.Ticket).count()
    by_status = {}
    for status in models.TicketStatus:
        by_status[status.value] = db.query(models.Ticket).filter(models.Ticket.status == status).count()
    by_category = {}
    categories = db.query(models.Ticket.category).distinct()
    for cat in categories:
        if cat[0]:
            by_category[cat[0]] = db.query(models.Ticket).filter(models.Ticket.category == cat[0]).count()
    return {"total_tickets": total, "by_status": by_status, "by_category": by_category}