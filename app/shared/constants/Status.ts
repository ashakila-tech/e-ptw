/*
These are enum for permit statuses used throughout the app used to avoid inconsistency.
*/

// Replace enum with a const object
export const PermitStatus = {
  DRAFT: "DRAFT",
  SUBMITTED: "SUBMITTED",
  APPROVED: "APPROVED",
  PENDING: "PENDING",
  WAITING: "WAITING",
  REJECTED: "REJECTED",
  ACTIVE: "ACTIVE",
  COMPLETED: "COMPLETED",
  EXIT_PENDING: "EXIT-PENDING",
} as const;

// Type-safe string literal type
export type PermitStatus = typeof PermitStatus[keyof typeof PermitStatus];

// Optional: list of all statuses
export const PERMIT_STATUS_LIST = Object.values(PermitStatus);