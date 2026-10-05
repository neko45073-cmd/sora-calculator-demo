import React, { useState } from 'react';
import { MasSoraData, SoraTenor } from '../types/sora';
import { SlidersHorizontal, Check, ExternalLink } from 'lucide-react';

interface MasRateBannerProps {
  masData: MasSoraData;
  activeTenor: SoraTenor;
  onSelectTenor: (tenor: SoraTenor) => void;
  customRate: number | undefined;
  onSetCustomRate: (rate: number | undefined) => void;
}

export const MasRateBanner: React.FC<MasRateBannerProps> = ({
  masData,
  activeTenor,
  onSelectTenor,
  customRate,
  onSetCustomRate,
}) => {
  const [showOverrideInput, setShowOverrideInput] = useState(false);
  const [tempCustomRate, setTempCustomRate] = useState(
    customRate !== undefined ? customRate.toString() : masData.compSora3M.toString()
  );

  const handleApplyCustomRate = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(tempCustomRate);
    if (!isNaN(val) && val >= 0 && val <= 20) {
      onSetCustomRate(val);
      onSelectTenor('custom');
      setShowOverrideInput(false);
    }
  };

  const handleResetToMas = () => {
    onSetCustomRate(undefined);
    onSelectTenor('3M');
    setShowOverrideInput(false);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs mb-6">
      {/* Top row with clean unboxed metadata */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 tracking-tight flex items-center gap-2">
            <span>MAS SORA Benchmark Rates</span>
            <span className="text-xs font-normal text-slate-500 font-mono">
              ({masData.latestDate})
            </span>
          </h2>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 mt-1">
            <span>Monetary Authority of Singapore</span>
            <span aria-hidden="true">·</span>
            <span>Published daily at 09:00 SGT</span>
            <span aria-hidden="true">·</span>
            <span>Actual/365 Convention</span>
            <span aria-hidden="true">·</span>
            <span className={masData.source === 'live-mas-api' ? 'text-emerald-700 font-medium' : 'text-slate-600'}>
              {masData.source === 'live-mas-api' ? 'Live MAS API' : 'Official MAS Base'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowOverrideInput(!showOverrideInput)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{customRate !== undefined ? 'Custom Rate Active' : 'Rate Override'}</span>
          </button>
          <a
            href="https://eservices.mas.gov.sg/statistics/domestic-interest-rates/sora"
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 transition-colors"
            title="View on Official MAS Website"
          >
            <span>MAS Official</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Override form drawer */}
      {showOverrideInput && (
        <form onSubmit={handleApplyCustomRate} className="py-3 px-3 bg-slate-50 border border-slate-200 rounded-lg mt-3 flex flex-wrap items-center gap-3">
          <div className="text-xs font-medium text-slate-700">Custom SORA Benchmark (% p.a.):</div>
          <input
            type="number"
            step="0.001"
            min="0"
            max="15"
            value={tempCustomRate}
            onChange={(e) => setTempCustomRate(e.target.value)}
            className="w-28 px-2 py-1 text-xs font-mono font-medium bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-slate-900"
            placeholder="e.g. 3.25"
          />
          <button
            type="submit"
            className="px-3 py-1 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors"
          >
            Apply
          </button>
          {customRate !== undefined && (
            <button
              type="button"
              onClick={handleResetToMas}
              className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 underline transition-colors"
            >
              Reset to MAS
            </button>
          )}
        </form>
      )}

      {/* Rates Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 mt-4">
        {/* 1M SORA */}
        <button
          type="button"
          onClick={() => {
            onSetCustomRate(undefined);
            onSelectTenor('1M');
          }}
          className={`text-left p-3 rounded-lg border transition-all ${
            activeTenor === '1M' && customRate === undefined
              ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
              : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100/80 text-slate-900'
          }`}
        >
          <div className="flex items-center justify-between text-xs mb-1">
            <span className={activeTenor === '1M' && customRate === undefined ? 'text-slate-300' : 'text-slate-500'}>
              1M Compounded
            </span>
            {activeTenor === '1M' && customRate === undefined && <Check className="w-3.5 h-3.5 text-emerald-400" />}
          </div>
          <div className="text-xl font-bold font-mono tabular-nums tracking-tight">
            {masData.compSora1M.toFixed(4)}%
          </div>
          <div className={`text-[11px] mt-1 ${activeTenor === '1M' && customRate === undefined ? 'text-slate-300' : 'text-slate-500'}`}>
            Monthly reset
          </div>
        </button>

        {/* 3M SORA (Most Popular SG Standard) */}
        <button
          type="button"
          onClick={() => {
            onSetCustomRate(undefined);
            onSelectTenor('3M');
          }}
          className={`text-left p-3 rounded-lg border relative transition-all ${
            activeTenor === '3M' && customRate === undefined
              ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
              : 'border-slate-300 bg-emerald-50/30 hover:bg-emerald-50/60 text-slate-900'
          }`}
        >
          <div className="flex items-center justify-between text-xs mb-1">
            <span className={`font-semibold ${activeTenor === '3M' && customRate === undefined ? 'text-white' : 'text-slate-800'}`}>
              3M Compounded
            </span>
            {activeTenor === '3M' && customRate === undefined ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <span className="text-[10px] text-emerald-700 font-medium">Standard</span>
            )}
          </div>
          <div className="text-xl font-bold font-mono tabular-nums tracking-tight">
            {masData.compSora3M.toFixed(4)}%
          </div>
          <div className={`text-[11px] mt-1 ${activeTenor === '3M' && customRate === undefined ? 'text-slate-300' : 'text-slate-500'}`}>
            DBS / OCBC / UOB standard
          </div>
        </button>

        {/* 6M SORA */}
        <button
          type="button"
          onClick={() => {
            onSetCustomRate(undefined);
            onSelectTenor('6M');
          }}
          className={`text-left p-3 rounded-lg border transition-all ${
            activeTenor === '6M' && customRate === undefined
              ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
              : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100/80 text-slate-900'
          }`}
        >
          <div className="flex items-center justify-between text-xs mb-1">
            <span className={activeTenor === '6M' && customRate === undefined ? 'text-slate-300' : 'text-slate-500'}>
              6M Compounded
            </span>
            {activeTenor === '6M' && customRate === undefined && <Check className="w-3.5 h-3.5 text-emerald-400" />}
          </div>
          <div className="text-xl font-bold font-mono tabular-nums tracking-tight">
            {masData.compSora6M.toFixed(4)}%
          </div>
          <div className={`text-[11px] mt-1 ${activeTenor === '6M' && customRate === undefined ? 'text-slate-300' : 'text-slate-500'}`}>
            Semi-annual reset
          </div>
        </button>

        {/* Daily Overnight SORA */}
        <button
          type="button"
          onClick={() => {
            onSetCustomRate(undefined);
            onSelectTenor('daily');
          }}
          className={`text-left p-3 rounded-lg border transition-all ${
            activeTenor === 'daily' && customRate === undefined
              ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
              : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100/80 text-slate-900'
          }`}
        >
          <div className="flex items-center justify-between text-xs mb-1">
            <span className={activeTenor === 'daily' && customRate === undefined ? 'text-slate-300' : 'text-slate-500'}>
              Daily Overnight
            </span>
            {activeTenor === 'daily' && customRate === undefined && <Check className="w-3.5 h-3.5 text-emerald-400" />}
          </div>
          <div className="text-xl font-bold font-mono tabular-nums tracking-tight">
            {masData.dailySora.toFixed(4)}%
          </div>
          <div className={`text-[11px] mt-1 ${activeTenor === 'daily' && customRate === undefined ? 'text-slate-300' : 'text-slate-500'}`}>
            Latest overnight fixing
          </div>
        </button>

        {/* SORA Index */}
        <div className="hidden lg:block p-3 rounded-lg border border-slate-200 bg-slate-50/40 text-slate-900">
          <div className="text-xs text-slate-500 mb-1">SORA Index</div>
          <div className="text-xl font-bold font-mono tabular-nums tracking-tight text-slate-700">
            {masData.soraIndex.toFixed(6)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">MAS base index (2020=1.0)</div>
        </div>
      </div>
    </div>
  );
};
