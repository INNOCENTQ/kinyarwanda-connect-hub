import { describe, expect, it } from "vitest";
import { canAdvanceConsultation, staffDestination } from "./staff-access";
describe("staff access", () => {
  it("allows only administrators into the administrator area", () => {
    expect(staffDestination("admin", true, false)).toBe("/admin");
    expect(staffDestination("admin", false, true)).toBeNull();
  });
  it("requires an active linked veterinary account for veterinary entry", () => {
    expect(staffDestination("vet", false, true)).toBe("/vet");
    expect(staffDestination("vet", true, false)).toBeNull();
  });
  it("starts only paid confirmed consultations", () => {
    expect(canAdvanceConsultation("confirmed", "in_progress")).toBe(true);
    expect(canAdvanceConsultation("pending", "in_progress")).toBe(false);
  });
  it("completes only started consultations", () => {
    expect(canAdvanceConsultation("in_progress", "completed")).toBe(true);
    expect(canAdvanceConsultation("confirmed", "completed")).toBe(false);
  });
});