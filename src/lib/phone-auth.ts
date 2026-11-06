/** Farmers without email sign in with phone + password; the phone maps to an internal login address. */
export function phoneToEmail(phone: string): string | null {
  const d = phone.replace(/\D/g, "");
  const local = d.startsWith("250") ? d.slice(3) : d.replace(/^0/, "");
  if (!/^7\d{8}$/.test(local)) return null;
  return `250${local}@phone.umuhinzi.app`;
}
export const isPhoneAccount = (email?: string | null) => !!email?.endsWith("@phone.umuhinzi.app");
