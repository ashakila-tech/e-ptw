from pydantic import BaseModel
from typing import Optional


# ---- Company ----
class CompanyIn(BaseModel):
    name: str

class CompanyOut(CompanyIn):
    id: int
    class Config: from_attributes = True

class PermitTypeIn(BaseModel):
    company_id: int
    name: str

class PermitTypeOut(PermitTypeIn):
    id: int
    class Config: from_attributes = True
    

# ---- User ----
class UserIn(BaseModel):
    company_id: int
    name: str
    email: Optional[EmailStr] = None

class UserOut(UserIn):
    id: int
    class Config: from_attributes = True

# ---- Location ----
class LocationIn(BaseModel):
    company_id: int
    name: str

class LocationOut(LocationIn):
    id: int
    class Config: from_attributes = True

# ---- Document ----
class DocumentIn(BaseModel):
    company_id: int
    name: str
    path: str
    time: Optional[datetime] = None

class DocumentOut(DocumentIn):
    id: int
    class Config: from_attributes = True

# ---- Workflow ----
class WorkflowIn(BaseModel):
    company_id: int
    permit_type_id: int
    name: str

class WorkflowOut(WorkflowIn):
    id: int
    class Config: from_attributes = True

# ---- Approval ----
class ApprovalIn(BaseModel):
    company_id: int
    workflow_id: int
    user_group_id: Optional[int] = None
    user_id: Optional[int] = None
    name: str
    role_name: Optional[str] = None
    level: int

class ApprovalOut(ApprovalIn):
    id: int
    class Config: from_attributes = True

# ---- Group ----
class GroupIn(BaseModel):
    company_id: int
    name: str

class GroupOut(GroupIn):
    id: int
    class Config: from_attributes = True

# ---- UserGroup ----
class UserGroupIn(BaseModel):
    user_id: int
    group_id: int

class UserGroupOut(UserGroupIn):
    id: int
    class Config: from_attributes = True

# ---- WorkflowData ----
class WorkflowDataIn(BaseModel):
    company_id: int
    workflow_id: int
    name: str
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None

class WorkflowDataOut(WorkflowDataIn):
    id: int
    class Config: from_attributes = True

# ---- ApprovalData ----
class ApprovalDataIn(BaseModel):
    company_id: int
    approval_id: int
    document_id: Optional[int] = None
    workflow_data_id: int
    status: str  # "PENDING"/"APPROVED"/"REJECTED"
    approver_name: Optional[str] = None
    time: Optional[datetime] = None
    role_name: Optional[str] = None
    level: Optional[int] = None

class ApprovalDataOut(ApprovalDataIn):
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

class User(BaseModel):
    company_id: int
    name: str
    email: str
    password: str

class Group(BaseModel):
    company_id: int
    name: str

class Document(BaseModel):
    company_id: int
    name: str
    path: str
    time: Optional[datetime] = None

class WorkflowData(BaseModel):
    company_id: int
    workflow_id: int
    name: str
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None

class ApprovalData(BaseModel):
    company_id: int
    approval_id: int
    document_id: Optional[int]
    workflow_data_id: int
    status: Optional[str]
    approver_name: Optional[str]
    time: Optional[datetime]
    role_name: Optional[str]
    level: Optional[int]

class Location(BaseModel):
    company_id: int
    name: str

class Company(BaseModel):
    name: str

class Workflow(BaseModel):
    company_id: int
    permit_type_id: int
    name: str

class Approval(BaseModel):
    company_id: int
    workflow_id: int
    user_group_id: int
    user_id: int
    name: str
    role_name: Optional[str]
    level: str

class Login(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: str | None = None 
