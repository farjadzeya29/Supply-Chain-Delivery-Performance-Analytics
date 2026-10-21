import React from 'react';
import { Download } from 'lucide-react';
import { SHIPMENTS } from '../data/mockData';
import { downloadCSV } from '../utils/exportUtils';

interface HeaderProps {
  activeTab: 'powerbi' | 'sql' | 'excel' | 'shipments' | 'memo';
  onSelectTab: (tab: 'powerbi' | 'sql' | 'excel' | 'shipments' | 'memo') => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onSelectTab }) => {
  const handleExportData = () => {
    const exportable = SHIPMENTS.map(s => ({
      ShipmentID: s.id,
      TrackingNumber: s.trackingNumber,
      OrderDate: s.orderDate,
      DispatchDate: s.dispatchDate,
      ScheduledArrival: s.scheduledArrival,
      ActualArrival: s.actualArrival || 'Pending',
      OriginWarehouse: s.originWarehouseId,
      DestinationRegion: s.destinationRegion,
      DestinationCity: s.destinationCity,
      SupplierID: s.supplierId,
      CarrierID: s.carrierId,
      TransportMode: s.transportMode,
      FreightCostUSD: s.freightCost,
      WeightKg: s.weightKg,
      Status: s.status,
      DelayHours: s.delayHours,
      DelayReason: s.delayReason,
      DockDispatchHours: s.warehouseProcessingHours,
      TransitDays: s.transitDays,
    }));
    downloadCSV(exportable, 'SupplyChain_Delivery_Analytics_2026');
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-8 px-6 py-3.5 bg-white border-b border-slate-200 shadow-xs">
      {/* Zone 1: Single text wordmark */}
      <a 
        href="#" 
        onClick={(e) => { e.preventDefault(); onSelectTab('powerbi'); }}
        className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 hover:text-slate-700 transition-colors"
      >
        LogiPulse Analytics
      </a>

      {/* Zone 2: 4-5 single-line clean navigation links */}
      <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
        <button
          onClick={() => onSelectTab('powerbi')}
          className={`cursor-pointer transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'powerbi' 
              ? 'text-slate-900 font-semibold border-b-2 border-slate-900 pb-0.5' 
              : 'hover:text-slate-900'
          }`}
        >
          Power BI Dashboard
        </button>

        <button
          onClick={() => onSelectTab('sql')}
          className={`cursor-pointer transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'sql' 
              ? 'text-slate-900 font-semibold border-b-2 border-slate-900 pb-0.5' 
              : 'hover:text-slate-900'
          }`}
        >
          SQL Query Workbench
        </button>

        <button
          onClick={() => onSelectTab('excel')}
          className={`cursor-pointer transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'excel' 
              ? 'text-slate-900 font-semibold border-b-2 border-slate-900 pb-0.5' 
              : 'hover:text-slate-900'
          }`}
        >
          Excel Pivot &amp; Modeling
        </button>

        <button
          onClick={() => onSelectTab('shipments')}
          className={`cursor-pointer transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'shipments' 
              ? 'text-slate-900 font-semibold border-b-2 border-slate-900 pb-0.5' 
              : 'hover:text-slate-900'
          }`}
        >
          Shipment Ledger
        </button>

        <button
          onClick={() => onSelectTab('memo')}
          className={`cursor-pointer transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'memo' 
              ? 'text-slate-900 font-semibold border-b-2 border-slate-900 pb-0.5' 
              : 'hover:text-slate-900'
          }`}
        >
          Executive Findings Memo
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={handleExportData}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 shadow-xs cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Dataset</span>
        </button>
      </div>
    </header>
  );
};
