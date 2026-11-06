import { describe, it, expect } from "vitest";
import { phoneToEmail } from "./phone-auth";
describe("phoneToEmail", () => {
  it("accepts 07 numbers and +250 forms the same", () => {
    expect(phoneToEmail("0781234567")).toBe("250781234567@phone.umuhinzi.app");
    expect(phoneToEmail("+250 781 234 567")).toBe("250781234567@phone.umuhinzi.app");
  });
  it("rejects invalid numbers", () => { expect(phoneToEmail("12345")).toBeNull(); });
});
