import { PermitStatus } from "@/constants/Status";

// Utility to get CSS class based on permit status

function getStatusClass(status?: string) : string {
  if (!status) return "text-primary italic";
  const key = status.trim().toUpperCase();
  console.log("getStatusClass key:", key);

  switch (key) {
    case PermitStatus.APPROVED:
      console.log("Returning approved");
      return "text-approved font-bold";
    case PermitStatus.REJECTED:
      console.log("Returning rejected");
      return "text-rejected font-bold";
    case PermitStatus.PENDING:
      console.log("Returning pending");
      return "text-pending font-bold";
    case PermitStatus.SUBMITTED:
      console.log("Returning submitted");
      return "text-submitted font-bold";
    case PermitStatus.DRAFT:
      console.log("Returning draft");
      return "text-primary font-bold";
    default:
      console.log("Returning default");
      return "text-primary font-bold";
  }
}

export { getStatusClass };