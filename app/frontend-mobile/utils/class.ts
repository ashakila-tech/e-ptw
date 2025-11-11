// import { PermitStatus } from "@/constants/Status";

// // Utility to get CSS class based on permit status

// function getStatusClass(status?: string) : string {
//   if (!status) return "text-primary italic";
//   const key = status.trim().toUpperCase();
//   console.log("getStatusClass key:", key);

//   switch (key) {
//     case PermitStatus.APPROVED:
//       console.log("Returning approved");
//       return "text-approved font-bold";
//     case PermitStatus.REJECTED:
//       console.log("Returning rejected");
//       return "text-rejected font-bold";
//     case PermitStatus.PENDING:
//       console.log("Returning pending");
//       return "text-pending font-bold";
//     case PermitStatus.SUBMITTED:
//       console.log("Returning submitted");
//       return "text-submitted font-bold";
//     case PermitStatus.DRAFT:
//       console.log("Returning draft");
//       return "text-primary font-bold";
//     default:
//       console.log("Returning default");
//       return "text-primary font-bold";
//   }
// }

// export { getStatusClass };


// utils/class.ts

import { PermitStatus } from "@/constants/Status";

const STATUS_CLASSES = {
  [PermitStatus.APPROVED]: "text-approved font-bold",
  [PermitStatus.REJECTED]: "text-rejected font-bold",
  [PermitStatus.PENDING]: "text-pending font-bold",
  [PermitStatus.SUBMITTED]: "text-submitted font-bold",
  [PermitStatus.DRAFT]: "text-primary font-bold",
  [PermitStatus.WAITING]: "text-waiting font-bold",
  [PermitStatus.ACTIVE]: "text-approved font-bold",
  [PermitStatus.COMPLETED]: "text-approved font-bold",
} as const;

export function getStatusClass(status?: string): string {
  if (!status) return "text-primary italic";

  const key = status.trim().toUpperCase();
  return STATUS_CLASSES[key as keyof typeof STATUS_CLASSES] ?? "text-primary font-bold";
}
