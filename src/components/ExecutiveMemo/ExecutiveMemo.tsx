import React from 'react';
import { 
  AlertTriangle, 
  ArrowRight, 
  BarChart3, 
  CheckCircle2, 
  DollarSign, 
  FileText, 
  ShieldAlert, 
  TrendingUp, 
  Truck, 
  Warehouse 
} from 'lucide-react';

export const ExecutiveMemo: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 bg-white border border-slate-200 rounded-2xl p-8 shadow-xs">
      {/* Memo Header */}
      <div className="border-b border-slate-200 pb-6">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
          <span className="font-mono uppercase tracking-widest text-slate-400">Analyst Deliverable Brief</span>
          <span className="font-mono">October 2026</span>
        </div>
        
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">
          Supply Chain &amp; Delivery Performance Analytics
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          Comprehensive diagnostic of on-time delivery rates, freight expenditure, warehouse handling latency, and supplier performance across 640 international shipments.
        </p>

        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-6 text-xs text-slate-600">
          <div>
            <span className="text-slate-400 block text-[11px]">Primary Methodology</span>
            <span className="font-semibold text-slate-800">SQL Data Extraction &amp; Excel Modeling</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Reporting Interface</span>
            <span className="font-semibold text-slate-800">Power BI Executive Dashboard</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Enterprise Target</span>
            <span className="font-mono font-semibold text-slate-800">95.0% OTIF SLA</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Current Performance</span>
            <span className="font-mono font-semibold text-rose-600">88.4% OTIF (-6.6% Variance)</span>
          </div>
        </div>
      </div>

      {/* Section 1: Executive Summary */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <span>01. Executive Summary &amp; Core Diagnosis</span>
        </h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          Analysis of 640 global multi-modal shipments representing $3.8M in annualized freight spend demonstrates that the current 88.4% On-Time In-Full (OTIF) rate is heavily constrained by concentrated bottlenecks at two marine hubs, coupled with internal warehouse dispatch latency and supplier unreliability. While carrier line-haul reliability remains robust (92.4% carrier SLA compliance), shipment handoffs and pre-transit stages cause 68% of downstream delivery failures.
        </p>

        {/* 3 Metric callouts */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-slate-400 block text-[11px]">Total Late Shipments</span>
            <span className="text-xl font-bold font-mono text-slate-900">74 Orders</span>
            <span className="text-[11px] text-rose-600 block mt-1">11.6% of volume impacted</span>
          </div>
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-slate-400 block text-[11px]">Primary Delay Origin</span>
            <span className="text-xl font-bold text-slate-900">Customs &amp; Ports</span>
            <span className="text-[11px] text-slate-500 block mt-1">58% of all lost delay hours</span>
          </div>
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-slate-400 block text-[11px]">Projected Recovery</span>
            <span className="text-xl font-bold font-mono text-emerald-600">+5.7% OTIF</span>
            <span className="text-[11px] text-emerald-700 block mt-1">+$173k annualized net value</span>
          </div>
        </div>
      </section>

      {/* Section 2: Key Empirical Findings */}
      <section className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <span>02. Key Analytical Findings (SQL &amp; Excel Drill-Down)</span>
        </h2>

        <div className="space-y-3">
          <div className="p-4 border border-slate-200 rounded-xl bg-white hover:bg-slate-50/50 transition-colors">
            <div className="flex items-start justify-between gap-4 mb-1.5">
              <h3 className="text-xs font-bold text-slate-900">
                A. Regional Divergence &amp; Gateway Vulnerabilities
              </h3>
              <span className="text-[11px] font-mono text-slate-400 shrink-0">LATAM &amp; EMEA</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Delivery success varies substantially by destination geography. North America maintains 91.2% OTIF, while LATAM (82.4%) and EMEA (86.1%) suffer from regulatory and port throughput friction. In EMEA, container shipments entering via Rotterdam Europort (WH-RTM) encounter an average +48.2 hour customs delay due to updated EU documentation audits, resulting in $420k in delayed cargo value.
            </p>
          </div>

          <div className="p-4 border border-slate-200 rounded-xl bg-white hover:bg-slate-50/50 transition-colors">
            <div className="flex items-start justify-between gap-4 mb-1.5">
              <h3 className="text-xs font-bold text-slate-900">
                B. Warehouse Internal Fulfillment vs Carrier Transit Lag
              </h3>
              <span className="text-[11px] font-mono text-slate-400 shrink-0">WH-ORD &amp; WH-LAX</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Cross-tabulation of dock dispatch times against line-haul transit reveals that delays frequently begin before the carrier picks up the container. Chicago Central (WH-ORD) averages 31.5 hours of dock handling (vs 24h benchmark), and Long Beach Ocean Terminal (WH-LAX) averages 38.6 hours. The bottleneck at WH-LAX is driven by container chassis shortages and gate queuing, not vessel ocean transit speed.
            </p>
          </div>

          <div className="p-4 border border-slate-200 rounded-xl bg-white hover:bg-slate-50/50 transition-colors">
            <div className="flex items-start justify-between gap-4 mb-1.5">
              <h3 className="text-xs font-bold text-slate-900">
                C. Supplier Defect &amp; Lead-Time Bullwhip Effect
              </h3>
              <span className="text-[11px] font-mono text-slate-400 shrink-0">Tier 2/3 APAC</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Two key suppliers account for 41% of all critical delivery delays: Shenzhen Module Works (81.4% OTIF, 22.4 day avg lead time) and Pacific Rim Fasteners (76.8% OTIF, 28.5 day avg lead time). In contrast, Tier 1 vendors such as Vanguard Steel (96.1% OTIF) and Kyoto Optoelectronics (97.4% OTIF) consistently outperform SLA expectations.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3: Actionable Supplier & Operational Roadmap */}
      <section className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <span>03. Strategic Action Roadmap &amp; Decision Directives</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-indigo-700 font-semibold text-xs">
              <Truck className="w-4 h-4" />
              <span>1. Supplier Volume Reallocation</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Shift 35% of electronic assembly purchase orders from Shenzhen Module Works to Apex Microelectronics (Taiwan, 94.2% OTIF). The modest component piece-price variance (+2.4%) is outweighed by saving $92k in delay penalties and reducing assembly line idle time.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-indigo-700 font-semibold text-xs">
              <Warehouse className="w-4 h-4" />
              <span>2. Warehouse Dock Dispatch Rebalancing</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Restructure staging shifts at WH-ORD and WH-LAX with cross-docking priority lanes for high-velocity SKUs. Target reduction in dock dwell time from 35.0h to &lt;22.0h to meet domestic next-day line-haul cutoff schedules.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-emerald-700 font-semibold text-xs">
              <DollarSign className="w-4 h-4" />
              <span>3. Modal Optimization (Sea-Air Hybrid)</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Replace 20% of expedited air freight with scheduled Sea-Air intermodal transit via Singapore and Dubai hubs. Preserves 92%+ on-time predictability while cutting freight costs from $6.80/kg to $3.10/kg ($185k annual savings).
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-rose-700 font-semibold text-xs">
              <ShieldAlert className="w-4 h-4" />
              <span>4. Vendor Penalty Clause Enforcement</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Activate standard 5% invoice liquidated damage deductions for any Tier 2/3 vendor shipments exceeding +72h delay. Expected recovery: ~$92,000 in credit offsets across the upcoming contracting cycle.
            </p>
          </div>
        </div>
      </section>

      {/* Sign-off footer */}
      <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-mono">
        <span>Supply Chain &amp; Logistics Performance Analytics</span>
        <span>Generated from SQL, Excel &amp; Power BI Analytics Stack</span>
      </div>
    </div>
  );
};
