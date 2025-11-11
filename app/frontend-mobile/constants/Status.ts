export enum PermitStatus {
  DRAFT = "DRAFT",
  SUBMITTED = "SUBMITTED",
  APPROVED = "APPROVED",
  PENDING = "PENDING",
  WAITING = "WAITING",
  REJECTED = "REJECTED",
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
}

export const PERMIT_STATUS_LIST = Object.values(PermitStatus);