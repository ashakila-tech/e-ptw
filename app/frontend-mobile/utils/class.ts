import { PermitStatus } from "@/constants/Status";

// Utility to get CSS class based on permit status

function getStatusClass(status?: string) : string {
  if (!status) return "text-primary italic";
  const key = status.toUpperCase();

  switch (key) {
    case PermitStatus.APPROVED:
      return "text-approved font-bold";
    case PermitStatus.REJECTED:
      return "text-rejected font-bold";
    case PermitStatus.PENDING:
      return "text-pending font-bold";
    case PermitStatus.SUBMITTED:
      return "text-submitted font-bold";
    case PermitStatus.DRAFT:
      return "text-primary font-bold";
    default:
      return "text-primary font-bold";
  }
}

export { getStatusClass };