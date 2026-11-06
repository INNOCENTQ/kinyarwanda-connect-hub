/** Farmers without email sign in with phone + password; the phone maps to an internal login address. */
export function phoneToEmail(phone: string): string | null {
  const input = phone.trim();
  // Permit common phone formatting, but don't silently accept letters or other characters.
  if (!/^\+?[\d\s().-]+$/.test(input)) return null;

  const digits = input.replace(/\D/g, "");
  const local = digits.startsWith("250") ? digits.slice(3) : digits.replace(/^0/, "");
  if (!/^7\d{8}$/.test(local)) return null;
  return `250${local}@phone.umuhinzi.app`;
}

export const isPhoneAccount = (email?: string | null) => !!email?.endsWith("@phone.umuhinzi.app");
