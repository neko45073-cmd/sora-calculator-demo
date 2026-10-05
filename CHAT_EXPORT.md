# SORA Calculator Project - Conversation History & Build Log

**Date:** 2026-10-05  
**Project:** Singapore SORA Rate & Mortgage Calculator  
**Repository:** [https://github.com/neko45073-cmd/sora-calculator-demo](https://github.com/neko45073-cmd/sora-calculator-demo)

---

## 1. Initial Prompt & Frontend Development

### User Prompt
> Build me a simple Singapore based sora calculator that reads MAS backed overnight rates for calculating interest payments accurately and efficiently. Just the frontend for now, I will include the backend integration in later using react and tailwind CSS for a clean user interface.

### Summary of Implementation
- **MAS SORA Benchmark Integration**:
  - Live querying and fallback mechanism for Singapore Overnight Rate Average (SORA) administered by the Monetary Authority of Singapore (MAS).
  - Supported benchmarks:
    - 1-Month Compounded SORA (1M SORA)
    - 3-Month Compounded SORA (3M SORA — Singapore market standard for DBS, OCBC, UOB, HSBC, SCB)
    - 6-Month Compounded SORA (6M SORA)
    - Daily Overnight Rate & SORA Index
  - Interactive custom rate override drawer for stress-testing future interest rate projections.
- **Daily Overnight Accrual Calculator (SORA in Arrears)**:
  - Exact day-by-day interest calculation adhering to Singapore's **Actual/365** day-count convention.
  - Accounts for business day fixings and weekend multi-day weights ($n_i = 3$ for Friday fixings).
  - Annualized compounded SORA calculation matching the official MAS compounding formula:
    $$\left[\prod_{i=1}^{d_0} \left(1 + \frac{\text{SORA}_i \times n_i}{365}\right) - 1\right] \times \frac{365}{d} \times 100\%$$
- **Mortgage Repayment Engine**:
  - Property presets (HDB 4/5-Room with MAS 25-year cap, Executive Condo, Private Condo, Landed).
  - Effective Interest Rate (EIR = SORA + Bank Margin), monthly installment, principal vs. interest progress bar, and loan breakdown.
- **Amortization Schedule**:
  - High-density data grid with Annual Summary and Monthly Breakdown modes.
  - Filter by year and search functionality.
  - CSV export utility (`downloadCsv`).
- **Singapore Bank Package Comparison**:
  - Pre-configured benchmarks for DBS 3M SORA Floating, OCBC 1M SORA Flexi, UOB 3M SORA, HSBC SmartMortgage, and SCB MortgageOne with one-click application to the calculator.
- **MAS Regulatory Compliance & Stress Testing**:
  - Rate sensitivity ladder from $-1.00\%$ to $+2.00\%$.
  - MAS **4.00% p.a. regulatory stress-test rate** highlighted.
  - Total Debt Servicing Ratio (TDSR, 55% cap) and Mortgage Servicing Ratio (MSR, 30% cap for HDB/EC) affordability checker.

---

## 2. GitHub Initialization and Push

### User Prompt
> git push https://ghp_***@sora-calculator

### Action Taken
- Identified target user and repository: `neko45073-cmd/sora-calculator-demo`.
- Initialized local git repository (`git init`), established `main` branch.
- Committed all initial codebase files with message: `Initial commit: SORA Rate & Mortgage Calculator`.
- Successfully pushed to `https://github.com/neko45073-cmd/sora-calculator-demo.git`.
- Sanitized local `.git/config` remote URL to ensure personal access tokens (PAT) were not stored in plain text.

---

## 3. Serverless MAS API Gateway Integration

### User Prompt
> add a serverless connection that pulls MAS data using the following end points:
> - store this in /api folder (at project root level ) NOT src file
> - include /health.ts and /sora.ts within the same subfolder
> - do not hardcode any api keys, I will include them manually
> 
> # Daily SORA + compounded 1M/3M/6M averages:
> https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610mssql/domestic_interest_rates_daily/views/domestic_interest_rates_daily
> 
> # All requests need the header: KeyId: <MAS_KEY_ID>

### Summary of Implementation
1. **`/api/health.ts`**:
   - Universal serverless handler supporting both standard serverless environments (e.g. Vercel) and Express request/response signatures.
   - Returns `{ status: 'ok', masKeyConfigured: boolean, timestamp: string }`.
2. **`/api/sora.ts`**:
   - Fetches daily rates and compounded averages from the MAS API Gateway endpoint:
     `https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610mssql/domestic_interest_rates_daily/views/domestic_interest_rates_daily`
   - Injects the required authentication header: `KeyId: process.env.MAS_KEY_ID`.
   - Protects security: zero hardcoded credentials. If `MAS_KEY_ID` is missing, cleanly responds with HTTP 401 and descriptive configuration guidance.
   - Forwards query parameters (`rows`, `start_date`, `end_date`) and normalizes latest fixings (`dailySora`, `compSora1M`, `compSora3M`, `compSora6M`, `soraIndex`).
3. **`server.ts`**:
   - Full-stack Express server mounting `/api/health` and `/api/sora`.
   - Integrates Vite development middleware in dev (`"dev": "tsx server.ts"`).
   - Serves static production bundle in production (`"start": "node server.ts"`).
4. **`/.env.example`**:
   - Added documentation for `MAS_KEY_ID` for easy deployment configuration.
5. **Client Service Bridge (`src/services/masSoraService.ts`)**:
   - Updated client to query `/api/sora` first.
   - Gracefully falls back to public datastore endpoints or verified offline baseline fixings if the serverless key is unconfigured.
6. **Git Push**:
   - Staged, committed, and pushed changes to GitHub (`commit 7a5fcb4`).

---

## 4. Chat Log Export

### User Prompt
> export this entire chat as a .md file

### Action Taken
- Generated `CHAT_EXPORT.md` at root documenting all conversation stages, architectural designs, endpoints, and deployment actions.
