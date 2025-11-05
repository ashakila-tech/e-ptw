export enum PermitStatus {
  DRAFT = "DRAFT",
  SUBMITTED = "SUBMITTED",
  APPROVED = "APPROVED",
  PENDING = "PENDING",
  WAITING = "WAITING",
  REJECTED = "REJECTED",
}

export const PERMIT_STATUS_LIST = Object.values(PermitStatus);