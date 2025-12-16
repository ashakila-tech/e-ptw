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
  [PermitStatus.EXIT_PENDING]: "text-exit-pending font-bold",
} as const;

export function getStatusClass(status?: string): string {
  if (!status) return "text-primary italic";

  const key = status.trim().toUpperCase();
  return STATUS_CLASSES[key as keyof typeof STATUS_CLASSES] ?? "text-primary font-bold";
}
