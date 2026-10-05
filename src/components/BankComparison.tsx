import React from 'react';
import { MasSoraData } from '../types/sora';
import {
  POPULAR_SG_BANK_PACKAGES,
  calculateMonthlyPayment,
  formatSGD,
} from '../utils/calculator';
import { Check, ShieldCheck, ArrowRight } from 'lucide-react';

interface BankComparisonProps {
  masData: MasSoraData;
  loanAmount: number;
  tenureYears: number;
  onApplyPackage: (tenor: '1M' | '3M', spread: number) => void;
}

export const BankComparison: React.FC<BankComparisonProps> = ({
  masData,
  loanAmount,
  tenureYears,
  onApplyPackage,
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Singapore Bank SORA Loan Packages
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Live market comparison across major local &amp; foreign banks in Singapore (DBS, OCBC, UOB, HSBC, SCB).
            </p>
          </div>
          <div className="text-xs text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg font-mono">
            Modeled on {formatSGD(loanAmount, 0)} · {tenureYears} yrs
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
          {POPULAR_SG_BANK_PACKAGES.map((pkg) => {
            const baseSora = pkg.tenor === '1M' ? masData.compSora1M : masData.compSora3M;
            const effectiveYear1to3 = baseSora + pkg.spreadYear1To3;
            const monthlyPayment = calculateMonthlyPayment(
              loanAmount,
              effectiveYear1to3,
              tenureYears
            );
            const totalInterestApprox =
              monthlyPayment * tenureYears * 12 - loanAmount;

            return (
              <div
                key={pkg.id}
                className="border border-slate-200 hover:border-slate-300 rounded-xl p-4 bg-white flex flex-col justify-between transition-all hover:shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-semibold text-slate-500">
                      {pkg.bankName}
                    </span>
                    {pkg.badge && (
                      <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                        {pkg.badge}
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mb-2">
                    {pkg.packageName}
                  </h3>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 mb-3">
                    <div className="text-[11px] text-slate-500">Est. Monthly Payment</div>
                    <div className="text-xl font-bold font-mono text-slate-900 tabular-nums">
                      {formatSGD(monthlyPayment, 2)}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 font-mono">
                      {baseSora.toFixed(3)}% ({pkg.tenor} SORA) + {pkg.spreadYear1To3.toFixed(2)}%
                      = <span className="font-semibold text-slate-800">{effectiveYear1to3.toFixed(3)}%</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 mb-4 font-mono">
                    <div className="flex justify-between">
                      <span className="font-sans text-slate-500">Lock-in Period:</span>
                      <span className="font-medium text-slate-800">{pkg.lockInYears} Years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-sans text-slate-500">Thereafter Spread:</span>
                      <span className="font-medium text-slate-800">+{pkg.spreadThereafter.toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-sans text-slate-500">Total Approx. Interest:</span>
                      <span className="font-medium text-amber-700">{formatSGD(totalInterestApprox, 0)}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-normal mb-4 font-sans">
                    {pkg.remarks}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onApplyPackage(pkg.tenor as '1M' | '3M', pkg.spreadYear1To3)}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-900 hover:text-white rounded-lg transition-colors"
                >
                  <span>Apply to Calculator</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
