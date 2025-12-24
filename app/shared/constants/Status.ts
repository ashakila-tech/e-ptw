/*
These are enum for permit statuses used throughout the app used to avoid inconsistency.
*/

export enum PermitStatus {
  DRAFT = "DRAFT",
  SUBMITTED = "SUBMITTED",
  APPROVED = "APPROVED",
  PENDING = "PENDING",
  WAITING = "WAITING",
  REJECTED = "REJECTED",
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  EXIT_PENDING = "EXIT-PENDING",
}

export const PERMIT_STATUS_LIST = Object.values(PermitStatus);