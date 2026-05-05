// Mirrors backend PayslipResponseDto.
export type PayslipStatus = 'draft' | 'pending' | 'approved' | 'paid' | 'cancelled';
export type PaymentMethod = 'bank' | 'cash' | 'check';

export interface PayslipAdjustmentLine {
  id: string;
  name: string;
  amount: number;
  type: 'bonus' | 'allowance' | 'commission' | 'tax' | 'insurance' | 'loan' | 'other';
}

export interface Payslip {
  id: string;
  storeId: string;
  staffId: string;
  staffName: string;
  period: string;
  periodStart: string;
  periodEnd: string;
  baseSalary: number;
  hoursWorked: number | null;
  overtimeHours: number | null;
  overtimeRate: number | null;
  additions: PayslipAdjustmentLine[];
  deductions: PayslipAdjustmentLine[];
  grossPay: number;
  netPay: number;
  status: PayslipStatus;
  paymentDate: string | null;
  paymentMethod: PaymentMethod | null;
  receiptUrl: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}
