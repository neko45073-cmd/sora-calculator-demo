/**
 * Financial calculation engine for Singapore SORA mortgages and daily interest accrual.
 * Adheres to MAS guidelines and Singapore bank conventions (Actual/365).
 */

import {
  BankPackage,
  DailyAccrualEntry,
  DailySoraRecord,
  LoanParameters,
  LoanSummaryResult,
  MonthlyAmortizationEntry,
} from '../types/sora';

/**
 * Standard Singapore Bank Loan Packages (benchmarked to 3M or 1M SORA)
 */
export const POPULAR_SG_BANK_PACKAGES: BankPackage[] = [
  {
    id: 'dbs-3m-sora',
    bankName: 'DBS Bank',
    packageName: 'DBS 3M SORA Floating',
    tenor: '3M',
    spreadYear1To3: 0.65,
    spreadThereafter: 0.85,
    lockInYears: 2,
    minLoanAmount: 500000,
    remarks: 'Most popular Singapore mortgage. Rate refreshes every 3 months based on MAS 3M Compounded SORA.',
    badge: 'Popular',
  },
  {
    id: 'ocbc-1m-sora',
    bankName: 'OCBC Bank',
    packageName: 'OCBC 1M SORA Flexi',
    tenor: '1M',
    spreadYear1To3: 0.68,
    spreadThereafter: 0.88,
    lockInYears: 2,
    minLoanAmount: 400000,
    remarks: 'Monthly rate resets. Fast capture of falling interest rate cycles.',
    badge: 'Quick Reset',
  },
  {
    id: 'uob-3m-sora',
    bankName: 'UOB',
    packageName: 'UOB 3M SORA Home Loan',
    tenor: '3M',
    spreadYear1To3: 0.65,
    spreadThereafter: 0.80,
    lockInYears: 3,
    minLoanAmount: 500000,
    remarks: 'Lower long-term spread thereafter (+0.80%). Includes legal subsidy for refinancing.',
  },
  {
    id: 'hsbc-3m-sora',
    bankName: 'HSBC Singapore',
    packageName: 'HSBC SmartMortgage (3M SORA)',
    tenor: '3M',
    spreadYear1To3: 0.60,
    spreadThereafter: 0.80,
    lockInYears: 2,
    minLoanAmount: 800000,
    remarks: 'Interest-offset account allows high deposit balances to offset mortgage interest.',
    badge: 'Interest Offset',
  },
  {
    id: 'scb-3m-sora',
    bankName: 'Standard Chartered',
    packageName: 'SCB MortgageOne 3M SORA',
    tenor: '3M',
    spreadYear1To3: 0.70,
    spreadThereafter: 0.85,
    lockInYears: 2,
    minLoanAmount: 500000,
    remarks: '2/3 of deposit balances offset loan interest directly at the same loan rate.',
  },
];

/**
 * Calculate Monthly Payment (Standard Annuity Formula)
 * M = P * [ i * (1 + i)^N ] / [ (1 + i)^N - 1 ]
 * where i = annualRate / 12
 */
export function calculateMonthlyPayment(
  principal: number,
  annualRatePct: number,
  tenureYears: number
): number {
  if (principal <= 0 || tenureYears <= 0) return 0;
  if (annualRatePct <= 0) {
    return principal / (tenureYears * 12);
  }

  const monthlyRate = annualRatePct / 100 / 12;
  const totalMonths = tenureYears * 12;
  const factor = Math.pow(1 + monthlyRate, totalMonths);

  const monthlyPayment = (principal * (monthlyRate * factor)) / (factor - 1);
  return Number(monthlyPayment.toFixed(2));
}

/**
 * Generate full monthly and cumulative amortization schedule
 */
export function generateAmortizationSchedule(
  params: LoanParameters,
  effectiveRatePct: number
): LoanSummaryResult {
  const principal = params.loanAmount;
  const totalMonths = params.tenureYears * 12;
  const monthlyPayment = calculateMonthlyPayment(
    principal,
    effectiveRatePct,
    params.tenureYears
  );

  const monthlyRate = effectiveRatePct / 100 / 12;
  const schedule: MonthlyAmortizationEntry[] = [];

  let balance = principal;
  let cumulativeInterest = 0;
  let cumulativePrincipal = 0;

  const startYear = new Date(params.startDate || new Date()).getFullYear();
  const startMonth = new Date(params.startDate || new Date()).getMonth(); // 0-indexed

  for (let m = 1; m <= totalMonths; m++) {
    const interestPayment = balance * monthlyRate;
    let principalPayment = monthlyPayment - interestPayment;

    // Handle last payment edge case
    if (m === totalMonths || principalPayment > balance) {
      principalPayment = balance;
    }

    balance = Math.max(0, balance - principalPayment);
    cumulativeInterest += interestPayment;
    cumulativePrincipal += principalPayment;

    const entryDate = new Date(startYear, startMonth + m - 1, 1);
    const dateStr = entryDate.toLocaleDateString('en-SG', {
      month: 'short',
      year: 'numeric',
    });

    schedule.push({
      month: m,
      year: Math.ceil(m / 12),
      date: dateStr,
      payment: Number((principalPayment + interestPayment).toFixed(2)),
      principalPayment: Number(principalPayment.toFixed(2)),
      interestPayment: Number(interestPayment.toFixed(2)),
      remainingBalance: Number(balance.toFixed(2)),
      cumulativeInterest: Number(cumulativeInterest.toFixed(2)),
      cumulativePrincipal: Number(cumulativePrincipal.toFixed(2)),
    });

    if (balance <= 0) break;
  }

  const totalInterest = cumulativeInterest;
  const totalAmount = principal + totalInterest;

  return {
    monthlyPayment,
    baseSoraRate: effectiveRatePct - params.bankSpread,
    bankSpread: params.bankSpread,
    effectiveRate: effectiveRatePct,
    totalInterestPayable: Number(totalInterest.toFixed(2)),
    totalAmountPayable: Number(totalAmount.toFixed(2)),
    totalPaymentsCount: schedule.length,
    schedule,
  };
}

/**
 * Exact Daily Overnight Interest Accrual calculation (Actual/365 convention)
 * Used by Singapore financial institutions for SORA in Arrears.
 */
export function calculateDailyAccrual(
  loanAmount: number,
  bankSpread: number,
  dailyRecords: DailySoraRecord[]
): {
  entries: DailyAccrualEntry[];
  totalInterest: number;
  compoundedSora: number;
  effectiveCompoundedRate: number;
} {
  if (dailyRecords.length === 0 || loanAmount <= 0) {
    return {
      entries: [],
      totalInterest: 0,
      compoundedSora: 0,
      effectiveCompoundedRate: 0,
    };
  }

  // Sort chronologically ascending
  const sorted = [...dailyRecords].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  let cumulativeInterest = 0;
  const entries: DailyAccrualEntry[] = [];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  let totalCalendarDays = 0;
  let compoundFactor = 1.0;

  for (const record of sorted) {
    const d = new Date(record.date);
    const dayOfWeek = daysOfWeek[d.getDay()];
    const calendarDays = record.calendarDays || 1;
    totalCalendarDays += calendarDays;

    // Compounding multiplier for MAS formula
    const dailySoraDec = record.rate / 100;
    compoundFactor *= 1 + (dailySoraDec * calendarDays) / 365;

    // Singapore bank daily interest formula:
    // Interest = Outstanding Balance * (Effective Rate / 100) * (Calendar Days / 365)
    const effectiveRate = record.rate + bankSpread;
    const dailyInterest =
      (loanAmount * (effectiveRate / 100) * calendarDays) / 365;

    cumulativeInterest += dailyInterest;

    entries.push({
      date: record.date,
      dayOfWeek,
      calendarDays,
      dailySora: record.rate,
      bankSpread,
      effectiveRate: Number(effectiveRate.toFixed(4)),
      dailyInterest: Number(dailyInterest.toFixed(2)),
      cumulativeInterest: Number(cumulativeInterest.toFixed(2)),
      principalBalance: loanAmount,
    });
  }

  const compoundedSora =
    totalCalendarDays > 0
      ? (compoundFactor - 1) * (365 / totalCalendarDays) * 100
      : 0;

  return {
    entries,
    totalInterest: Number(cumulativeInterest.toFixed(2)),
    compoundedSora: Number(compoundedSora.toFixed(4)),
    effectiveCompoundedRate: Number((compoundedSora + bankSpread).toFixed(4)),
  };
}

/**
 * MAS TDSR Regulatory Stress Test Rate
 * Under MAS regulations, Singapore financial institutions must assess residential loan applications
 * at a stress test rate (currently 4.00% p.a. for residential properties).
 */
export const MAS_RESIDENTIAL_STRESS_RATE = 4.0;

export interface SensitivityLadderRow {
  rateScenario: string;
  nominalRate: number;
  monthlyPayment: number;
  paymentDelta: number;
  totalInterest: number;
  isCurrent: boolean;
  isMasStressTest?: boolean;
}

export function calculateSensitivityLadder(
  principal: number,
  tenureYears: number,
  currentEffectiveRate: number
): SensitivityLadderRow[] {
  const baseMonthly = calculateMonthlyPayment(
    principal,
    currentEffectiveRate,
    tenureYears
  );

  const rateDeltas = [-1.0, -0.5, -0.25, 0, 0.25, 0.5, 1.0, 1.5, 2.0];
  const rows: SensitivityLadderRow[] = [];

  for (const delta of rateDeltas) {
    const rate = Math.max(0.1, Number((currentEffectiveRate + delta).toFixed(2)));
    const monthly = calculateMonthlyPayment(principal, rate, tenureYears);
    const deltaPayment = monthly - baseMonthly;
    const totalInterest = monthly * tenureYears * 12 - principal;

    let scenarioLabel = `${delta >= 0 ? '+' : ''}${delta.toFixed(2)}%`;
    if (delta === 0) scenarioLabel = 'Current Rate';

    rows.push({
      rateScenario: scenarioLabel,
      nominalRate: rate,
      monthlyPayment: monthly,
      paymentDelta: deltaPayment,
      totalInterest: Math.max(0, totalInterest),
      isCurrent: delta === 0,
    });
  }

  // Also append MAS 4.00% Stress Test
  const stressMonthly = calculateMonthlyPayment(
    principal,
    MAS_RESIDENTIAL_STRESS_RATE,
    tenureYears
  );
  const stressInterest = stressMonthly * tenureYears * 12 - principal;

  rows.push({
    rateScenario: 'MAS 4.00% Regulatory Stress Test',
    nominalRate: MAS_RESIDENTIAL_STRESS_RATE,
    monthlyPayment: stressMonthly,
    paymentDelta: stressMonthly - baseMonthly,
    totalInterest: Math.max(0, stressInterest),
    isCurrent: false,
    isMasStressTest: true,
  });

  return rows;
}

/**
 * Format currency in Singapore Dollars
 */
export function formatSGD(amount: number, decimals: number = 0): string {
  return new Intl.NumberFormat('en-SG', {
    style: 'currency',
    currency: 'SGD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

/**
 * Format percentage with fixed decimal places
 */
export function formatPct(val: number, decimals: number = 2): string {
  return `${val.toFixed(decimals)}%`;
}

/**
 * Export Amortization Schedule to CSV string
 */
export function exportScheduleToCsv(schedule: MonthlyAmortizationEntry[]): string {
  const headers = [
    'Month',
    'Year',
    'Date',
    'Monthly Installment (SGD)',
    'Principal Paid (SGD)',
    'Interest Paid (SGD)',
    'Remaining Balance (SGD)',
    'Cumulative Interest (SGD)',
  ];

  const rows = schedule.map((item) => [
    item.month,
    item.year,
    `"${item.date}"`,
    item.payment.toFixed(2),
    item.principalPayment.toFixed(2),
    item.interestPayment.toFixed(2),
    item.remainingBalance.toFixed(2),
    item.cumulativeInterest.toFixed(2),
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

/**
 * Trigger browser download of CSV
 */
export function downloadCsv(filename: string, csvContent: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
