import React from 'react';
import { LoanParameters, SoraTenor } from '../types/sora';
import { formatSGD } from '../utils/calculator';
import { Home, Building2, Building, Percent, Calendar } from 'lucide-react';

interface LoanInputPanelProps {
  params: LoanParameters;
  onChange: (updated: Partial<LoanParameters>) => void;
  currentBaseRate: number;
}

const PROPERTY_PRESETS = [
  { label: 'HDB 4/5-Room', amount: 500000, maxTenure: 25, type: 'hdb' as const, icon: Home },
  { label: 'EC / Resale HDB', amount: 800000, maxTenure: 25, type: 'hdb' as const, icon: Building2 },
  { label: 'Private Condo', amount: 1200000, maxTenure: 30, type: 'condo' as const, icon: Building },
  { label: 'Prime / Landed', amount: 2000000, maxTenure: 30, type: 'landed' as const, icon: Building2 },
];

const COMMON_SPREADS = [
  { label: '+0.60%', value: 0.60, note: 'Special promo' },
  { label: '+0.65%', value: 0.65, note: 'DBS / UOB standard' },
  { label: '+0.70%', value: 0.70, note: 'OCBC standard' },
  { label: '+0.85%', value: 0.85, note: 'Year 4 onwards' },
];

export const LoanInputPanel: React.FC<LoanInputPanelProps> = ({
  params,
  onChange,
  currentBaseRate,
}) => {
  const maxTenureAllowed = params.propertyType === 'hdb' ? 25 : 30;

  const handlePropertyPreset = (preset: typeof PROPERTY_PRESETS[0]) => {
    onChange({
      propertyType: preset.type,
      loanAmount: preset.amount,
      tenureYears: Math.min(params.tenureYears, preset.maxTenure),
    });
  };

  const handleAmountAdjust = (delta: number) => {
    const nextAmount = Math.max(50000, params.loanAmount + delta);
    onChange({ loanAmount: nextAmount });
  };

  const effectiveRate = Number((currentBaseRate + params.bankSpread).toFixed(3));

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-5">
        <h3 className="text-base font-semibold text-slate-900 tracking-tight">
          Loan Configuration
        </h3>
        <div className="text-xs text-slate-500">
          EIR: <span className="font-mono font-bold text-slate-900">{effectiveRate}% p.a.</span>
        </div>
      </div>

      {/* Property Type & Presets */}
      <div className="mb-5">
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
          Property Type Presets
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PROPERTY_PRESETS.map((preset) => {
            const isSelected =
              params.propertyType === preset.type && params.loanAmount === preset.amount;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => handlePropertyPreset(preset)}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  isSelected
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-800'
                }`}
              >
                <div className="text-xs font-medium truncate">{preset.label}</div>
                <div className="text-xs font-mono font-bold mt-1 tabular-nums">
                  {formatSGD(preset.amount, 0)}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Loan Amount Input */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Loan Principal Amount (SGD)
          </label>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleAmountAdjust(-50000)}
              className="px-2 py-0.5 text-[11px] font-mono text-slate-600 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
            >
              -50k
            </button>
            <button
              type="button"
              onClick={() => handleAmountAdjust(50000)}
              className="px-2 py-0.5 text-[11px] font-mono text-slate-600 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
            >
              +50k
            </button>
            <button
              type="button"
              onClick={() => handleAmountAdjust(100000)}
              className="px-2 py-0.5 text-[11px] font-mono text-slate-600 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
            >
              +100k
            </button>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-mono text-sm">
            S$
          </div>
          <input
            type="number"
            min={10000}
            max={20000000}
            step={10000}
            value={params.loanAmount}
            onChange={(e) => onChange({ loanAmount: Math.max(0, Number(e.target.value)) })}
            className="w-full pl-9 pr-4 py-2.5 text-base font-semibold font-mono tabular-nums text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
          />
        </div>
        <div className="text-xs text-slate-500 mt-1 flex justify-between">
          <span>Min S$50,000</span>
          <span>Formatted: {formatSGD(params.loanAmount, 0)}</span>
        </div>
      </div>

      {/* Loan Tenure */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Loan Tenure
          </label>
          <span className="text-xs font-mono font-bold text-slate-900">
            {params.tenureYears} Years ({params.tenureYears * 12} Months)
          </span>
        </div>

        <input
          type="range"
          min={1}
          max={maxTenureAllowed}
          value={params.tenureYears}
          onChange={(e) => onChange({ tenureYears: Number(e.target.value) })}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
        />

        <div className="flex justify-between items-center text-xs text-slate-500 mt-1.5">
          <span>1 Year</span>
          <span className="text-[11px] text-slate-500">
            {params.propertyType === 'hdb' ? 'MAS HDB Cap: 25 Years' : 'MAS Cap: 30 Years'}
          </span>
          <span>{maxTenureAllowed} Years</span>
        </div>
      </div>

      {/* Benchmark Tenor & Bank Spread Margin */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        {/* Tenor Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            SORA Benchmark
          </label>
          <select
            value={params.tenorType}
            onChange={(e) => onChange({ tenorType: e.target.value as SoraTenor })}
            className="w-full py-2.5 px-3 text-xs font-medium text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
          >
            <option value="3M">3-Month Compounded SORA (Standard)</option>
            <option value="1M">1-Month Compounded SORA</option>
            <option value="6M">6-Month Compounded SORA</option>
            <option value="daily">Daily Overnight Rate</option>
            <option value="custom">Custom Rate Override</option>
          </select>
          <div className="text-[11px] text-slate-500 mt-1">
            Base rate: <span className="font-mono font-semibold text-slate-800">{currentBaseRate.toFixed(4)}%</span>
          </div>
        </div>

        {/* Bank Spread Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Bank Spread / Margin (% p.a.)
          </label>
          <div className="relative">
            <input
              type="number"
              step={0.01}
              min={0}
              max={10}
              value={params.bankSpread}
              onChange={(e) => onChange({ bankSpread: Number(e.target.value) })}
              className="w-full pl-3 pr-8 py-2.5 text-xs font-mono font-bold text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
              <Percent className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Singapore average: +0.65% to +0.85%
          </div>
        </div>
      </div>

      {/* Common Spreads Chips */}
      <div className="mb-5">
        <div className="text-[11px] text-slate-500 mb-1.5">Popular Bank Spreads:</div>
        <div className="flex flex-wrap gap-1.5">
          {COMMON_SPREADS.map((sp) => (
            <button
              key={sp.label}
              type="button"
              onClick={() => onChange({ bankSpread: sp.value })}
              className={`px-2.5 py-1 text-xs rounded transition-colors ${
                params.bankSpread === sp.value
                  ? 'bg-slate-900 text-white font-medium'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
              title={sp.note}
            >
              {sp.label}
            </button>
          ))}
        </div>
      </div>

      {/* Repayment Start Date */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
          First Payment Date
        </label>
        <div className="relative">
          <input
            type="date"
            value={params.startDate}
            onChange={(e) => onChange({ startDate: e.target.value })}
            className="w-full py-2 px-3 text-xs font-mono text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
            <Calendar className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
};
