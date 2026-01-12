from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional, List
from datetime import datetime

# ---------- Auth ----------
class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenPayload(BaseModel):
    sub: str
    uid: int | None = None
    company_id: int | None = None
    role: str | None = None

# ---------- Company ----------
class CompanyIn(BaseModel):
    name: str

class CompanyOut(CompanyIn):
    id: int
    model_config = ConfigDict(from_attributes=True)

class CompanyUpdate(BaseModel):
    name: Optional[str] = None

# ---------- PermitType ----------
class PermitTypeIn(BaseModel):
    company_id: int
    name: str

class PermitTypeOut(PermitTypeIn):
    id: int
    model_config = ConfigDict(from_attributes=True)

class PermitTypeUpdate(BaseModel):
    company_id: Optional[int] = None
    name: Optional[str] = None

# ---------- User ----------
class UserBase(BaseModel):
    company_id: int
    name: str
    email: Optional[EmailStr] = None
    user_type: Optional[int] = None  # 1=worker,2=safety,9=admin (or use an Enum)

class UserCreate(UserBase):  # POST
    password: str

class UserOut(UserBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class UserUpdate(BaseModel):  # PUT/PATCH (all optional) 
    company_id: Optional[int] = None
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    user_type: Optional[int] = None
    password: Optional[str] = None

# ---------- Location ----------
class LocationIn(BaseModel):
    company_id: int
    name: str

class LocationOut(LocationIn):
    id: int
    model_config = ConfigDict(from_attributes=True)

class LocationUpdate(BaseModel):
    company_id: Optional[int] = None
    name: Optional[str] = None

# ---------- Document ----------
class DocumentOut(BaseModel):
    id: int
    company_id: int
    name: str
    path: str
    time: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class DocumentUpdate(BaseModel):
    company_id: Optional[int] = None
    name: Optional[str] = None

# ---------- Workflow ----------
class WorkflowIn(BaseModel):
    company_id: int
    permit_type_id: int
    name: str

class WorkflowOut(WorkflowIn):
    id: int
    model_config = ConfigDict(from_attributes=True)

class WorkflowUpdate(BaseModel):
    company_id: Optional[int] = None
    permit_type_id: Optional[int] = None
    name: Optional[str] = None

# ---------- WorkflowData ----------
class WorkflowDataIn(BaseModel):
    company_id: int
    workflow_id: int
    name: str
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None

class WorkflowDataOut(WorkflowDataIn):
    id: int
    model_config = ConfigDict(from_attributes=True)

class WorkflowDataUpdate(BaseModel):
    company_id: Optional[int] = None
    workflow_id: Optional[int] = None
    name: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None

# ---------- Group ----------
class GroupIn(BaseModel):
    company_id: int
    name: str

class GroupOut(GroupIn):
    id: int
    model_config = ConfigDict(from_attributes=True)

class GroupUpdate(BaseModel):
    company_id: Optional[int] = None
    name: Optional[str] = None

# ---------- UserGroup ----------
class UserGroupIn(BaseModel):
    user_id: int
    group_id: int

class UserGroupOut(UserGroupIn):
    id: int
    model_config = ConfigDict(from_attributes=True)

class UserGroupUpdate(BaseModel):
    user_id: Optional[int] = None
    group_id: Optional[int] = None

# ---------- Approval ----------
class ApprovalIn(BaseModel):
    company_id: int
    workflow_id: int
    user_group_id: int | None = None
    user_id: int | None = None
    name: str
    role_name: str | None = None
    level: int | None = None

class ApprovalOut(ApprovalIn):
    id: int
    model_config = ConfigDict(from_attributes=True)

class ApprovalUpdate(BaseModel):
    company_id: Optional[int] = None
    workflow_id: Optional[int] = None
    user_group_id: Optional[int] = None
    user_id: Optional[int] = None
    name: Optional[str] = None
    role_name: Optional[str] = None
    level: Optional[int] = None

# ---------- ApprovalData ----------
class ApprovalDataIn(BaseModel):
    company_id: int
    approval_id: int
    document_id: Optional[int] = None
    workflow_data_id: int
    status: str = "PENDING"
    approver_name: Optional[str] = None
    time: Optional[datetime] = None
    role_name: Optional[str] = None
    level: Optional[int] = None
    remarks: Optional[str] = None

class ApprovalDataOut(ApprovalDataIn):
    id: int
    model_config = ConfigDict(from_attributes=True)

class ApprovalDataUpdate(BaseModel):
    company_id: Optional[int] = None
    approval_id: Optional[int] = None
    document_id: Optional[int] = None
    workflow_data_id: Optional[int] = None
    status: Optional[str] = None
    approver_name: Optional[str] = None
    time: Optional[datetime] = None
    role_name: Optional[str] = None
    level: Optional[int] = None
    remarks: Optional[str] = None

# ---------- LocationManager ----------
class LocationManagerBase(BaseModel):
    location_id: int
    user_id: int

class LocationManagerIn(LocationManagerBase):
    pass

class LocationManagerOut(LocationManagerBase):
    id: int
    class Config:
        from_attributes = True

# ---------- PermitOfficer ----------
class PermitOfficerBase(BaseModel):
    permit_type_id: int
    user_id: int

class PermitOfficerIn(PermitOfficerBase):
    pass

class PermitOfficerOut(PermitOfficerBase):
    id: int
    class Config:
        from_attributes = True

# ---------- Worker ----------
class WorkerBase(BaseModel):
    company_id: int
    name: str
    ic_passport: str
    contact: Optional[str] = None
    employment_status: Optional[str] = None
    employment_type: Optional[str] = None
    position: Optional[str] = None
    picture: Optional[str] = None

class WorkerIn(WorkerBase):
    pass

class WorkerOut(WorkerBase):
    id: int
    class Config:
        from_attributes = True

# ---------- SafetyEquipment ----------
class SafetyEquipmentBase(BaseModel):
    company_id: int
    name: str

class SafetyEquipmentIn(SafetyEquipmentBase):
    pass

class SafetyEquipmentOut(SafetyEquipmentBase):
    id: int
    class Config:
        from_attributes = True

# ---------- Application Schemas ----------

class ApplicationBase(BaseModel):
    permit_type_id: int
    workflow_data_id: int | None = None
    location_id: int
    applicant_id: int
    name: str
    document_id: int | None = None
    status: Optional[str] = "DRAFT"

class ApplicationIn(ApplicationBase):
    # Use ID lists for creating/updating applications
    worker_ids: List[int] = []
    safety_equipment_ids: List[int] = []

class ApplicationOut(ApplicationBase):
    # Return full objects in the output, not the ID lists
    id: int
    created_by: int | None = None
    updated_by: int | None = None
    created_time: datetime | None = None
    updated_time: datetime | None = None

    workers: List[WorkerOut] = []
    safety_equipment: List[SafetyEquipmentOut] = []

    # Added for frontend display
    workflow_data: Optional[WorkflowDataOut] = None
    document: Optional[DocumentOut] = None
    location: Optional[LocationOut] = None
    approval_data: List[ApprovalDataOut] = []
    permit_type: Optional[PermitTypeOut] = None
    applicant: Optional[UserOut] = None

    model_config = ConfigDict(from_attributes=True)

class ApplicationUpdate(BaseModel):
    permit_type_id: Optional[int] = None
    workflow_data_id: Optional[int] = None
    location_id: Optional[int] = None
    applicant_id: Optional[int] = None
    name: Optional[str] = None
    document_id: Optional[int] = None
    status: Optional[str] = None

    worker_ids: Optional[List[int]] = None
    safety_equipment_ids: Optional[List[int]] = None

# ---------- Permit Extension Eligibility ----------
class PermitExtensionEligibility(BaseModel):
    eligible: bool
    reason: str | None = None

# ---------- ApplicationWorker ----------
class ApplicationWorkerBase(BaseModel):
    application_id: int
    worker_id: int

class ApplicationWorkerIn(ApplicationWorkerBase):
    pass

class ApplicationWorkerOut(ApplicationWorkerBase):
    id: int
    class Config:
        from_attributes = True

# ---------- ApplicationSafetyEquipment ----------
class ApplicationSafetyEquipmentBase(BaseModel):
    application_id: int
    safety_equipment_id: int

class ApplicationSafetyEquipmentIn(ApplicationSafetyEquipmentBase):
    pass

class ApplicationSafetyEquipmentOut(ApplicationSafetyEquipmentBase):
    id: int
    class Config:
        from_attributes = True

# ---------- PushToken ----------
class PushTokenIn(BaseModel):
    token: str
    platform: Optional[str] = None

class PushTokenOut(PushTokenIn):
    id: int
    user_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)