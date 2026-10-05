import React from 'react';
import { BookOpen, CheckCircle, ExternalLink, HelpCircle, Landmark } from 'lucide-react';

export const SoraEducationGuide: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-6">
      <div className="pb-4 border-b border-slate-100">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-slate-800" />
          <span>Understanding SORA &amp; MAS Benchmark Rates</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          A clear guide to how the Singapore Overnight Rate Average functions in home loans and commercial financing.
        </p>
      </div>

      {/* 3 Core Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50">
          <div className="w-7 h-7 rounded bg-slate-900 text-white flex items-center justify-center font-mono font-bold text-xs mb-3">
            01
          </div>
          <h3 className="text-sm font-bold text-slate-900 mb-1">What is SORA?</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            SORA (Singapore Overnight Rate Average) is the volume-weighted average rate of unsecured overnight interbank SGD transactions brokered in Singapore between 8:00am and 6:15pm SGT. It is administered and published by the Monetary Authority of Singapore (MAS) every business day at 9:00am SGT.
          </p>
        </div>

        <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50">
          <div className="w-7 h-7 rounded bg-slate-900 text-white flex items-center justify-center font-mono font-bold text-xs mb-3">
            02
          </div>
          <h3 className="text-sm font-bold text-slate-900 mb-1">Why SORA Replaced SIBOR</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Unlike SIBOR (which relied on subjective bank quotes) or SOR (reliant on US dollar Libor), SORA is grounded strictly in real, verifiable market transactions in Singapore Dollars. This eliminates manipulation risk and creates total pricing transparency.
          </p>
        </div>

        <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50">
          <div className="w-7 h-7 rounded bg-slate-900 text-white flex items-center justify-center font-mono font-bold text-xs mb-3">
            03
          </div>
          <h3 className="text-sm font-bold text-slate-900 mb-1">Compounding in Arrears</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Because overnight rates fluctuate daily, Singapore banks use 1-Month or 3-Month Compounded SORA. The daily overnight rates are mathematically compounded over the preceding period, smoothing out single-day volatility into a stable benchmark.
          </p>
        </div>
      </div>

      {/* Comparison: 1M vs 3M SORA */}
      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 font-semibold text-xs text-slate-800">
          Key Differences: 1-Month vs 3-Month Compounded SORA Packages
        </div>
        <div className="p-4 text-xs space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 bg-white border border-slate-200 rounded-lg">
              <span className="font-bold text-slate-900 block mb-1">1-Month Compounded SORA (1M SORA)</span>
              <ul className="list-disc list-inside space-y-1 text-slate-600 leading-relaxed">
                <li>Rate resets every single calendar month.</li>
                <li>Best in a falling interest rate cycle because mortgage rates drop immediately.</li>
                <li>Slightly more month-to-month payment fluctuation.</li>
                <li>Offered prominently by OCBC and select mortgage lenders.</li>
              </ul>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-lg">
              <span className="font-bold text-slate-900 block mb-1">3-Month Compounded SORA (3M SORA)</span>
              <ul className="list-disc list-inside space-y-1 text-slate-600 leading-relaxed">
                <li>Rate resets once every 3 calendar months (quarterly).</li>
                <li>Provides 90 days of payment predictability per reset.</li>
                <li>Lags slightly when market rates are dropping, but buffers you longer when rates rise.</li>
                <li>The de-facto flagship standard for DBS, UOB, HSBC, and Standard Chartered.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Singapore Day-Count Convention (Actual/365) */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
          <Landmark className="w-4 h-4 text-slate-700" />
          <span>Singapore Banking Day-Count Convention: Actual/365</span>
        </h3>
        <p className="text-slate-600 leading-relaxed">
          Singapore money markets and domestic mortgages follow the <strong>Actual/365</strong> convention.
          Interest accrues each calendar day as <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-[11px]">Outstanding Principal × (Annual Rate / 365) × Days</code>.
          On weekends, the Friday MAS SORA fixing applies for 3 days (Friday, Saturday, Sunday).
        </p>
      </div>

      {/* Links & Verification */}
      <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 border-t border-slate-100">
        <div>Official Sources: Monetary Authority of Singapore (MAS) &amp; ABS-SFEMC (SC-STS)</div>
        <a
          href="https://eservices.mas.gov.sg/statistics/domestic-interest-rates/sora"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-slate-700 hover:text-slate-900 font-medium"
        >
          <span>MAS SORA Portal</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};
