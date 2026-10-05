import React, { useState, useMemo } from 'react';
import { DailySoraRecord, MasSoraData } from '../types/sora';
import { calculateDailyAccrual, formatSGD, downloadCsv } from '../utils/calculator';
import { Calendar, Download, Info, CheckCircle2 } from 'lucide-react';

interface DailyAccrualCalculatorProps {
  masData: MasSoraData;
  defaultLoanAmount: number;
  defaultBankSpread: number;
}

export const DailyAccrualCalculator: React.FC<DailyAccrualCalculatorProps> = ({
  masData,
  defaultLoanAmount,
  defaultBankSpread,
}) => {
  const [loanPrincipal, setLoanPrincipal] = useState<number>(defaultLoanAmount);
  const [bankSpread, setBankSpread] = useState<number>(defaultBankSpread);
  const [periodDays, setPeriodDays] = useState<number>(30); // 14, 30, or all (60)

  // Slice historical daily records according to period
  const selectedRecords: DailySoraRecord[] = useMemo(() => {
    return masData.historicalDaily.slice(0, periodDays);
  }, [masData.historicalDaily, periodDays]);

  const { entries, totalInterest, compoundedSora, effectiveCompoundedRate } = useMemo(() => {
    return calculateDailyAccrual(loanPrincipal, bankSpread, selectedRecords);
  }, [loanPrincipal, bankSpread, selectedRecords]);

  const averageDailyInterest = entries.length > 0 ? totalInterest / entries.reduce((acc, e) => acc + e.calendarDays, 0) : 0;
  const totalCalendarDays = entries.reduce((acc, e) => acc + e.calendarDays, 0);

  const handleExportDailyCsv = () => {
    const headers = [
      'Fixing Date',
      'Day',
      'Calendar Days (ni)',
      'MAS Overnight SORA (%)',
      'Bank Spread (%)',
      'Effective Rate (%)',
      'Daily Interest Accrual (SGD)',
      'Cumulative Interest (SGD)',
    ];

    const rows = entries.map((e) => [
      e.date,
      e.dayOfWeek,
      e.calendarDays,
      e.dailySora.toFixed(4),
      e.bankSpread.toFixed(2),
      e.effectiveRate.toFixed(4),
      e.dailyInterest.toFixed(2),
      e.cumulativeInterest.toFixed(2),
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    downloadCsv(`MAS_Daily_SORA_Accrual_${periodDays}days.csv`, csv);
  };

  return (
    <div className="space-y-6">
      {/* Intro Header Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Daily Overnight Accrual Calculator (SORA in Arrears)
              </h2>
              <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono">
                Actual/365
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Reads official MAS-backed daily overnight fixings to compute exact interest payments
              compounded day-by-day. Friday fixings apply across 3 calendar days (Fri, Sat, Sun).
            </p>
          </div>

          <button
            onClick={handleExportDailyCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap self-start md:self-auto"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Accrual Log (CSV)</span>
          </button>
        </div>

        {/* Input Parameters for Daily Accrual */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Outstanding Loan Balance (SGD)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-mono text-xs">
                S$
              </span>
              <input
                type="number"
                min={10000}
                step={10000}
                value={loanPrincipal}
                onChange={(e) => setLoanPrincipal(Math.max(0, Number(e.target.value)))}
                className="w-full pl-8 pr-3 py-2 text-xs font-mono font-bold text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Bank Margin / Spread (% p.a.)
            </label>
            <input
              type="number"
              step={0.01}
              min={0}
              value={bankSpread}
              onChange={(e) => setBankSpread(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs font-mono font-bold text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Billing Cycle / Period
            </label>
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              <button
                type="button"
                onClick={() => setPeriodDays(14)}
                className={`flex-1 py-1 text-xs font-medium rounded transition-colors ${
                  periodDays === 14 ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                14 Days
              </button>
              <button
                type="button"
                onClick={() => setPeriodDays(30)}
                className={`flex-1 py-1 text-xs font-medium rounded transition-colors ${
                  periodDays === 30 ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                30 Days (1M)
              </button>
              <button
                type="button"
                onClick={() => setPeriodDays(60)}
                className={`flex-1 py-1 text-xs font-medium rounded transition-colors ${
                  periodDays === 60 ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                60 Days
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Result Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Interest Accrued This Period</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">
            {formatSGD(totalInterest, 2)}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Over {totalCalendarDays} calendar days ({entries.length} MAS business fixings)
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">MAS Compounded SORA Rate</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-emerald-700 mt-1">
            {compoundedSora.toFixed(4)}%
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Annualized via MAS compounding formula
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Effective Rate (SORA + Spread)</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">
            {effectiveCompoundedRate.toFixed(4)}%
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Base {compoundedSora.toFixed(3)}% + Margin {bankSpread.toFixed(2)}%
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Avg. Daily Interest Cost</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">
            {formatSGD(averageDailyInterest, 2)}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            per day on {formatSGD(loanPrincipal, 0)} principal
          </div>
        </div>
      </div>

      {/* MAS Mathematical Formula Accordion Note */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-700">
        <div className="flex items-center gap-2 font-semibold text-slate-900 mb-1">
          <Info className="w-4 h-4 text-slate-600" />
          <span>Official MAS Daily Compounding Convention</span>
        </div>
        <p className="text-slate-600 leading-relaxed">
          Daily Interest is calculated as: <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-[11px]">Interest = Principal × [(Daily SORA + Spread) / 100] × (Days / 365)</code>.
          Singapore banks use an <strong>Actual/365</strong> count, where business day fixings cover subsequent non-business days (weekends and Singapore public holidays).
        </p>
      </div>

      {/* Daily Fixings Data Grid */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
            MAS Daily Fixings &amp; Interest Accrual Log ({entries.length} records)
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            Sorted newest to oldest
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-medium">
                <th className="py-2.5 px-4">Date</th>
                <th className="py-2.5 px-3">Day</th>
                <th className="py-2.5 px-3 text-center">Days (ni)</th>
                <th className="py-2.5 px-4 text-right">MAS Overnight SORA</th>
                <th className="py-2.5 px-3 text-right">Bank Spread</th>
                <th className="py-2.5 px-4 text-right">Total Rate</th>
                <th className="py-2.5 px-4 text-right">Interest (SGD)</th>
                <th className="py-2.5 px-4 text-right">Cumulative (SGD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
              {[...entries].reverse().map((entry) => (
                <tr key={entry.date} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-2 px-4 font-sans font-medium text-slate-900">
                    {entry.date}
                  </td>
                  <td className="py-2 px-3 font-sans text-slate-600">
                    {entry.dayOfWeek}
                  </td>
                  <td className="py-2 px-3 text-center">
                    <span className={entry.calendarDays > 1 ? 'font-bold text-amber-700' : 'text-slate-600'}>
                      {entry.calendarDays} {entry.calendarDays > 1 ? '(Fri-Sun)' : ''}
                    </span>
                  </td>
                  <td className="py-2 px-4 text-right font-semibold text-slate-900">
                    {entry.dailySora.toFixed(4)}%
                  </td>
                  <td className="py-2 px-3 text-right text-slate-500">
                    +{entry.bankSpread.toFixed(2)}%
                  </td>
                  <td className="py-2 px-4 text-right font-medium text-emerald-800">
                    {entry.effectiveRate.toFixed(4)}%
                  </td>
                  <td className="py-2 px-4 text-right font-bold text-slate-900">
                    {formatSGD(entry.dailyInterest, 2)}
                  </td>
                  <td className="py-2 px-4 text-right text-slate-700">
                    {formatSGD(entry.cumulativeInterest, 2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
