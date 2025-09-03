from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenPayload(BaseModel):
    sub: str
    uid: int | None = None
    company_id: int | None = None
    role: str | None = None
    
class CompanyIn(BaseModel): name: str
class CompanyOut(CompanyIn):
    id: int
    class Config: from_attributes = True

class PermitTypeIn(BaseModel):
    company_id: int; name: str
class PermitTypeOut(PermitTypeIn):
    id: int
    class Config: from_attributes = True

class UserBase(BaseModel):
    company_id: int
    name: str
    email: Optional[EmailStr] = None
    user_type: Optional[int] = None   # NEW

class UserCreate(UserBase):           # POST schema
    password: str

class UserIn(UserBase):               # PUT schema
    company_id: int
    name: str
    email: Optional[EmailStr] = None
    user_type: Optional[int] = None
    password: str

class UserOut(UserBase):              # Response
    id: int
    class Config: from_attributes = True


class LocationIn(BaseModel):
    company_id: int; name: str
class LocationOut(LocationIn):
    id: int
    class Config: from_attributes = True

class DocumentIn(BaseModel):
    company_id: int; name: str; path: str; time: Optional[datetime] = None
class DocumentOut(DocumentIn):
    id: int
    class Config: from_attributes = True

class WorkflowIn(BaseModel):
    company_id: int; permit_type_id: int; name: str
class WorkflowOut(WorkflowIn):
    id: int
    class Config: from_attributes = True

class ApplicationIn(BaseModel):
    permit_type_id: int
    workflow_data_id: int | None = None   # NEW
    location_id: int
    applicant_id: int
    name: str
    document_id: int | None = None
    status: Optional[str] = "DRAFT"

class ApplicationOut(ApplicationIn):
    id: int
    created_by: int | None = None     # NEW
    updated_by: int | None = None     # NEW
    created_time: datetime | None = None
    updated_time: datetime | None = None
    class Config: from_attributes = True

class GroupIn(BaseModel):
    company_id: int; name: str
class GroupOut(GroupIn):
    id: int
    class Config: from_attributes = True

class UserGroupIn(BaseModel):
    user_id: int; group_id: int
class UserGroupOut(UserGroupIn):
    id: int
    class Config: from_attributes = True

class WorkflowDataIn(BaseModel):
    company_id: int; workflow_id: int; name: str
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
class WorkflowDataOut(WorkflowDataIn):
    id: int
    class Config: from_attributes = True

class ApprovalDataIn(BaseModel):
    company_id: int; approval_id: int; workflow_data_id: int
    document_id: Optional[int] = None
    status: str
    approver_name: Optional[str] = None
    time: Optional[datetime] = None
    role_name: Optional[str] = None
    level: Optional[int] = None
    
class ApprovalDataOut(ApprovalDataIn):
    id: int
    class Config: from_attributes = True

# Application (example — keep yours if already defined)
# schemas.py
class ApplicationIn(BaseModel):
    permit_type_id: int
    workflow_data_id: int | None = None
    location_id: int
    applicant_id: int
    name: str
    document_id: int | None = None
    status: str | None = "DRAFT"

class ApplicationOut(ApplicationIn):
    id: int
    created_by: int | None = None
    updated_by: int | None = None
    created_time: datetime | None = None
    updated_time: datetime | None = None
    class Config: from_attributes = True
