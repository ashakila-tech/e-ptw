from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, func
from sqlalchemy.orm import relationship
from .database import Base

class Company(Base):
    __tablename__ = "company"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)

class PermitType(Base):
    __tablename__ = "permit_type"
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("company.id"), nullable=False)
    name = Column(String, nullable=False)
    company = relationship("Company")
    permit_officers = relationship("PermitOfficer", back_populates="permit_type")


class Workflow(Base):
    __tablename__ = "workflow"
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("company.id"), nullable=False)
    permit_type_id = Column(Integer, ForeignKey("permit_type.id"), nullable=False)
    name = Column(String, nullable=False)
    company = relationship("Company")
    permit_type = relationship("PermitType")

class Group(Base):
    __tablename__ = "group"
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("company.id"), nullable=False)
    name = Column(String, nullable=False)

class User(Base):
    __tablename__ = "user"
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("company.id"), nullable=False)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=True)
    user_type = Column(Integer, nullable=True)    # NEW: align with ERD
    password_hash = Column(String, nullable=False)
    
    company = relationship("Company")
    location_managers = relationship("LocationManager", back_populates="user")
    permit_officers = relationship("PermitOfficer", back_populates="user")
    user_groups = relationship("UserGroup", back_populates="user")

class UserGroup(Base):
    __tablename__ = "user_group"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id"), nullable=False)
    group_id = Column(Integer, ForeignKey("group.id"), nullable=False)
    
    user = relationship("User", back_populates="user_groups")
    group = relationship("Group")

class Approval(Base):
    __tablename__ = "approval"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)  # auto
    company_id = Column(Integer, ForeignKey("company.id"), nullable=False)
    workflow_id = Column(Integer, ForeignKey("workflow.id"), nullable=False)
    user_group_id = Column(Integer, ForeignKey("user_group.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("user.id"), nullable=True)
    name = Column(String, nullable=False)
    role_name = Column(String, nullable=True)
    level = Column(Integer, nullable=True)

class WorkflowData(Base):
    __tablename__ = "workflow_data"
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("company.id"), nullable=False)
    workflow_id = Column(Integer, ForeignKey("workflow.id"), nullable=False)
    name = Column(String, nullable=False)
    start_time = Column(DateTime, nullable=True)
    end_time = Column(DateTime, nullable=True)

class Document(Base):
    __tablename__ = "document"
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("company.id"), nullable=False)
    name = Column(String, nullable=False)
    path = Column(Text, nullable=False)
    time = Column(DateTime, nullable=True)

class Location(Base):
    __tablename__ = "location"
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("company.id"), nullable=False)
    name = Column(String, nullable=False)
    location_managers = relationship("LocationManager", back_populates="location")

class Application(Base):
    __tablename__ = "application"
    id = Column(Integer, primary_key=True, index=True)
    permit_type_id = Column(Integer, ForeignKey("permit_type.id"), nullable=False)
    workflow_data_id = Column(Integer, ForeignKey("workflow_data.id"), nullable=True)  # NEW
    location_id = Column(Integer, ForeignKey("location.id"), nullable=False)
    applicant_id = Column(Integer, ForeignKey("user.id"), nullable=False)
    name = Column(String, nullable=False)
    document_id = Column(Integer, ForeignKey("document.id"), nullable=True)
    status = Column(String, nullable=True)  # your enhancement (DRAFT/…)
    created_by = Column(Integer, ForeignKey("user.id"), nullable=True)                 # NEW
    updated_by = Column(Integer, ForeignKey("user.id"), nullable=True)                 # NEW
    created_time = Column(DateTime, server_default=func.now())                         # NEW
    updated_time = Column(DateTime, onupdate=func.now())
    permit_type = relationship("PermitType", lazy="joined")
    workflow_data = relationship("WorkflowData", lazy="joined")
    location = relationship("Location", lazy="joined")
    document = relationship("Document", lazy="joined")
    applicant = relationship("User", foreign_keys=[applicant_id], lazy="joined")
    created_by_user = relationship("User", foreign_keys=[created_by], lazy="joined")
    updated_by_user = relationship("User", foreign_keys=[updated_by], lazy="joined")

class ApprovalData(Base):
    __tablename__ = "approval_data"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    company_id = Column(Integer, ForeignKey("company.id"), nullable=False)
    approval_id = Column(Integer, ForeignKey("approval.id"), nullable=False)   # keep
    document_id = Column(Integer, ForeignKey("document.id"), nullable=True)
    workflow_data_id = Column(Integer, ForeignKey("workflow_data.id"), nullable=False)
    status = Column(String, nullable=False, default="PENDING")
    approver_name = Column(String, nullable=True)
    time = Column(DateTime, nullable=True)
    role_name = Column(String, nullable=True)
    level = Column(Integer, nullable=True)

class LocationManager(Base):
    __tablename__ = "location_manager"

    id = Column(Integer, primary_key=True, index=True)
    location_id = Column(Integer, ForeignKey("location.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("user.id", ondelete="CASCADE"), nullable=False)

    user = relationship("User", back_populates="location_managers")
    location = relationship("Location", back_populates="location_managers")


class PermitOfficer(Base):
    __tablename__ = "permit_officer"

    id = Column(Integer, primary_key=True, index=True)
    permit_type_id = Column(Integer, ForeignKey("permit_type.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("user.id", ondelete="CASCADE"), nullable=False)

    user = relationship("User", back_populates="permit_officers")
    permit_type = relationship("PermitType", back_populates="permit_officers")

class Worker(Base):
    __tablename__ = "worker"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("company.id"), nullable=False)

    name = Column(String, nullable=False)
    ic_passport = Column(String, nullable=False)
    contact = Column(String, nullable=True)
    employment_status = Column(String, nullable=True)
    employment_type = Column(String, nullable=True)
    position = Column(String, nullable=True)

    company = relationship("Company")