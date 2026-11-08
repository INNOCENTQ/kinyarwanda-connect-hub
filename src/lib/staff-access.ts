export type StaffArea = "admin" | "vet";
export function staffDestination(area: StaffArea, isAdmin: boolean, isVet: boolean): string | null {
  if (area === "admin") return isAdmin ? "/admin" : null;
  return isVet ? "/vet" : null;
}
export function canAdvanceConsultation(current: string, next: string): boolean {
  return (current === "confirmed" && next === "in_progress") || (current === "in_progress" && next === "completed");
}