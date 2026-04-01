from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import schemas, crud, dependencies, models, ai_service

router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(dependencies.require_admin)])

@router.get("/stats", response_model=schemas.StatsResponse)
def get_stats(db: Session = Depends(dependencies.get_db)):
    return crud.get_ticket_stats(db)

@router.get("/categories", response_model=schemas.CategoryConfig)
def get_categories():
    return {"labels": ai_service.classifier.labels}

@router.put("/categories", response_model=schemas.CategoryConfig)
def update_categories(cfg: schemas.CategoryConfig, db: Session = Depends(dependencies.get_db)):
    ai_service.classifier.update_labels(cfg.labels)
    return {"labels": ai_service.classifier.labels}