import React, { useState } from 'react';
import { formatSGD, calculateMonthlyPayment, MAS_RESIDENTIAL_STRESS_RATE } from '../utils/calculator';
import { CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';

interface TdsrAffordabilityProps {
  loanAmount: number;
  tenureYears: number;
  currentMonthlyPayment: number;
  propertyType: 'hdb' | 'condo' | 'landed' | 'commercial';
}

export const TdsrAffordability: React.FC<TdsrAffordabilityProps> = ({
  loanAmount,
  tenureYears,
  propertyType,
}) => {
  const [monthlyGrossIncome, setMonthlyGrossIncome] = useState<number>(12000);
  const [otherMonthlyDebt, setOtherMonthlyDebt] = useState<number>(1200); // car loan, cards, etc.

  // Stress-tested mortgage payment under MAS 4.00%
  const stressMortgagePayment = calculateMonthlyPayment(
    loanAmount,
    MAS_RESIDENTIAL_STRESS_RATE,
    tenureYears
  );

  const totalMonthlyCommitments = stressMortgagePayment + otherMonthlyDebt;
  const tdsrPercentage = monthlyGrossIncome > 0 ? (totalMonthlyCommitments / monthlyGrossIncome) * 100 : 0;
  const msrPercentage = monthlyGrossIncome > 0 ? (stressMortgagePayment / monthlyGrossIncome) * 100 : 0;

  const isHdbOrEc = propertyType === 'hdb';
  const passesTdsr = tdsrPercentage <= 55;
  const passesMsr = !isHdbOrEc || msrPercentage <= 30;

  const maxAllowedTdsrDebt = monthlyGrossIncome * 0.55;
  const maxAllowedMortgageUnderTdsr = Math.max(0, maxAllowedTdsrDebt - otherMonthlyDebt);
  const maxAllowedMortgageUnderMsr = monthlyGrossIncome * 0.30;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-6">
      <div className="pb-4 border-b border-slate-100">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">
          MAS TDSR &amp; MSR Affordability Assessment
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Evaluates regulatory debt limits required by MAS for Singapore property loan approval.
        </p>
      </div>

      {/* Income & Other Debt Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Gross Monthly Income (SGD)
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-mono text-xs">
              S$
            </span>
            <input
              type="number"
              min={1000}
              step={500}
              value={monthlyGrossIncome}
              onChange={(e) => setMonthlyGrossIncome(Math.max(0, Number(e.target.value)))}
              className="w-full pl-8 pr-3 py-2 text-xs font-mono font-bold text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Combined monthly income if co-borrowing
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Other Monthly Debt Commitments (SGD)
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-mono text-xs">
              S$
            </span>
            <input
              type="number"
              min={0}
              step={100}
              value={otherMonthlyDebt}
              onChange={(e) => setOtherMonthlyDebt(Math.max(0, Number(e.target.value)))}
              className="w-full pl-8 pr-3 py-2 text-xs font-mono font-bold text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Car loans, credit cards minimum, study loans, personal loans
          </div>
        </div>
      </div>

      {/* Compliance Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* TDSR Card */}
        <div
          className={`p-4 rounded-xl border ${
            passesTdsr
              ? 'border-emerald-200 bg-emerald-50/40'
              : 'border-rose-200 bg-rose-50/40'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">
              Total Debt Servicing Ratio (TDSR)
            </span>
            {passesTdsr ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Pass (≤ 55%)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700">
                <XCircle className="w-4 h-4 text-rose-600" />
                Exceeds 55% Limit
              </span>
            )}
          </div>

          <div className="text-3xl font-extrabold font-mono tabular-nums text-slate-900 my-1">
            {tdsrPercentage.toFixed(1)}%
          </div>

          <div className="space-y-1 text-xs text-slate-600 mt-3 pt-3 border-t border-slate-200/60 font-mono">
            <div className="flex justify-between">
              <span>Stress Mortgage Payment (4.00%):</span>
              <span className="font-bold text-slate-800">{formatSGD(stressMortgagePayment, 2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Other Debt Obligations:</span>
              <span>{formatSGD(otherMonthlyDebt, 2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Assessed Monthly Outflow:</span>
              <span className="font-bold text-slate-900">{formatSGD(totalMonthlyCommitments, 2)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Max Allowable Under 55% Cap:</span>
              <span>{formatSGD(maxAllowedTdsrDebt, 2)}</span>
            </div>
          </div>
        </div>

        {/* MSR Card (for HDB / EC) */}
        <div
          className={`p-4 rounded-xl border ${
            !isHdbOrEc
              ? 'border-slate-200 bg-slate-50/50'
              : passesMsr
              ? 'border-emerald-200 bg-emerald-50/40'
              : 'border-rose-200 bg-rose-50/40'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">
              Mortgage Servicing Ratio (MSR)
            </span>
            {!isHdbOrEc ? (
              <span className="text-xs text-slate-500">N.A. (Private Property)</span>
            ) : passesMsr ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Pass (≤ 30%)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700">
                <XCircle className="w-4 h-4 text-rose-600" />
                Exceeds 30% Limit
              </span>
            )}
          </div>

          <div className="text-3xl font-extrabold font-mono tabular-nums text-slate-900 my-1">
            {isHdbOrEc ? `${msrPercentage.toFixed(1)}%` : 'Exempt'}
          </div>

          <div className="space-y-1 text-xs text-slate-600 mt-3 pt-3 border-t border-slate-200/60 font-mono">
            <div className="flex justify-between">
              <span>Applicable To:</span>
              <span className="font-sans font-medium text-slate-800">HDB &amp; EC Purchases</span>
            </div>
            <div className="flex justify-between">
              <span>Regulatory Limit:</span>
              <span>30% of Gross Income</span>
            </div>
            <div className="flex justify-between">
              <span>Max Allowable Monthly Installment:</span>
              <span className="font-bold text-slate-900">{formatSGD(maxAllowedMortgageUnderMsr, 2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Explanatory notes */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 space-y-2">
        <div className="flex items-center gap-1.5 font-semibold text-slate-800">
          <Info className="w-4 h-4 text-slate-600" />
          <span>Singapore MAS Regulatory Rules Summary</span>
        </div>
        <ul className="list-disc list-inside space-y-1 leading-relaxed text-slate-600">
          <li>
            <strong>Total Debt Servicing Ratio (TDSR):</strong> Caps total debt repayments at <strong>55%</strong> of gross monthly income for all property loans in Singapore.
          </li>
          <li>
            <strong>Mortgage Servicing Ratio (MSR):</strong> Caps housing mortgage repayments at <strong>30%</strong> of gross income for HDB flats and ECs.
          </li>
          <li>
            <strong>Medium-term stress rate:</strong> Banks compute your monthly repayment with MAS's mandated stress test rate of <strong>4.00%</strong> to ensure you can still comfortably afford payments even if SORA rises.
          </li>
        </ul>
      </div>
    </div>
  );
};
