import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AdminRegister from "./AdminRegister";

const api = vi.hoisted(() => ({ signUp: vi.fn(), invoke: vi.fn(), rpc: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { auth: { signUp: api.signUp }, functions: { invoke: api.invoke }, rpc: api.rpc } }));
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

function complete(identifier: string) {
  render(<MemoryRouter><AdminRegister /></MemoryRouter>);
  fireEvent.change(screen.getByLabelText("Amazina yombi"), { target: { value: "Umuyobozi mushya" } });
  fireEvent.change(screen.getByLabelText("Imeyili cyangwa telefone"), { target: { value: identifier } });
  fireEvent.change(screen.getByLabelText("Ijambo ry'ibanga"), { target: { value: "test-password" } });
  fireEvent.change(screen.getByLabelText("Subiramo ijambo ry'ibanga"), { target: { value: "test-password" } });
  fireEvent.click(screen.getByRole("button", { name: "Fungura konti nshya" }));
}

describe("administrator registration", () => {
  beforeEach(() => vi.clearAllMocks());
  it("registers a phone account without granting administrator privileges", async () => {
    api.invoke.mockResolvedValue({ data: { ok: true }, error: null });
    complete("0781234567");
    await waitFor(() => expect(api.invoke).toHaveBeenCalledWith("phone-signup", { body: { phone: "0781234567", password: "test-password", full_name: "Umuyobozi mushya" } }));
    await screen.findByRole("status");
    expect(api.rpc).not.toHaveBeenCalled();
  });
  it("registers email accounts without user-editable role metadata", async () => {
    api.signUp.mockResolvedValue({ data: { user: { identities: [{}] }, session: null }, error: null });
    complete("new-admin@example.com");
    await waitFor(() => expect(api.signUp).toHaveBeenCalledWith({ email: "new-admin@example.com", password: "test-password", options: { emailRedirectTo: `${window.location.origin}/admin/login`, data: { full_name: "Umuyobozi mushya" } } }));
    await screen.findByRole("status");
    expect(api.rpc).not.toHaveBeenCalled();
  });
});