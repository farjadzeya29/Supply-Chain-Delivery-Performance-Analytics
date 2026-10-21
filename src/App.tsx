import React, { useState } from 'react';
import { Header } from './components/Header';
import { PowerBIDashboard } from './components/Dashboard/PowerBIDashboard';
import { SQLWorkbench } from './components/SQLWorkbench/SQLWorkbench';
import { ExcelPivotModeling } from './components/ExcelModeling/ExcelPivotModeling';
import { ShipmentInspector } from './components/ShipmentInspector/ShipmentInspector';
import { ExecutiveMemo } from './components/ExecutiveMemo/ExecutiveMemo';
import { SlicerFilterState } from './types/supplyChain';
import { 
  BarChart3, 
  Database, 
  FileSpreadsheet, 
  FileText, 
  Package, 
  Truck, 
  ArrowUpRight 
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'powerbi' | 'sql' | 'excel' | 'shipments' | 'memo'>('powerbi');

  // Filter state for Power BI dashboard
  const [filters, setFilters] = useState<SlicerFilterState>({
    dateRange: 'all',
    region: 'all',
    transportMode: 'all',
    carrierId: 'all',
    supplierId: 'all',
    status: 'all',
    searchQuery: '',
  });

  const handleUpdateFilters = (newFilters: Partial<SlicerFilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({
      dateRange: 'all',
      region: 'all',
      transportMode: 'all',
      carrierId: 'all',
      supplierId: 'all',
      status: 'all',
      searchQuery: '',
    });
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans selection:bg-slate-900 selection:text-white">
      {/* Top Bar adhering to Top Bar Contract */}
      <Header activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* Secondary Context & Mode Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* Breadcrumb / Mode indicator */}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Enterprise Logistics</span>
            <span aria-hidden="true">/</span>
            <span className="font-semibold text-slate-900">Delivery Performance &amp; Supplier Analytics</span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-400 font-mono">SQL · Excel · Power BI</span>
          </div>

          {/* Quick Segmented Switcher for Mobile & Tablet */}
          <div className="flex md:hidden items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium w-full overflow-x-auto">
            <button
              onClick={() => setActiveTab('powerbi')}
              className={`px-3 py-1 rounded-md whitespace-nowrap cursor-pointer ${
                activeTab === 'powerbi' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600'
              }`}
            >
              Power BI
            </button>
            <button
              onClick={() => setActiveTab('sql')}
              className={`px-3 py-1 rounded-md whitespace-nowrap cursor-pointer ${
                activeTab === 'sql' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600'
              }`}
            >
              SQL Workbench
            </button>
            <button
              onClick={() => setActiveTab('excel')}
              className={`px-3 py-1 rounded-md whitespace-nowrap cursor-pointer ${
                activeTab === 'excel' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600'
              }`}
            >
              Excel Pivot
            </button>
            <button
              onClick={() => setActiveTab('shipments')}
              className={`px-3 py-1 rounded-md whitespace-nowrap cursor-pointer ${
                activeTab === 'shipments' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600'
              }`}
            >
              Shipments
            </button>
            <button
              onClick={() => setActiveTab('memo')}
              className={`px-3 py-1 rounded-md whitespace-nowrap cursor-pointer ${
                activeTab === 'memo' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600'
              }`}
            >
              Executive Memo
            </button>
          </div>

          {/* SLA Benchmark Status */}
          <div className="hidden sm:flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-slate-600">
              <span className="text-slate-400">Target OTIF:</span>
              <span className="font-mono font-semibold text-slate-800">95.0%</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600">
              <span className="text-slate-400">Audited Volume:</span>
              <span className="font-mono font-semibold text-slate-800">640 Shipments</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600">
              <span className="text-slate-400">Spend:</span>
              <span className="font-mono font-semibold text-slate-800">$3.84M YTD</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'powerbi' && (
          <PowerBIDashboard 
            filters={filters} 
            onUpdateFilters={handleUpdateFilters} 
            onResetFilters={handleResetFilters} 
          />
        )}

        {activeTab === 'sql' && (
          <SQLWorkbench />
        )}

        {activeTab === 'excel' && (
          <ExcelPivotModeling />
        )}

        {activeTab === 'shipments' && (
          <ShipmentInspector />
        )}

        {activeTab === 'memo' && (
          <ExecutiveMemo />
        )}
      </main>

      {/* Minimal clean footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-4 px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">LogiPulse Analytics</span>
            <span>·</span>
            <span>Supply Chain &amp; Delivery Performance Engine</span>
          </div>

          <div className="flex items-center gap-4 text-slate-500">
            <span>SQL Database: Normalized (4 Tables)</span>
            <span>·</span>
            <span>Excel Engine: Multi-pivot &amp; Simulation</span>
            <span>·</span>
            <span>Power BI Canvas: Cross-Filtering Active</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
