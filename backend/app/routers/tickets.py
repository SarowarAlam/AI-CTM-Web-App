from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from .. import schemas, crud, dependencies, models, ai_service

router = APIRouter(prefix="/tickets", tags=["tickets"])

@router.get("/", response_model=list[schemas.TicketResponse])
def read_tickets(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(dependencies.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    tickets = crud.get_tickets(db, user_id=current_user.id, skip=skip, limit=limit, role=current_user.role.value)
    return tickets

@router.post("/", response_model=schemas.TicketResponse)
def create_ticket(
    ticket: schemas.TicketCreate,
    db: Session = Depends(dependencies.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    # Perform AI classification
    category, confidence = ai_service.classifier.classify(ticket.description)
    db_ticket = crud.create_ticket(db, ticket, current_user.id, category, confidence)
    return db_ticket

@router.get("/{ticket_id}", response_model=schemas.TicketResponse)
def read_ticket(
    ticket_id: UUID,
    db: Session = Depends(dependencies.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    ticket = crud.get_ticket_by_id(db, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    # Permission check
    if current_user.role not in [models.UserRole.ADMIN, models.UserRole.AGENT] and ticket.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return ticket

@router.put("/{ticket_id}", response_model=schemas.TicketResponse)
def update_ticket(
    ticket_id: UUID,
    ticket_update: schemas.TicketUpdate,
    db: Session = Depends(dependencies.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    updated_ticket = crud.update_ticket(db, ticket_id, ticket_update, current_user.role.value, current_user.id)
    if not updated_ticket:
        raise HTTPException(status_code=404, detail="Ticket not found or permission denied")
    # If description changed, reclassify (optional, but we can do it)
    if ticket_update.description:
        category, confidence = ai_service.classifier.classify(ticket_update.description)
        updated_ticket.category = category
        updated_ticket.classification_confidence = confidence
        db.commit()
        db.refresh(updated_ticket)
    return updated_ticket

@router.delete("/{ticket_id}", response_model=schemas.TicketResponse)
def delete_ticket(
    ticket_id: UUID,
    db: Session = Depends(dependencies.get_db),
    current_user: models.User = Depends(dependencies.require_admin)
):
    ticket = crud.delete_ticket(db, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket

@router.post("/{ticket_id}/reclassify", response_model=schemas.TicketResponse)
def reclassify_ticket(
    ticket_id: UUID,
    db: Session = Depends(dependencies.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    if current_user.role not in [models.UserRole.ADMIN, models.UserRole.AGENT]:
        raise HTTPException(status_code=403, detail="Only admin/agent can reclassify")
    ticket = crud.get_ticket_by_id(db, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    category, confidence = ai_service.classifier.classify(ticket.description)
    ticket.category = category
    ticket.classification_confidence = confidence
    db.commit()
    db.refresh(ticket)
    return ticket