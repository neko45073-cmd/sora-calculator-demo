import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { MasRateBanner } from './components/MasRateBanner';
import { LoanInputPanel } from './components/LoanInputPanel';
import { RepaymentSummary } from './components/RepaymentSummary';
import { DailyAccrualCalculator } from './components/DailyAccrualCalculator';
import { AmortizationSchedule } from './components/AmortizationSchedule';
import { BankComparison } from './components/BankComparison';
import { StressTestMatrix } from './components/StressTestMatrix';
import { TdsrAffordability } from './components/TdsrAffordability';
import { SoraEducationGuide } from './components/SoraEducationGuide';
import { LoanParameters, MasSoraData, SoraTenor } from './types/sora';
import {
  fetchMasSoraRates,
  getRateForTenor,
  VERIFIED_MAS_BASELINE,
} from './services/masSoraService';
import {
  generateAmortizationSchedule,
  exportScheduleToCsv,
  downloadCsv,
  formatSGD,
} from './utils/calculator';
import { Calculator, Clock, Layers, ShieldCheck, PieChart, Sparkles } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'calculator' | 'daily-accrual' | 'bank-packages' | 'stress-test' | 'tdsr' | 'about'
  >('calculator');

  const [masData, setMasData] = useState<MasSoraData>(VERIFIED_MAS_BASELINE);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState<string | null>(null);

  // Initial Loan Parameters
  const [loanParams, setLoanParams] = useState<LoanParameters>({
    propertyType: 'condo',
    loanAmount: 800000,
    tenureYears: 25,
    tenorType: '3M',
    bankSpread: 0.65,
    customSoraRate: undefined,
    startDate: new Date().toISOString().split('T')[0],
  });

  // Fetch live MAS rates on initial load
  useEffect(() => {
    let isMounted = true;
    async function loadRates() {
      setIsRefreshing(true);
      const data = await fetchMasSoraRates();
      if (isMounted) {
        setMasData(data);
        setIsRefreshing(false);
      }
    }
    loadRates();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleRefreshRates = async () => {
    setIsRefreshing(true);
    setRefreshMessage(null);
    const data = await fetchMasSoraRates();
    setMasData(data);
    setIsRefreshing(false);
    setRefreshMessage(
      data.source === 'live-mas-api'
        ? 'Successfully refreshed latest rates from MAS Open Data API.'
        : 'Synced latest verified MAS published baseline fixings.'
    );
    setTimeout(() => setRefreshMessage(null), 4000);
  };

  // Update loan parameters partial
  const handleUpdateParams = (updated: Partial<LoanParameters>) => {
    setLoanParams((prev) => ({ ...prev, ...updated }));
  };

  // Base rate resolution
  const currentBaseRate = useMemo(() => {
    return getRateForTenor(masData, loanParams.tenorType, loanParams.customSoraRate);
  }, [masData, loanParams.tenorType, loanParams.customSoraRate]);

  // Effective rate % p.a.
  const effectiveRate = Number((currentBaseRate + loanParams.bankSpread).toFixed(3));

  // Amortization and Repayment calculations
  const loanSummary = useMemo(() => {
    return generateAmortizationSchedule(loanParams, effectiveRate);
  }, [loanParams, effectiveRate]);

  const handleExportSchedule = () => {
    const csv = exportScheduleToCsv(loanSummary.schedule);
    downloadCsv(`SORA_Schedule_${loanParams.loanAmount}_${loanParams.tenorType}.csv`, csv);
  };

  const handleApplyBankPackage = (tenor: '1M' | '3M', spread: number) => {
    setLoanParams((prev) => ({
      ...prev,
      tenorType: tenor,
      bankSpread: spread,
      customSoraRate: undefined,
    }));
    setActiveTab('calculator');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onRefreshRates={handleRefreshRates}
        isRefreshing={isRefreshing}
        onExportSchedule={handleExportSchedule}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Refresh Toast Notification */}
        {refreshMessage && (
          <div className="mb-4 p-3 bg-slate-900 text-white text-xs rounded-lg flex items-center justify-between shadow-md transition-all">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>{refreshMessage}</span>
            </div>
            <button
              onClick={() => setRefreshMessage(null)}
              className="text-slate-400 hover:text-white ml-2 text-xs"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* MAS Benchmark Rates Overview Card (Always visible on all tabs) */}
        <MasRateBanner
          masData={masData}
          activeTenor={loanParams.tenorType}
          onSelectTenor={(tenor: SoraTenor) => handleUpdateParams({ tenorType: tenor })}
          customRate={loanParams.customSoraRate}
          onSetCustomRate={(rate) => handleUpdateParams({ customSoraRate: rate })}
        />

        {/* Tab 1: Mortgage Calculator & Amortization */}
        {activeTab === 'calculator' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Loan Configuration Panel */}
              <div className="lg:col-span-5 space-y-6">
                <LoanInputPanel
                  params={loanParams}
                  onChange={handleUpdateParams}
                  currentBaseRate={currentBaseRate}
                />
              </div>

              {/* Right Column: Repayment Summary & Breakdown */}
              <div className="lg:col-span-7 space-y-6">
                <RepaymentSummary summary={loanSummary} params={loanParams} />
              </div>
            </div>

            {/* Amortization Schedule Table */}
            <AmortizationSchedule
              schedule={loanSummary.schedule}
              loanAmount={loanParams.loanAmount}
            />
          </div>
        )}

        {/* Tab 2: Exact Daily Overnight Accrual Calculator (SORA in Arrears) */}
        {activeTab === 'daily-accrual' && (
          <DailyAccrualCalculator
            masData={masData}
            defaultLoanAmount={loanParams.loanAmount}
            defaultBankSpread={loanParams.bankSpread}
          />
        )}

        {/* Tab 3: Bank Package Comparison */}
        {activeTab === 'bank-packages' && (
          <BankComparison
            masData={masData}
            loanAmount={loanParams.loanAmount}
            tenureYears={loanParams.tenureYears}
            onApplyPackage={handleApplyBankPackage}
          />
        )}

        {/* Tab 4: Stress Test Matrix */}
        {activeTab === 'stress-test' && (
          <StressTestMatrix
            loanAmount={loanParams.loanAmount}
            tenureYears={loanParams.tenureYears}
            currentEffectiveRate={effectiveRate}
          />
        )}

        {/* Tab 5: MAS TDSR & MSR Affordability */}
        {activeTab === 'tdsr' && (
          <TdsrAffordability
            loanAmount={loanParams.loanAmount}
            tenureYears={loanParams.tenureYears}
            currentMonthlyPayment={loanSummary.monthlyPayment}
            propertyType={loanParams.propertyType}
          />
        )}

        {/* Tab 6: About SORA & Education Guide */}
        {activeTab === 'about' && <SoraEducationGuide />}
      </main>

      {/* Clean, Human-Crafted Footer */}
      <footer className="border-t border-slate-200 bg-white mt-12 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-semibold text-slate-800">SORA Finance SG</span>
            <span aria-hidden="true">·</span>
            <span>Singapore Overnight Rate Average</span>
            <span aria-hidden="true">·</span>
            <span>Actual/365 Day-Count</span>
            <span aria-hidden="true">·</span>
            <span>MAS Benchmark Data</span>
          </div>

          <div className="flex items-center gap-4 text-slate-500">
            <button
              onClick={() => setActiveTab('about')}
              className="hover:text-slate-900 transition-colors"
            >
              Documentation
            </button>
            <button
              onClick={() => setActiveTab('daily-accrual')}
              className="hover:text-slate-900 transition-colors"
            >
              Overnight Accrual
            </button>
            <a
              href="https://eservices.mas.gov.sg/statistics/domestic-interest-rates/sora"
              target="_blank"
              rel="noreferrer noopener"
              className="hover:text-slate-900 transition-colors"
            >
              MAS Portal
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
