import React, { useState, useMemo } from 'react';
import { MonthlyAmortizationEntry } from '../types/sora';
import { formatSGD, exportScheduleToCsv, downloadCsv } from '../utils/calculator';
import { Download, Search, Filter } from 'lucide-react';

interface AmortizationScheduleProps {
  schedule: MonthlyAmortizationEntry[];
  loanAmount: number;
}

interface YearlyAmortizationSummary {
  year: number;
  totalPayment: number;
  principalPayment: number;
  interestPayment: number;
  endingBalance: number;
  cumulativeInterest: number;
}

export const AmortizationSchedule: React.FC<AmortizationScheduleProps> = ({
  schedule,
  loanAmount,
}) => {
  const [viewMode, setViewMode] = useState<'yearly' | 'monthly'>('yearly');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');

  // Compute yearly roll-ups
  const yearlySummary: YearlyAmortizationSummary[] = useMemo(() => {
    const map = new Map<number, YearlyAmortizationSummary>();

    for (const item of schedule) {
      if (!map.has(item.year)) {
        map.set(item.year, {
          year: item.year,
          totalPayment: 0,
          principalPayment: 0,
          interestPayment: 0,
          endingBalance: item.remainingBalance,
          cumulativeInterest: item.cumulativeInterest,
        });
      }

      const existing = map.get(item.year)!;
      existing.totalPayment += item.payment;
      existing.principalPayment += item.principalPayment;
      existing.interestPayment += item.interestPayment;
      existing.endingBalance = item.remainingBalance;
      existing.cumulativeInterest = item.cumulativeInterest;
    }

    return Array.from(map.values());
  }, [schedule]);

  // Filtered monthly items
  const filteredMonthly = useMemo(() => {
    return schedule.filter((item) => {
      const matchesYear = selectedYear === 'all' || item.year === selectedYear;
      const matchesSearch =
        item.date.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.month.toString().includes(searchQuery);
      return matchesYear && matchesSearch;
    });
  }, [schedule, selectedYear, searchQuery]);

  const handleExport = () => {
    const csv = exportScheduleToCsv(schedule);
    downloadCsv(`SORA_Amortization_Schedule_${loanAmount}.csv`, csv);
  };

  const totalYears = yearlySummary.length;

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
      {/* Table Header and Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900 tracking-tight">
            Amortization Schedule
          </h3>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
            <span>{totalYears} Years</span>
            <span aria-hidden="true">·</span>
            <span>{schedule.length} Monthly Installments</span>
            <span aria-hidden="true">·</span>
            <span>Reducing Balance</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => setViewMode('yearly')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'yearly'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Annual Summary
            </button>
            <button
              onClick={() => setViewMode('monthly')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'monthly'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly Detail
            </button>
          </div>

          {/* Export CSV */}
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV</span>
          </button>
        </div>
      </div>

      {/* Filter bar for monthly mode */}
      {viewMode === 'monthly' && (
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-medium text-slate-700">Filter Year:</span>
            <select
              value={selectedYear}
              onChange={(e) =>
                setSelectedYear(e.target.value === 'all' ? 'all' : Number(e.target.value))
              }
              className="py-1 px-2.5 bg-white border border-slate-300 rounded font-medium text-slate-800 text-xs"
            >
              <option value="all">All Years ({totalYears})</option>
              {yearlySummary.map((y) => (
                <option key={y.year} value={y.year}>
                  Year {y.year}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            <input
              type="text"
              placeholder="Search date or month..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>
        </div>
      )}

      {/* High-Density Data Grid */}
      <div className="overflow-x-auto max-h-[520px] overflow-y-auto">
        {viewMode === 'yearly' ? (
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-slate-50/95 backdrop-blur-xs border-b border-slate-200 text-slate-600 font-medium z-10">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Year</th>
                <th className="py-2.5 px-4 text-right font-semibold">Annual Payment</th>
                <th className="py-2.5 px-4 text-right font-semibold">Principal Repaid</th>
                <th className="py-2.5 px-4 text-right font-semibold">Interest Paid</th>
                <th className="py-2.5 px-4 text-right font-semibold">Ending Balance</th>
                <th className="py-2.5 px-4 text-right font-semibold">Cum. Interest</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
              {yearlySummary.map((row) => (
                <tr key={row.year} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-4 font-sans font-semibold text-slate-900">
                    Year {row.year}
                  </td>
                  <td className="py-2.5 px-4 text-right text-slate-900">
                    {formatSGD(row.totalPayment, 2)}
                  </td>
                  <td className="py-2.5 px-4 text-right text-emerald-800 font-medium">
                    {formatSGD(row.principalPayment, 2)}
                  </td>
                  <td className="py-2.5 px-4 text-right text-amber-700">
                    {formatSGD(row.interestPayment, 2)}
                  </td>
                  <td className="py-2.5 px-4 text-right font-semibold text-slate-900">
                    {formatSGD(row.endingBalance, 2)}
                  </td>
                  <td className="py-2.5 px-4 text-right text-slate-500">
                    {formatSGD(row.cumulativeInterest, 2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-slate-50/95 backdrop-blur-xs border-b border-slate-200 text-slate-600 font-medium z-10">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Month</th>
                <th className="py-2.5 px-3 font-semibold">Date</th>
                <th className="py-2.5 px-4 text-right font-semibold">Installment</th>
                <th className="py-2.5 px-4 text-right font-semibold">Principal</th>
                <th className="py-2.5 px-4 text-right font-semibold">Interest</th>
                <th className="py-2.5 px-4 text-right font-semibold">Remaining Balance</th>
                <th className="py-2.5 px-4 text-right font-semibold">Cum. Interest</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
              {filteredMonthly.map((row) => (
                <tr key={row.month} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2 px-3 font-sans text-slate-500">
                    #{row.month}
                  </td>
                  <td className="py-2 px-3 font-sans font-medium text-slate-900">
                    {row.date}
                  </td>
                  <td className="py-2 px-4 text-right text-slate-900 font-medium">
                    {formatSGD(row.payment, 2)}
                  </td>
                  <td className="py-2 px-4 text-right text-emerald-800">
                    {formatSGD(row.principalPayment, 2)}
                  </td>
                  <td className="py-2 px-4 text-right text-amber-700">
                    {formatSGD(row.interestPayment, 2)}
                  </td>
                  <td className="py-2 px-4 text-right font-semibold text-slate-900">
                    {formatSGD(row.remainingBalance, 2)}
                  </td>
                  <td className="py-2 px-4 text-right text-slate-500">
                    {formatSGD(row.cumulativeInterest, 2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
