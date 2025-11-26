from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ._crud_factory import make_crud_router
from .. import models, schemas
from ..deps import get_db, require_role

router = APIRouter()

@router.patch("/workflow-data/{item_id}", response_model=schemas.WorkflowDataOut, dependencies=[Depends(require_role(["admin", "user"]))])
def patch_workflow_data(
    item_id: int,
    payload: schemas.WorkflowDataUpdate,
    db: Session = Depends(get_db),
):
    """
    Partially update a workflow data record. Only updates fields that are provided.
    """
    db_obj = db.get(models.WorkflowData, item_id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Workflow data not found")

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_obj, key, value)

    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

crud_router = make_crud_router(
    Model=models.WorkflowData,
    InSchema=schemas.WorkflowDataIn,
    OutSchema=schemas.WorkflowDataOut,
    prefix="/workflow-data",
    tag="Workflow Data",
    write_roles=["admin"],
)

router.include_router(crud_router)
