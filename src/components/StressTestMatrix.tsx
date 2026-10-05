import React, { useMemo } from 'react';
import { calculateSensitivityLadder, formatSGD } from '../utils/calculator';
import { AlertCircle, ShieldAlert } from 'lucide-react';

interface StressTestMatrixProps {
  loanAmount: number;
  tenureYears: number;
  currentEffectiveRate: number;
}

export const StressTestMatrix: React.FC<StressTestMatrixProps> = ({
  loanAmount,
  tenureYears,
  currentEffectiveRate,
}) => {
  const ladder = useMemo(() => {
    return calculateSensitivityLadder(loanAmount, tenureYears, currentEffectiveRate);
  }, [loanAmount, tenureYears, currentEffectiveRate]);

  return (
    <div className="space-y-6">
      {/* Overview Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              MAS Stress Testing &amp; Rate Sensitivity Ladder
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Evaluates cashflow resilience under floating rate shocks and against the official MAS 4.00% TDSR regulatory stress threshold.
            </p>
          </div>
          <div className="text-xs text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg font-mono">
            Principal: {formatSGD(loanAmount, 0)} · {tenureYears} yrs
          </div>
        </div>

        {/* MAS Advisory Box */}
        <div className="mt-4 p-4 bg-amber-50/60 border border-amber-200 rounded-lg flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 leading-relaxed">
            <span className="font-semibold block mb-0.5">MAS Regulatory Stress Test Rule:</span>
            Under Monetary Authority of Singapore (MAS) rules, banks assess your loan eligibility using a minimum stress-test interest rate of <strong>4.00% p.a.</strong> (or prevailing market rate + margin, whichever is higher). Your monthly debt commitments at 4.00% must not exceed 55% of your gross monthly income (TDSR).
          </div>
        </div>

        {/* Sensitivity Table */}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
                <th className="py-2.5 px-4">Rate Scenario</th>
                <th className="py-2.5 px-4 text-right">Nominal Rate (% p.a.)</th>
                <th className="py-2.5 px-4 text-right">Monthly Installment</th>
                <th className="py-2.5 px-4 text-right">Payment Change (SGD)</th>
                <th className="py-2.5 px-4 text-right">Total Interest Payable</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
              {ladder.map((row) => {
                const isPositiveDelta = row.paymentDelta > 0;
                const isZeroDelta = row.paymentDelta === 0;

                return (
                  <tr
                    key={row.rateScenario}
                    className={`transition-colors ${
                      row.isCurrent
                        ? 'bg-slate-900 text-white font-semibold'
                        : row.isMasStressTest
                        ? 'bg-amber-50/80 text-amber-950 font-semibold border-l-4 border-l-amber-600'
                        : 'hover:bg-slate-50 text-slate-900'
                    }`}
                  >
                    <td className="py-3 px-4 font-sans">
                      <div className="flex items-center gap-2">
                        <span>{row.rateScenario}</span>
                        {row.isCurrent && (
                          <span className="text-[10px] bg-slate-700 text-emerald-300 px-1.5 py-0.5 rounded font-sans uppercase">
                            Current
                          </span>
                        )}
                        {row.isMasStressTest && (
                          <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-sans uppercase">
                            MAS Rule
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-bold">
                      {row.nominalRate.toFixed(2)}%
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-sm">
                      {formatSGD(row.monthlyPayment, 2)}
                    </td>
                    <td
                      className={`py-3 px-4 text-right ${
                        row.isCurrent
                          ? 'text-slate-300'
                          : row.isMasStressTest
                          ? 'text-amber-900 font-bold'
                          : isPositiveDelta
                          ? 'text-rose-600 font-medium'
                          : isZeroDelta
                          ? 'text-slate-500'
                          : 'text-emerald-700 font-medium'
                      }`}
                    >
                      {isZeroDelta
                        ? '-'
                        : `${isPositiveDelta ? '+' : ''}${formatSGD(row.paymentDelta, 2)}/mo`}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {formatSGD(row.totalInterest, 0)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
