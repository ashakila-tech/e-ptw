/**
 * A simple utility to guess the MIME type of a file based on its extension.
 * This is not exhaustive but covers common types for the application.
 * @param fileName The full name of the file (e.g., "report.pdf").
 * @returns A guessed MIME type string (e.g., "application/pdf") or a default.
 */
export function getMimeType(fileName: string = ""): string {
  const extension = fileName.split(".").pop()?.toLowerCase();
  const mimeTypes: Record<string, string> = {
    pdf: "application/pdf",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    csv: "text/csv",
  };
  return mimeTypes[extension || ""] || "application/octet-stream";
}