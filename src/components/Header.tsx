import React from 'react';
import { Download, RefreshCw, Landmark } from 'lucide-react';

interface HeaderProps {
  activeTab: 'calculator' | 'daily-accrual' | 'bank-packages' | 'stress-test' | 'tdsr' | 'about';
  setActiveTab: (tab: 'calculator' | 'daily-accrual' | 'bank-packages' | 'stress-test' | 'tdsr' | 'about') => void;
  onRefreshRates: () => void;
  isRefreshing: boolean;
  onExportSchedule: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onRefreshRates,
  isRefreshing,
  onExportSchedule,
}) => {
  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold text-sm tracking-tight shadow-sm">
              <Landmark className="w-5 h-5 text-emerald-400" />
            </div>
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('calculator');
              }}
              className="text-lg font-bold tracking-tight text-slate-900 hover:text-slate-800 transition-colors"
            >
              SORA Finance SG
            </a>
          </div>

          {/* Zone 2: 4-6 clean text navigation links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              onClick={() => setActiveTab('calculator')}
              className={`pb-1 transition-colors whitespace-nowrap ${
                activeTab === 'calculator'
                  ? 'text-slate-900 font-semibold border-b-2 border-slate-900'
                  : 'hover:text-slate-900'
              }`}
            >
              Mortgage Calculator
            </button>
            <button
              onClick={() => setActiveTab('daily-accrual')}
              className={`pb-1 transition-colors whitespace-nowrap ${
                activeTab === 'daily-accrual'
                  ? 'text-slate-900 font-semibold border-b-2 border-slate-900'
                  : 'hover:text-slate-900'
              }`}
            >
              Daily Accrual (Arrears)
            </button>
            <button
              onClick={() => setActiveTab('bank-packages')}
              className={`pb-1 transition-colors whitespace-nowrap ${
                activeTab === 'bank-packages'
                  ? 'text-slate-900 font-semibold border-b-2 border-slate-900'
                  : 'hover:text-slate-900'
              }`}
            >
              Bank Rates
            </button>
            <button
              onClick={() => setActiveTab('stress-test')}
              className={`pb-1 transition-colors whitespace-nowrap ${
                activeTab === 'stress-test'
                  ? 'text-slate-900 font-semibold border-b-2 border-slate-900'
                  : 'hover:text-slate-900'
              }`}
            >
              MAS Stress Test
            </button>
            <button
              onClick={() => setActiveTab('tdsr')}
              className={`pb-1 transition-colors whitespace-nowrap ${
                activeTab === 'tdsr'
                  ? 'text-slate-900 font-semibold border-b-2 border-slate-900'
                  : 'hover:text-slate-900'
              }`}
            >
              TDSR / MSR
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`pb-1 transition-colors whitespace-nowrap ${
                activeTab === 'about'
                  ? 'text-slate-900 font-semibold border-b-2 border-slate-900'
                  : 'hover:text-slate-900'
              }`}
            >
              About SORA
            </button>
          </nav>

          {/* Zone 3: 1-2 primary actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onRefreshRates}
              disabled={isRefreshing}
              title="Refresh MAS Rates"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh MAS</span>
            </button>

            <button
              onClick={onExportSchedule}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="lg:hidden flex items-center gap-4 overflow-x-auto py-2.5 border-t border-slate-100 text-xs font-medium text-slate-600 no-scrollbar">
          <button
            onClick={() => setActiveTab('calculator')}
            className={`whitespace-nowrap px-2 py-1 rounded ${
              activeTab === 'calculator' ? 'bg-slate-900 text-white font-semibold' : 'hover:text-slate-900'
            }`}
          >
            Calculator
          </button>
          <button
            onClick={() => setActiveTab('daily-accrual')}
            className={`whitespace-nowrap px-2 py-1 rounded ${
              activeTab === 'daily-accrual' ? 'bg-slate-900 text-white font-semibold' : 'hover:text-slate-900'
            }`}
          >
            Daily Accrual
          </button>
          <button
            onClick={() => setActiveTab('bank-packages')}
            className={`whitespace-nowrap px-2 py-1 rounded ${
              activeTab === 'bank-packages' ? 'bg-slate-900 text-white font-semibold' : 'hover:text-slate-900'
            }`}
          >
            Bank Rates
          </button>
          <button
            onClick={() => setActiveTab('stress-test')}
            className={`whitespace-nowrap px-2 py-1 rounded ${
              activeTab === 'stress-test' ? 'bg-slate-900 text-white font-semibold' : 'hover:text-slate-900'
            }`}
          >
            Stress Test
          </button>
          <button
            onClick={() => setActiveTab('tdsr')}
            className={`whitespace-nowrap px-2 py-1 rounded ${
              activeTab === 'tdsr' ? 'bg-slate-900 text-white font-semibold' : 'hover:text-slate-900'
            }`}
          >
            TDSR / MSR
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`whitespace-nowrap px-2 py-1 rounded ${
              activeTab === 'about' ? 'bg-slate-900 text-white font-semibold' : 'hover:text-slate-900'
            }`}
          >
            Guide
          </button>
        </div>
      </div>
    </header>
  );
};
