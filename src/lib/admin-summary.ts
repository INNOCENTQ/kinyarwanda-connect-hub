export type Payment = {
  id: string;
  kind: string;
  amount: number;
  phone: string;
  status: string;
  created_at: string;
};

export function summarizePayments(payments: Payment[]) {
  return {
    approvedAmount: payments.filter(p => p.status === "approved").reduce((sum, p) => sum + p.amount, 0),
    pending: payments.filter(p => p.status === "pending").length,
    approved: payments.filter(p => p.status === "approved").length,
    rejected: payments.filter(p => p.status === "rejected").length,
  };
}