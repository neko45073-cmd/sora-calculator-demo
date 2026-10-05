import React from 'react';
import { LoanSummaryResult, LoanParameters } from '../types/sora';
import { formatSGD } from '../utils/calculator';
import { ArrowUpRight } from 'lucide-react';

interface RepaymentSummaryProps {
  summary: LoanSummaryResult;
  params: LoanParameters;
}

export const RepaymentSummary: React.FC<RepaymentSummaryProps> = ({ summary, params }) => {
  const principal = params.loanAmount;
  const totalInterest = summary.totalInterestPayable;
  const totalAmount = summary.totalAmountPayable;
  const principalPct = totalAmount > 0 ? (principal / totalAmount) * 100 : 0;
  const interestPct = totalAmount > 0 ? (totalInterest / totalAmount) * 100 : 0;

  // Monthly payment per S$100k
  const per100k = principal > 0 ? (summary.monthlyPayment / principal) * 100000 : 0;

  const firstMonth = summary.schedule[0];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-5">
        <div>
          <h3 className="text-base font-semibold text-slate-900 tracking-tight">
            Repayment Summary
          </h3>
          <div className="text-xs text-slate-500 mt-0.5">
            Based on {summary.effectiveRate.toFixed(3)}% Effective Interest Rate
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-500">Per S$100k Borrowed</div>
          <div className="text-xs font-mono font-bold text-slate-800 tabular-nums">
            {formatSGD(per100k, 2)} / mo
          </div>
        </div>
      </div>

      {/* Hero Monthly Repayment Card */}
      <div className="bg-slate-900 text-white rounded-xl p-5 mb-5 shadow-xs">
        <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
          Estimated Monthly Installment
        </div>
        <div className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight tabular-nums text-white">
          {formatSGD(summary.monthlyPayment, 2)}
        </div>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-300 mt-2">
          <span>Base SORA: {summary.baseSoraRate.toFixed(4)}%</span>
          <span aria-hidden="true">·</span>
          <span>Bank Spread: +{summary.bankSpread.toFixed(2)}%</span>
          <span aria-hidden="true">·</span>
          <span className="text-emerald-400 font-semibold">Total: {summary.effectiveRate.toFixed(3)}% p.a.</span>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
          <div className="text-xs text-slate-500 mb-1">Total Loan Principal</div>
          <div className="text-base font-bold font-mono text-slate-900 tabular-nums">
            {formatSGD(principal, 0)}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {principalPct.toFixed(1)}% of total paid
          </div>
        </div>

        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
          <div className="text-xs text-slate-500 mb-1">Total Interest Payable</div>
          <div className="text-base font-bold font-mono text-amber-700 tabular-nums">
            {formatSGD(totalInterest, 0)}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {interestPct.toFixed(1)}% of total paid
          </div>
        </div>

        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 col-span-2 sm:col-span-1">
          <div className="text-xs text-slate-500 mb-1">Total Amount Payable</div>
          <div className="text-base font-bold font-mono text-slate-900 tabular-nums">
            {formatSGD(totalAmount, 0)}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Over {params.tenureYears} years ({summary.totalPaymentsCount} installments)
          </div>
        </div>
      </div>

      {/* Visual Amortization Progress Bar */}
      <div className="mb-5">
        <div className="flex justify-between items-center text-xs text-slate-600 mb-1.5 font-medium">
          <span>Principal vs Interest Proportion</span>
          <span className="font-mono">{principalPct.toFixed(0)}% / {interestPct.toFixed(0)}%</span>
        </div>
        <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden flex">
          <div
            style={{ width: `${principalPct}%` }}
            className="bg-slate-900 h-full transition-all duration-300"
            title={`Principal: ${principalPct.toFixed(1)}%`}
          />
          <div
            style={{ width: `${interestPct}%` }}
            className="bg-amber-500 h-full transition-all duration-300"
            title={`Interest: ${interestPct.toFixed(1)}%`}
          />
        </div>
        <div className="flex justify-between items-center text-[11px] text-slate-500 mt-1.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-slate-900 inline-block" />
            <span>Principal: {formatSGD(principal, 0)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-amber-500 inline-block" />
            <span>Interest: {formatSGD(totalInterest, 0)}</span>
          </div>
        </div>
      </div>

      {/* First Payment Breakdown Detail */}
      {firstMonth && (
        <div className="pt-3 border-t border-slate-100 text-xs">
          <div className="text-slate-500 mb-2 font-medium">Initial Payment Split (Month 1):</div>
          <div className="grid grid-cols-2 gap-2 text-slate-700">
            <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
              <span className="text-slate-500 block text-[11px]">Interest Component:</span>
              <span className="font-mono font-bold text-slate-900 tabular-nums">
                {formatSGD(firstMonth.interestPayment, 2)}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                ({((firstMonth.interestPayment / summary.monthlyPayment) * 100).toFixed(0)}% of monthly installment)
              </span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
              <span className="text-slate-500 block text-[11px]">Principal Paydown:</span>
              <span className="font-mono font-bold text-slate-900 tabular-nums">
                {formatSGD(firstMonth.principalPayment, 2)}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                ({((firstMonth.principalPayment / summary.monthlyPayment) * 100).toFixed(0)}% goes to equity)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Quick advice note */}
      <div className="mt-4 p-3 bg-emerald-50/50 border border-emerald-100 rounded-lg text-xs text-emerald-900 flex items-start gap-2">
        <ArrowUpRight className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold">Singapore SORA Tip:</span> In a declining interest rate environment, 1M SORA adjusts your interest down within 30 days, whereas 3M SORA locks your lower or higher fixing for a full quarter.
        </div>
      </div>
    </div>
  );
};
