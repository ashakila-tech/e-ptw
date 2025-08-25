from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenPayload(BaseModel):
    sub: str  # email/username
    uid: int | None = None
    company_id: int | None = None
    
class CompanyIn(BaseModel): name: str
class CompanyOut(CompanyIn):
    id: int
    class Config: from_attributes = True

class PermitTypeIn(BaseModel):
    company_id: int; name: str
class PermitTypeOut(PermitTypeIn):
    id: int
    class Config: from_attributes = True

class UserIn(BaseModel):
    company_id: int; name: str; email: Optional[EmailStr] = None
class UserOut(UserIn):
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

class ApprovalIn(BaseModel):
    company_id: int; workflow_id: int
    user_group_id: Optional[int] = None
    user_id: Optional[int] = None
    name: str
    role_name: Optional[str] = None
    level: int
class ApprovalOut(ApprovalIn):
    id: int
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
class ApplicationIn(BaseModel):
    permit_type_id: int; location_id: int; applicant_id: int; name: str
    document_id: Optional[int] = None
    status: Optional[str] = "DRAFT"
class ApplicationOut(ApplicationIn):
    id: int
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    created_time: Optional[datetime] = None
    updated_time: Optional[datetime] = None
    class Config: from_attributes = True
