export interface Settlement {
  workHistoryId: string;
  grossPay: number; // 기본 일급
  additionalPay: number; // 추가 수당
  totalPay: number; // 총 지급액
  deductions: {
    incomeTax: number; // 소득세
    localIncomeTax: number; // 지방소득세
    employmentInsurance: number; // 고용보험
    serviceFee: number; // 수수료
    other: number; // 기타
  };
  totalDeductions: number; // 공제 총액
  netPay: number; // 실 지급액
  settlementDate: string; // YYYY-MM-DD
  memo?: string; // 메모
}

// In-memory store, in a real app this would be in a database.
// This is managed via component state, defining the type and initial empty array here.
export const SETTLEMENT_DATA: Settlement[] = [];
