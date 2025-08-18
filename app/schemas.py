from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class PermitTypeIn(BaseModel):
    company_id: int
    name: str

class PermitTypeOut(PermitTypeIn):
    id: int
    class Config: from_attributes = True

class ApplicationIn(BaseModel):
    permit_type_id: int
    location_id: int
    applicant_id: int
    name: str
    document_id: Optional[int] = None
    status: Optional[str] = "DRAFT"

class ApplicationOut(ApplicationIn):
    id: int
    created_by: int
    updated_by: Optional[int] = None
    created_time: Optional[datetime] = None
    updated_time: Optional[datetime] = None
    class Config: from_attributes = True
