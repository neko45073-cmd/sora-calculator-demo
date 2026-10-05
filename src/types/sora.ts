export type SoraTenor = '1M' | '3M' | '6M' | 'daily' | 'custom';

export interface DailySoraRecord {
  date: string; // YYYY-MM-DD
  rate: number; // Percentage, e.g. 3.42
  calendarDays: number; // e.g. 1 on weekdays, 3 on Friday for weekend
  borrowingVolume?: number; // SGD Million if available
  publishedAt?: string;
}

export interface MasSoraData {
  latestDate: string;
  source: 'live-mas-api' | 'verified-mas-baseline';
  dailySora: number; // Daily overnight fixing %
  compSora1M: number; // 1-month compounded %
  compSora3M: number; // 3-month compounded %
  compSora6M: number; // 6-month compounded %
  soraIndex: number;
  historicalDaily: DailySoraRecord[];
  lastFetchedAt: string;
}

export interface LoanParameters {
  propertyType: 'hdb' | 'condo' | 'landed' | 'commercial';
  loanAmount: number; // SGD
  tenureYears: number; // e.g. 25
  tenorType: SoraTenor;
  bankSpread: number; // e.g. 0.65%
  customSoraRate?: number; // if user overrides
  startDate: string; // YYYY-MM-DD
}

export interface MonthlyAmortizationEntry {
  month: number;
  year: number;
  date: string;
  payment: number;
  principalPayment: number;
  interestPayment: number;
  remainingBalance: number;
  cumulativeInterest: number;
  cumulativePrincipal: number;
}

export interface DailyAccrualEntry {
  date: string;
  dayOfWeek: string;
  calendarDays: number;
  dailySora: number;
  bankSpread: number;
  effectiveRate: number;
  dailyInterest: number;
  cumulativeInterest: number;
  principalBalance: number;
}

export interface LoanSummaryResult {
  monthlyPayment: number;
  baseSoraRate: number;
  bankSpread: number;
  effectiveRate: number;
  totalInterestPayable: number;
  totalAmountPayable: number;
  totalPaymentsCount: number;
  schedule: MonthlyAmortizationEntry[];
}

export interface BankPackage {
  id: string;
  bankName: string;
  packageName: string;
  tenor: SoraTenor;
  spreadYear1To3: number;
  spreadThereafter: number;
  lockInYears: number;
  minLoanAmount: number;
  remarks: string;
  badge?: string;
}
