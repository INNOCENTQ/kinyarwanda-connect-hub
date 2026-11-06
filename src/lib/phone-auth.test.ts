import { describe, it, expect } from "vitest";
import { phoneToEmail } from "./phone-auth";

describe("phoneToEmail", () => {
  it("maps local Rwanda mobile numbers to the same login address", () => {
    expect(phoneToEmail("0781234567")).toBe("250781234567@phone.umuhinzi.app");
    expect(phoneToEmail("+250 781 234 567")).toBe("250781234567@phone.umuhinzi.app");
    expect(phoneToEmail("250781234567")).toBe("250781234567@phone.umuhinzi.app");
  });

  it("accepts normal phone formatting", () => {
    expect(phoneToEmail("(078) 123-4567")).toBe("250781234567@phone.umuhinzi.app");
  });

  it("rejects malformed, non-Rwandan, and incomplete numbers", () => {
    expect(phoneToEmail("12345")).toBeNull();
    expect(phoneToEmail("abc0781234567")).toBeNull();
    expect(phoneToEmail("07812345678")).toBeNull();
    expect(phoneToEmail("+256 781 234 567")).toBeNull();
    expect(phoneToEmail("+250 078 123 4567")).toBeNull();
  });
});
