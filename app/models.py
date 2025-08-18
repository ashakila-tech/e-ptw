from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
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
    email = Column(String, unique=True, nullable=True)
    password_hash = Column(String, nullable=True)

class UserGroup(Base):
    __tablename__ = "user_group"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id"), nullable=False)
    group_id = Column(Integer, ForeignKey("group.id"), nullable=False)

class Approval(Base):
    __tablename__ = "approval"
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("company.id"), nullable=False)
    workflow_id = Column(Integer, ForeignKey("workflow.id"), nullable=False)
    user_group_id = Column(Integer, ForeignKey("user_group.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("user.id"), nullable=True)
    name = Column(String, nullable=False)
    role_name = Column(String, nullable=True)
    level = Column(Integer, nullable=False, default=1)

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

class Application(Base):
    __tablename__ = "application"
    id = Column(Integer, primary_key=True, index=True)
    permit_type_id = Column(Integer, ForeignKey("permit_type.id"), nullable=False)
    workflow_data_id = Column(Integer, ForeignKey("workflow_data.id"), nullable=True)
    document_id = Column(Integer, ForeignKey("document.id"), nullable=True)
    location_id = Column(Integer, ForeignKey("location.id"), nullable=False)
    applicant_id = Column(Integer, ForeignKey("user.id"), nullable=False)
    created_by = Column(Integer, ForeignKey("user.id"), nullable=False)
    updated_by = Column(Integer, ForeignKey("user.id"), nullable=True)
    name = Column(String, nullable=False)
    status = Column(String, nullable=False, default="DRAFT")
    created_time = Column(DateTime, nullable=True)
    updated_time = Column(DateTime, nullable=True)

class ApprovalData(Base):
    __tablename__ = "approval_data"
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("company.id"), nullable=False)
    approval_id = Column(Integer, ForeignKey("approval.id"), nullable=False)
    document_id = Column(Integer, ForeignKey("document.id"), nullable=True)
    workflow_data_id = Column(Integer, ForeignKey("workflow_data.id"), nullable=False)
    status = Column(String, nullable=False, default="PENDING")
    approver_name = Column(String, nullable=True)
    time = Column(DateTime, nullable=True)
    role_name = Column(String, nullable=True)
    level = Column(Integer, nullable=True)
