import React, { useMemo } from 'react';
import { 
  AlertTriangle, 
  ArrowDownRight, 
  ArrowUpRight, 
  BarChart3, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Filter, 
  Globe2, 
  Package, 
  RotateCcw, 
  ShieldAlert, 
  TrendingDown, 
  TrendingUp, 
  Truck, 
  Warehouse 
} from 'lucide-react';
import { CARRIERS, SHIPMENTS, SUPPLIERS, WAREHOUSES } from '../../data/mockData';
import { DelayReason, DeliveryStatus, Region, Shipment, SlicerFilterState, TransportMode } from '../../types/supplyChain';

interface PowerBIDashboardProps {
  filters: SlicerFilterState;
  onUpdateFilters: (newFilters: Partial<SlicerFilterState>) => void;
  onResetFilters: () => void;
  onSelectShipmentId?: (id: string) => void;
}

export const PowerBIDashboard: React.FC<PowerBIDashboardProps> = ({
  filters,
  onUpdateFilters,
  onResetFilters,
}) => {
  // Filter shipments based on current slicer state
  const filteredShipments = useMemo(() => {
    return SHIPMENTS.filter(s => {
      // Date quarter filter
      if (filters.dateRange !== 'all') {
        const month = parseInt(s.orderDate.split('-')[1], 10);
        if (filters.dateRange === 'q1' && !(month >= 1 && month <= 3)) return false;
        if (filters.dateRange === 'q2' && !(month >= 4 && month <= 6)) return false;
        if (filters.dateRange === 'q3' && !(month >= 7 && month <= 9)) return false;
        if (filters.dateRange === 'q4' && !(month >= 10 && month <= 12)) return false;
      }

      // Region filter
      if (filters.region !== 'all' && s.destinationRegion !== filters.region) {
        return false;
      }

      // Transport mode filter
      if (filters.transportMode !== 'all' && s.transportMode !== filters.transportMode) {
        return false;
      }

      // Carrier filter
      if (filters.carrierId !== 'all' && s.carrierId !== filters.carrierId) {
        return false;
      }

      // Supplier filter
      if (filters.supplierId !== 'all' && s.supplierId !== filters.supplierId) {
        return false;
      }

      // Status filter
      if (filters.status !== 'all' && s.status !== filters.status) {
        return false;
      }

      return true;
    });
  }, [filters]);

  // High-level KPI aggregations
  const totalShipments = filteredShipments.length;
  const completedShipments = filteredShipments.filter(s => s.status !== 'In Transit');
  const onTimeCount = completedShipments.filter(s => s.status === 'On Time').length;
  const delayedCount = completedShipments.filter(s => s.status === 'Delayed' || s.status === 'Critical Delay').length;
  const criticalDelayCount = completedShipments.filter(s => s.status === 'Critical Delay').length;

  const otifRate = completedShipments.length > 0 
    ? Math.round((onTimeCount / completedShipments.length) * 1000) / 10 
    : 0;

  const targetOtif = 95.0;
  const otifVariance = Math.round((otifRate - targetOtif) * 10) / 10;

  const totalSpend = filteredShipments.reduce((sum, s) => sum + s.freightCost, 0);
  const avgCostPerShipment = totalShipments > 0 ? Math.round(totalSpend / totalShipments) : 0;
  const totalWeightKg = filteredShipments.reduce((sum, s) => sum + s.weightKg, 0);
  const avgCostPerKg = totalWeightKg > 0 ? (totalSpend / totalWeightKg).toFixed(2) : '0.00';

  const delayedOnly = completedShipments.filter(s => s.delayHours > 0);
  const avgDelayHours = delayedOnly.length > 0
    ? Math.round((delayedOnly.reduce((sum, s) => sum + s.delayHours, 0) / delayedOnly.length) * 10) / 10
    : 0;
  const avgDelayDays = (avgDelayHours / 24).toFixed(1);

  const avgDockDispatchHours = filteredShipments.length > 0
    ? Math.round((filteredShipments.reduce((sum, s) => sum + s.warehouseProcessingHours, 0) / filteredShipments.length) * 10) / 10
    : 0;

  // Regional Performance breakdown
  const regionalMetrics = useMemo(() => {
    const regions: Region[] = ['North America', 'EMEA', 'APAC', 'LATAM'];
    return regions.map(reg => {
      const regShipments = completedShipments.filter(s => s.destinationRegion === reg);
      const regTotal = regShipments.length;
      const regOnTime = regShipments.filter(s => s.status === 'On Time').length;
      const regOtif = regTotal > 0 ? Math.round((regOnTime / regTotal) * 1000) / 10 : 0;
      const regDelays = regShipments.filter(s => s.status === 'Delayed' || s.status === 'Critical Delay').length;
      const regSpend = regShipments.reduce((sum, s) => sum + s.freightCost, 0);
      const regAvgCost = regTotal > 0 ? Math.round(regSpend / regTotal) : 0;

      // Primary active bottleneck note
      let keyBottleneck = 'Normal operations';
      if (reg === 'North America') keyBottleneck = 'Long Beach chassis shortage & ORD dock backlog';
      else if (reg === 'EMEA') keyBottleneck = 'Rotterdam EU customs compliance holds';
      else if (reg === 'LATAM') keyBottleneck = 'Sao Paulo import tariff verification audits';
      else if (reg === 'APAC') keyBottleneck = 'Pudong export quarantine queuing';

      return {
        region: reg,
        total: regTotal,
        onTime: regOnTime,
        delays: regDelays,
        otifRate: regOtif,
        totalSpend: regSpend,
        avgCost: regAvgCost,
        keyBottleneck,
      };
    });
  }, [completedShipments]);

  // Bottleneck Root-Cause breakdown
  const rootCauses = useMemo(() => {
    const counts: Record<string, { count: number; totalHours: number; spend: number }> = {};
    const delayed = completedShipments.filter(s => s.delayReason !== 'None');

    delayed.forEach(s => {
      if (!counts[s.delayReason]) {
        counts[s.delayReason] = { count: 0, totalHours: 0, spend: 0 };
      }
      counts[s.delayReason].count += 1;
      counts[s.delayReason].totalHours += s.delayHours;
      counts[s.delayReason].spend += s.freightCost;
    });

    return Object.entries(counts)
      .map(([reason, data]) => ({
        reason,
        count: data.count,
        totalHours: data.totalHours,
        avgHours: Math.round((data.totalHours / data.count) * 10) / 10,
        spend: data.spend,
        sharePct: delayed.length > 0 ? Math.round((data.count / delayed.length) * 1000) / 10 : 0,
      }))
      .sort((a, b) => b.totalHours - a.totalHours);
  }, [completedShipments]);

  // Warehouse Hub Fulfillment Processing vs Transit Delay
  const warehouseBreakdown = useMemo(() => {
    return WAREHOUSES.map(wh => {
      const whShipments = filteredShipments.filter(s => s.originWarehouseId === wh.id);
      const total = whShipments.length;
      const avgDispatch = total > 0
        ? Math.round((whShipments.reduce((sum, s) => sum + s.warehouseProcessingHours, 0) / total) * 10) / 10
        : wh.avgDispatchHours;
      const avgTransit = total > 0
        ? Math.round((whShipments.reduce((sum, s) => sum + s.transitDays, 0) / total) * 10) / 10
        : 5;
      const delayed = whShipments.filter(s => s.status === 'Delayed' || s.status === 'Critical Delay').length;
      const delayedRate = total > 0 ? Math.round((delayed / total) * 1000) / 10 : 0;

      return {
        ...wh,
        shipmentCount: total,
        avgDispatch,
        avgTransit,
        delayedCount: delayed,
        delayedRate,
      };
    }).sort((a, b) => b.avgDispatch - a.avgDispatch);
  }, [filteredShipments]);

  // Carrier Performance Comparison
  const carrierComparison = useMemo(() => {
    return CARRIERS.map(c => {
      const carrierShipments = completedShipments.filter(s => s.carrierId === c.id);
      const total = carrierShipments.length;
      const onTime = carrierShipments.filter(s => s.status === 'On Time').length;
      const otif = total > 0 ? Math.round((onTime / total) * 1000) / 10 : c.reliabilityScore;
      const spend = carrierShipments.reduce((sum, s) => sum + s.freightCost, 0);
      const avgCost = total > 0 ? Math.round(spend / total) : 0;

      return {
        ...c,
        volume: total,
        otif,
        spend,
        avgCost,
      };
    }).sort((a, b) => b.otif - a.otif);
  }, [completedShipments]);

  // Has active filters
  const hasActiveFilters = 
    filters.dateRange !== 'all' || 
    filters.region !== 'all' || 
    filters.transportMode !== 'all' || 
    filters.carrierId !== 'all' || 
    filters.supplierId !== 'all' || 
    filters.status !== 'all';

  return (
    <div className="space-y-6">
      {/* Slicers Toolbar (Power BI Style Ribbon) */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Interactive Dashboard Slicers
            </span>
            <span className="text-xs text-slate-400">· Click any segment to cross-filter all visuals</span>
          </div>

          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset All Slicers</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-3">
          {/* Quarter Slicer */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Time Horizon</label>
            <select
              value={filters.dateRange}
              onChange={(e) => onUpdateFilters({ dateRange: e.target.value as SlicerFilterState['dateRange'] })}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
            >
              <option value="all">Full Year 2026 (All)</option>
              <option value="q1">Q1 (Jan - Mar)</option>
              <option value="q2">Q2 (Apr - Jun)</option>
              <option value="q3">Q3 (Jul - Sep)</option>
              <option value="q4">Q4 (Oct - Dec)</option>
            </select>
          </div>

          {/* Region Slicer */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Destination Region</label>
            <select
              value={filters.region}
              onChange={(e) => onUpdateFilters({ region: e.target.value as SlicerFilterState['region'] })}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
            >
              <option value="all">All Regions (Global)</option>
              <option value="North America">North America</option>
              <option value="EMEA">EMEA (Europe &amp; ME)</option>
              <option value="APAC">APAC (Asia-Pacific)</option>
              <option value="LATAM">LATAM (Latin America)</option>
            </select>
          </div>

          {/* Transport Mode Slicer */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Transport Mode</label>
            <select
              value={filters.transportMode}
              onChange={(e) => onUpdateFilters({ transportMode: e.target.value as SlicerFilterState['transportMode'] })}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
            >
              <option value="all">All Modes</option>
              <option value="Air Freight">Air Freight</option>
              <option value="Ocean Freight">Ocean Freight</option>
              <option value="Road Transport">Road Transport</option>
              <option value="Rail Express">Rail Express</option>
            </select>
          </div>

          {/* Carrier Slicer */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Primary Carrier</label>
            <select
              value={filters.carrierId}
              onChange={(e) => onUpdateFilters({ carrierId: e.target.value })}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
            >
              <option value="all">All Carriers ({CARRIERS.length})</option>
              {CARRIERS.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Delivery Status Slicer */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Delivery Status</label>
            <select
              value={filters.status}
              onChange={(e) => onUpdateFilters({ status: e.target.value as SlicerFilterState['status'] })}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
            >
              <option value="all">All Statuses</option>
              <option value="On Time">On Time</option>
              <option value="Delayed">Delayed</option>
              <option value="Critical Delay">Critical Delay</option>
              <option value="In Transit">In Transit</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Scorecards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* KPI 1: On-Time In-Full (OTIF) */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span>On-Time Delivery Rate (OTIF)</span>
            <CheckCircle2 className={`w-4 h-4 ${otifRate >= 92 ? 'text-emerald-600' : 'text-amber-600'}`} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
              {otifRate}%
            </span>
            <span className="text-xs text-slate-400">Target: 95.0%</span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-xs font-medium">
            {otifVariance >= 0 ? (
              <span className="flex items-center text-emerald-600">
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                +{otifVariance}% vs SLA
              </span>
            ) : (
              <span className="flex items-center text-rose-600">
                <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
                {otifVariance}% SLA Breach
              </span>
            )}
            <span className="text-slate-400 font-normal">· {onTimeCount}/{completedShipments.length} fulfilled</span>
          </div>
        </div>

        {/* KPI 2: Average Delivery Delay */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span>Avg Transit Delay</span>
            <Clock className="w-4 h-4 text-slate-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
              {avgDelayDays} <span className="text-base font-normal text-slate-600">days</span>
            </span>
            <span className="text-xs text-slate-400 font-mono tabular-nums">({avgDelayHours}h)</span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-xs text-slate-500">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>{delayedCount} shipments delayed ({criticalDelayCount} critical)</span>
          </div>
        </div>

        {/* KPI 3: Total Logistics Freight Spend */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span>Total Logistics Spend</span>
            <DollarSign className="w-4 h-4 text-slate-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
              ${(totalSpend / 1000).toFixed(1)}k
            </span>
            <span className="text-xs text-slate-400">Total YTD</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>Avg ${avgCostPerShipment} / shipment</span>
            <span className="font-mono tabular-nums text-slate-700">${avgCostPerKg}/kg</span>
          </div>
        </div>

        {/* KPI 4: Warehouse Dispatch Lead Time */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span>Dock Dispatch Lead Time</span>
            <Warehouse className="w-4 h-4 text-slate-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
              {avgDockDispatchHours} <span className="text-base font-normal text-slate-600">hrs</span>
            </span>
            <span className="text-xs text-slate-400">Benchmark: 24h</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            {avgDockDispatchHours > 24 ? (
              <span className="text-rose-600 font-medium">
                +{(avgDockDispatchHours - 24).toFixed(1)}h dock fulfillment lag
              </span>
            ) : (
              <span className="text-emerald-600 font-medium">Within 24h SLA benchmark</span>
            )}
          </div>
        </div>

        {/* KPI 5: Active Bottlenecks & Disruptions */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span>Bottleneck Incidents</span>
            <ShieldAlert className="w-4 h-4 text-rose-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-rose-600 font-mono tabular-nums">
              {delayedOnly.length}
            </span>
            <span className="text-xs text-slate-400">
              ({totalShipments > 0 ? Math.round((delayedOnly.length / totalShipments) * 100) : 0}% of volume)
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 truncate" title="Customs and port congestion primary drivers">
            Primary: Customs &amp; Port Queues
          </div>
        </div>
      </div>

      {/* Main Visuals Grid: Section 1 - Regional Delivery Performance Matrix */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Regional Delivery Performance &amp; Bottleneck Matrix
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Cross-regional comparison of OTIF compliance, delayed shipments, freight spend, and active localized bottlenecks. Click any region to filter.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-emerald-500"></span>
            <span>&gt;90% OTIF</span>
            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-amber-500 ml-2"></span>
            <span>85-90% OTIF</span>
            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-rose-500 ml-2"></span>
            <span>&lt;85% OTIF</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {regionalMetrics.map(reg => {
            const isSelected = filters.region === reg.region;
            const statusColor = reg.otifRate >= 90 
              ? 'text-emerald-700 bg-emerald-50 border-emerald-200' 
              : reg.otifRate >= 85 
                ? 'text-amber-700 bg-amber-50 border-amber-200' 
                : 'text-rose-700 bg-rose-50 border-rose-200';

            const barColor = reg.otifRate >= 90 ? 'bg-emerald-500' : reg.otifRate >= 85 ? 'bg-amber-500' : 'bg-rose-500';

            return (
              <div
                key={reg.region}
                onClick={() => onUpdateFilters({ region: isSelected ? 'all' : reg.region })}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected 
                    ? 'border-slate-900 ring-2 ring-slate-900/10 bg-slate-50/70' 
                    : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/40'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-sm text-slate-900">{reg.region}</span>
                  <span className={`text-xs font-mono font-medium px-2 py-0.5 rounded-md border ${statusColor}`}>
                    {reg.otifRate}% OTIF
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 rounded-full h-1.5 mb-3 overflow-hidden">
                  <div className={`h-full ${barColor}`} style={{ width: `${Math.min(reg.otifRate, 100)}%` }}></div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 mb-3">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Volume</span>
                    <span className="font-mono tabular-nums text-slate-900">{reg.total} shipments</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Delays</span>
                    <span className="font-mono tabular-nums text-rose-600 font-medium">{reg.delays} delayed</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Freight Spend</span>
                    <span className="font-mono tabular-nums text-slate-900">${(reg.totalSpend / 1000).toFixed(1)}k</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Avg Cost / Order</span>
                    <span className="font-mono tabular-nums text-slate-900">${reg.avgCost}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 text-xs">
                  <span className="text-slate-400 block text-[11px] mb-0.5">Identified Bottleneck:</span>
                  <p className="text-slate-700 text-[11px] leading-tight line-clamp-2">
                    {reg.keyBottleneck}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Visuals Row 2: Bottleneck Root-Cause Waterfall & Warehouse Processing vs Transit */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Visual 2A: Bottleneck Root-Cause Breakdown (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-semibold text-slate-900">
              Delay Root-Cause Breakdown
            </h3>
            <span className="text-xs text-slate-500">Hours Lost</span>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Aggregated impact hours and shipment disruption frequency by root cause category.
          </p>

          <div className="space-y-3.5">
            {rootCauses.map((rc, idx) => {
              const maxHours = rootCauses[0]?.totalHours || 1;
              const barWidth = Math.round((rc.totalHours / maxHours) * 100);

              return (
                <div key={rc.reason} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-800 truncate pr-2 max-w-[220px]">
                      {rc.reason}
                    </span>
                    <div className="flex items-center gap-2 text-slate-600 font-mono tabular-nums shrink-0">
                      <span>{rc.totalHours.toLocaleString()}h</span>
                      <span className="text-slate-400">({rc.count} orders)</span>
                    </div>
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
                    <div 
                      className={`h-full ${
                        idx === 0 ? 'bg-rose-500' : idx === 1 ? 'bg-amber-500' : 'bg-slate-700'
                      }`}
                      style={{ width: `${barWidth}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Avg {rc.avgHours} hrs per incident</span>
                    <span>${Math.round(rc.spend / 1000)}k impacted freight</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 p-3 bg-amber-50/70 border border-amber-200/80 rounded-lg text-xs text-amber-900">
            <span className="font-semibold block mb-0.5">Analyst Insight:</span>
            Customs Clearance and Port Backlog drive 58% of all delay hours. Re-routing cargo through secondary ports (e.g. DFW or Frankfurt Air) decreases transit uncertainty by 2.1 days.
          </div>
        </div>

        {/* Visual 2B: Warehouse Dock Dispatch vs In-Transit Delay (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-semibold text-slate-900">
              Warehouse Dock Dispatch Lag vs Carrier Transit Time
            </h3>
            <span className="text-xs text-slate-500 font-mono">8 Global Hubs</span>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Highlights whether delivery bottlenecks stem from internal warehouse handling delays or carrier transit execution.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-medium pb-2">
                  <th className="py-2 pl-1 font-semibold">Warehouse Hub</th>
                  <th className="py-2">Region</th>
                  <th className="py-2 text-right">Dock Dispatch</th>
                  <th className="py-2 text-right">Avg Transit</th>
                  <th className="py-2 text-right">Delay Rate</th>
                  <th className="py-2 pl-3">Identified Local Bottleneck</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-normal">
                {warehouseBreakdown.map((wh) => {
                  const isHighDispatch = wh.avgDispatch > 28;

                  return (
                    <tr key={wh.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 pl-1 font-medium text-slate-900">
                        {wh.name}
                        <span className="block text-[11px] text-slate-400 font-mono">{wh.code}</span>
                      </td>
                      <td className="py-2.5 text-slate-600">{wh.region}</td>
                      <td className="py-2.5 text-right font-mono tabular-nums">
                        <span className={`font-semibold ${isHighDispatch ? 'text-rose-600' : 'text-slate-800'}`}>
                          {wh.avgDispatch}h
                        </span>
                      </td>
                      <td className="py-2.5 text-right font-mono tabular-nums text-slate-700">
                        {wh.avgTransit}d
                      </td>
                      <td className="py-2.5 text-right font-mono tabular-nums">
                        <span className={`px-1.5 py-0.5 rounded text-[11px] ${
                          wh.delayedRate > 20 ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {wh.delayedRate}%
                        </span>
                      </td>
                      <td className="py-2.5 pl-3 text-slate-600 text-[11px] max-w-[220px]">
                        {wh.activeBottleneck ? (
                          <span className="text-amber-700">{wh.activeBottleneck}</span>
                        ) : (
                          <span className="text-slate-400">No active bottleneck</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>WH-ORD (Chicago) &amp; WH-LAX (Long Beach) require labor dispatch rebalancing</span>
            <span className="font-mono text-slate-700">SLA Standard: &lt;24h Dispatch</span>
          </div>
        </div>
      </div>

      {/* Visuals Row 3: Supplier Performance Scorecard & Carrier Reliability Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Visual 3A: Supplier Scorecard Matrix (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Supplier Delivery Scorecard &amp; Decision Standing
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Contract value vs delivery reliability to inform quarterly vendor renewals and penalty enforcement.
              </p>
            </div>
            <div className="text-xs text-slate-400">
              {SUPPLIERS.length} Monitored Suppliers
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-medium">
                  <th className="py-2 pl-1">Supplier</th>
                  <th className="py-2">Category</th>
                  <th className="py-2">Tier</th>
                  <th className="py-2 text-right">Contract</th>
                  <th className="py-2 text-right">OTIF %</th>
                  <th className="py-2 text-right">Lead Time</th>
                  <th className="py-2 pl-3">Decision Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {SUPPLIERS.map(sup => {
                  const statusBadge = 
                    sup.status === 'Preferred' 
                      ? 'text-emerald-700 bg-emerald-50' 
                      : sup.status === 'Active' 
                        ? 'text-slate-700 bg-slate-100' 
                        : sup.status === 'Under Review' 
                          ? 'text-amber-700 bg-amber-50' 
                          : 'text-rose-700 bg-rose-50';

                  return (
                    <tr 
                      key={sup.id}
                      onClick={() => onUpdateFilters({ supplierId: filters.supplierId === sup.id ? 'all' : sup.id })}
                      className={`cursor-pointer hover:bg-slate-50/80 transition-colors ${
                        filters.supplierId === sup.id ? 'bg-slate-100/70 font-medium' : ''
                      }`}
                    >
                      <td className="py-2.5 pl-1 font-medium text-slate-900">
                        {sup.name}
                        <span className="block text-[11px] text-slate-400">{sup.country}</span>
                      </td>
                      <td className="py-2.5 text-slate-600">{sup.category}</td>
                      <td className="py-2.5 text-slate-600">{sup.tier}</td>
                      <td className="py-2.5 text-right font-mono tabular-nums text-slate-800">
                        ${(sup.contractValue / 1000).toFixed(0)}k
                      </td>
                      <td className="py-2.5 text-right font-mono tabular-nums">
                        <span className={sup.onTimeRate >= 92 ? 'text-emerald-600 font-medium' : sup.onTimeRate >= 85 ? 'text-amber-600 font-medium' : 'text-rose-600 font-bold'}>
                          {sup.onTimeRate}%
                        </span>
                      </td>
                      <td className="py-2.5 text-right font-mono tabular-nums text-slate-600">
                        {sup.avgLeadTimeDays}d
                      </td>
                      <td className="py-2.5 pl-3">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${statusBadge}`}>
                          {sup.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500 flex justify-between">
            <span>High Risk: Shenzhen Module Works (81.4% OTIF) &amp; Pacific Rim Fasteners (76.8% OTIF)</span>
            <span className="text-slate-400">Click row to filter</span>
          </div>
        </div>

        {/* Visual 3B: Carrier On-Time vs Freight Cost Matrix (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-semibold text-slate-900">
              Carrier Reliability vs Shipping Cost
            </h3>
            <span className="text-xs text-slate-500 font-mono">7 Carriers</span>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Evaluating carrier performance to optimize modal selection and carrier allocation.
          </p>

          <div className="space-y-3">
            {carrierComparison.map((carrier) => {
              const isSelected = filters.carrierId === carrier.id;

              return (
                <div
                  key={carrier.id}
                  onClick={() => onUpdateFilters({ carrierId: isSelected ? 'all' : carrier.id })}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    isSelected 
                      ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900/10' 
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-900">{carrier.name}</span>
                    <span className="font-mono tabular-nums text-slate-700 font-medium">
                      {carrier.otif}% OTIF
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5">
                    <span>{carrier.modes.join(', ')}</span>
                    <span className="font-mono tabular-nums">${carrier.avgCostPerKg}/kg benchmark</span>
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className={`h-full ${carrier.otif >= 92 ? 'bg-emerald-500' : carrier.otif >= 88 ? 'bg-amber-500' : 'bg-rose-500'}`}
                      style={{ width: `${Math.min(carrier.otif, 100)}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-mono tabular-nums">
                    <span>{carrier.volume} shipments handled</span>
                    <span>Claims: {carrier.claimsRate}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
