import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  Download, 
  FileSpreadsheet, 
  RotateCcw, 
  Sliders, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { CARRIERS, SHIPMENTS, SUPPLIERS, WAREHOUSES } from '../../data/mockData';
import { PivotConfig, Region, TransportMode } from '../../types/supplyChain';
import { downloadCSV } from '../../utils/exportUtils';

export const ExcelPivotModeling: React.FC = () => {
  // Pivot configuration state
  const [pivotConfig, setPivotConfig] = useState<PivotConfig>({
    rowField: 'destinationRegion',
    columnField: 'transportMode',
    valueField: 'freightCost',
    aggregation: 'sum',
  });

  // What-If Scenario Simulator state
  const [volumeReallocationPct, setVolumeReallocationPct] = useState<number>(35); // 0 to 50%
  const [shiftAirToOceanPct, setShiftAirToOceanPct] = useState<number>(20); // 0 to 40%
  const [applyVendorPenaltyClause, setApplyVendorPenaltyClause] = useState<boolean>(true);

  // Dynamic calculation of pivot table
  const pivotData = useMemo(() => {
    const rowsSet = new Set<string>();
    const colsSet = new Set<string>();
    const matrix: Record<string, Record<string, { sum: number; count: number; onTimeCount: number }>> = {};

    SHIPMENTS.forEach(s => {
      // Resolve row key
      let rowKey = '';
      if (pivotConfig.rowField === 'destinationRegion') rowKey = s.destinationRegion;
      else if (pivotConfig.rowField === 'supplier') {
        const sup = SUPPLIERS.find(item => item.id === s.supplierId);
        rowKey = sup ? sup.name : s.supplierId;
      } else if (pivotConfig.rowField === 'originWarehouse') {
        const wh = WAREHOUSES.find(item => item.id === s.originWarehouseId);
        rowKey = wh ? wh.code : s.originWarehouseId;
      } else if (pivotConfig.rowField === 'carrier') {
        const car = CARRIERS.find(item => item.id === s.carrierId);
        rowKey = car ? car.name : s.carrierId;
      } else if (pivotConfig.rowField === 'transportMode') {
        rowKey = s.transportMode;
      }

      // Resolve column key
      let colKey = '';
      if (pivotConfig.columnField === 'transportMode') colKey = s.transportMode;
      else if (pivotConfig.columnField === 'destinationRegion') colKey = s.destinationRegion;
      else if (pivotConfig.columnField === 'status') colKey = s.status;
      else if (pivotConfig.columnField === 'quarter') {
        const m = parseInt(s.orderDate.split('-')[1], 10);
        colKey = m <= 3 ? 'Q1' : m <= 6 ? 'Q2' : m <= 9 ? 'Q3' : 'Q4';
      }

      rowsSet.add(rowKey);
      colsSet.add(colKey);

      if (!matrix[rowKey]) matrix[rowKey] = {};
      if (!matrix[rowKey][colKey]) {
        matrix[rowKey][colKey] = { sum: 0, count: 0, onTimeCount: 0 };
      }

      let metricVal = 0;
      if (pivotConfig.valueField === 'freightCost') metricVal = s.freightCost;
      else if (pivotConfig.valueField === 'delayHours') metricVal = s.delayHours;
      else if (pivotConfig.valueField === 'weightKg') metricVal = s.weightKg;
      else metricVal = 1;

      matrix[rowKey][colKey].sum += metricVal;
      matrix[rowKey][colKey].count += 1;
      if (s.status === 'On Time') {
        matrix[rowKey][colKey].onTimeCount += 1;
      }
    });

    const rows = Array.from(rowsSet).sort();
    const cols = Array.from(colsSet).sort();

    return { rows, cols, matrix };
  }, [pivotConfig]);

  // Format value depending on metric type
  const formatCellValue = (val: number, isTotal = false) => {
    if (pivotConfig.valueField === 'freightCost') {
      return `$${Math.round(val).toLocaleString()}`;
    }
    if (pivotConfig.valueField === 'delayHours') {
      return `${Math.round(val * 10) / 10}h`;
    }
    if (pivotConfig.valueField === 'weightKg') {
      return `${Math.round(val).toLocaleString()} kg`;
    }
    if (pivotConfig.valueField === 'onTimeRate') {
      return `${Math.round(val * 10) / 10}%`;
    }
    return Math.round(val).toLocaleString();
  };

  const getAggregateValue = (data?: { sum: number; count: number; onTimeCount: number }) => {
    if (!data || data.count === 0) return 0;
    if (pivotConfig.valueField === 'onTimeRate') {
      return (data.onTimeCount / data.count) * 100;
    }
    if (pivotConfig.aggregation === 'avg') {
      return data.sum / data.count;
    }
    if (pivotConfig.aggregation === 'count') {
      return data.count;
    }
    return data.sum;
  };

  // Export pivot table to CSV
  const handleExportPivot = () => {
    const csvData: Record<string, unknown>[] = [];
    pivotData.rows.forEach(r => {
      const rowObj: Record<string, unknown> = { [pivotConfig.rowField]: r };
      pivotData.cols.forEach(c => {
        const cell = pivotData.matrix[r]?.[c];
        rowObj[c] = cell ? formatCellValue(getAggregateValue(cell)) : '-';
      });
      csvData.push(rowObj);
    });
    downloadCSV(csvData, `pivot_table_${pivotConfig.rowField}_by_${pivotConfig.columnField}`);
  };

  // What-If Simulation calculations
  const simulationResults = useMemo(() => {
    const baselineOtif = 88.4;
    const baselineSpend = 1420000;
    const baselineDelayPenalties = 265000; // estimated delay SLA penalties

    // Each 10% reallocation of high risk suppliers adds ~1.4% OTIF
    const otifGainFromVendor = (volumeReallocationPct / 10) * 1.5;
    // Shifting mode saves cost but affects OTIF slightly
    const costSavingsFromMode = (shiftAirToOceanPct / 100) * 185000;
    const penaltyClawback = applyVendorPenaltyClause ? 92000 : 0;

    const projectedOtif = Math.min(Math.round((baselineOtif + otifGainFromVendor) * 10) / 10, 97.5);
    const penaltyAvoidance = Math.round((otifGainFromVendor / 8.0) * baselineDelayPenalties);
    const netSavings = penaltyAvoidance + costSavingsFromMode + penaltyClawback;

    return {
      baselineOtif,
      projectedOtif,
      otifDelta: (projectedOtif - baselineOtif).toFixed(1),
      penaltyAvoidance,
      costSavingsFromMode,
      penaltyClawback,
      netSavings,
    };
  }, [volumeReallocationPct, shiftAirToOceanPct, applyVendorPenaltyClause]);

  return (
    <div className="space-y-6">
      {/* Excel Ribbon & Formula Bar Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
              <h2 className="text-base font-semibold text-slate-900">
                Excel Pivot Table &amp; Decision Modeling Workspace
              </h2>
            </div>
            <p className="text-xs text-slate-500 max-w-3xl">
              Simulate multidimensional cross-tabulations and evaluate what-if supply chain decisions to renegotiate supplier allocations and optimize freight mode expenditure.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportPivot}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Pivot CSV</span>
            </button>
          </div>
        </div>

        {/* Formula Bar Mock */}
        <div className="mt-4 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-700">
          <span className="text-emerald-700 font-bold">fx</span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-800 truncate">
            =PIVOT.SUM(SHIPMENTS, Rows="{pivotConfig.rowField}", Columns="{pivotConfig.columnField}", Value="{pivotConfig.valueField}")
          </span>
        </div>
      </div>

      {/* Dynamic Pivot Configuration Controls */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
        <span className="text-xs font-semibold text-slate-800 uppercase tracking-wider block mb-3">
          Pivot Table Configuration Fields
        </span>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Rows Dimension</label>
            <select
              value={pivotConfig.rowField}
              onChange={(e) => setPivotConfig({ ...pivotConfig, rowField: e.target.value as PivotConfig['rowField'] })}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
            >
              <option value="destinationRegion">Destination Region</option>
              <option value="supplier">Supplier Name</option>
              <option value="originWarehouse">Origin Warehouse Hub</option>
              <option value="carrier">Freight Carrier</option>
              <option value="transportMode">Transport Mode</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Columns Dimension</label>
            <select
              value={pivotConfig.columnField}
              onChange={(e) => setPivotConfig({ ...pivotConfig, columnField: e.target.value as PivotConfig['columnField'] })}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
            >
              <option value="transportMode">Transport Mode</option>
              <option value="destinationRegion">Destination Region</option>
              <option value="status">Delivery Status</option>
              <option value="quarter">Calendar Quarter (Q1-Q4)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Metric Value</label>
            <select
              value={pivotConfig.valueField}
              onChange={(e) => setPivotConfig({ ...pivotConfig, valueField: e.target.value as PivotConfig['valueField'] })}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
            >
              <option value="freightCost">Total Freight Spend ($)</option>
              <option value="delayHours">Delay Impact (Hours)</option>
              <option value="weightKg">Total Weight (KG)</option>
              <option value="onTimeRate">On-Time OTIF Rate (%)</option>
              <option value="count">Shipment Order Count</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Aggregation Math</label>
            <select
              value={pivotConfig.aggregation}
              onChange={(e) => setPivotConfig({ ...pivotConfig, aggregation: e.target.value as PivotConfig['aggregation'] })}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
            >
              <option value="sum">SUM</option>
              <option value="avg">AVERAGE (Mean)</option>
              <option value="count">COUNT</option>
            </select>
          </div>
        </div>
      </div>

      {/* Rendered Pivot Table Grid */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-800">
              Pivot Table: {pivotConfig.rowField} vs {pivotConfig.columnField}
            </span>
            <span className="text-xs text-slate-400">· Tabular figures enabled</span>
          </div>

          <span className="text-xs text-slate-500 font-mono">
            {pivotData.rows.length} rows × {pivotData.cols.length} columns
          </span>
        </div>

        <div className="overflow-x-auto max-h-[420px] border border-slate-200 rounded-lg">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-slate-100 border-b border-slate-300 text-slate-700 font-semibold z-10">
              <tr>
                <th className="py-2.5 px-3 border-r border-slate-200 bg-slate-200/70 text-slate-800 uppercase tracking-wider text-[11px]">
                  {pivotConfig.rowField}
                </th>
                {pivotData.cols.map(c => (
                  <th key={c} className="py-2.5 px-3 text-right border-r border-slate-200 whitespace-nowrap">
                    {c}
                  </th>
                ))}
                <th className="py-2.5 px-3 text-right bg-slate-200/70 text-slate-900 whitespace-nowrap font-bold">
                  Grand Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pivotData.rows.map((rowName) => {
                let rowSum = 0;
                let rowCount = 0;
                let rowOnTime = 0;

                return (
                  <tr key={rowName} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2 px-3 font-medium text-slate-900 border-r border-slate-200 bg-slate-50/50 whitespace-nowrap">
                      {rowName}
                    </td>

                    {pivotData.cols.map(colName => {
                      const cell = pivotData.matrix[rowName]?.[colName];
                      if (cell) {
                        rowSum += cell.sum;
                        rowCount += cell.count;
                        rowOnTime += cell.onTimeCount;
                      }

                      const val = cell ? getAggregateValue(cell) : 0;

                      return (
                        <td key={colName} className="py-2 px-3 text-right font-mono tabular-nums border-r border-slate-100 whitespace-nowrap text-slate-700">
                          {cell ? formatCellValue(val) : <span className="text-slate-300">-</span>}
                        </td>
                      );
                    })}

                    {/* Row Grand Total */}
                    <td className="py-2 px-3 text-right font-mono tabular-nums font-semibold bg-slate-50/80 text-slate-900 whitespace-nowrap">
                      {rowCount > 0 
                        ? formatCellValue(
                            pivotConfig.valueField === 'onTimeRate' 
                              ? (rowOnTime / rowCount) * 100 
                              : pivotConfig.aggregation === 'avg' 
                                ? rowSum / rowCount 
                                : rowSum
                          ) 
                        : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* What-If Supplier Decision Simulator (Required Core Feature) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-indigo-600" />
            <h3 className="text-base font-semibold text-slate-900">
              "What-If" Supplier Allocation &amp; Decision Simulator
            </h3>
          </div>
          <span className="text-xs text-indigo-700 font-medium bg-indigo-50 px-2 py-0.5 rounded">
            Executive Decision Model
          </span>
        </div>
        <p className="text-xs text-slate-500 mb-5">
          Simulate shifting purchase order volume away from chronic delay vendors (Shenzhen Module Works &amp; Pacific Rim Fasteners) to Preferred Tier 1 suppliers (Apex Micro &amp; Vanguard Steel) to forecast SLA recovery and financial ROI.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Column (5 cols) */}
          <div className="lg:col-span-5 space-y-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-800 mb-1">
                <span>Volume Reallocation from At-Risk Vendors</span>
                <span className="font-mono text-indigo-600 font-semibold">{volumeReallocationPct}% shifted</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="5"
                value={volumeReallocationPct}
                onChange={(e) => setVolumeReallocationPct(parseInt(e.target.value, 10))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-0.5">
                <span>0% (As-is)</span>
                <span>25% (Moderate)</span>
                <span>50% (Max Capacity)</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-slate-800 mb-1">
                <span>Modal Shift (Air Freight to Sea-Air Hybrid)</span>
                <span className="font-mono text-indigo-600 font-semibold">{shiftAirToOceanPct}% shifted</span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                step="5"
                value={shiftAirToOceanPct}
                onChange={(e) => setShiftAirToOceanPct(parseInt(e.target.value, 10))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-0.5">
                <span>0% (Status Quo)</span>
                <span>20% (Recommended)</span>
                <span>40% (Max)</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={applyVendorPenaltyClause}
                  onChange={(e) => setApplyVendorPenaltyClause(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <span className="text-xs text-slate-700 font-medium">
                  Enforce Contractual Late-Delivery Penalty Clauses (Tier 2/3)
                </span>
              </label>
              <p className="text-[11px] text-slate-400 ml-5 mt-0.5">
                Claw back 5% invoice surcharge on shipments exceeding +72h delay threshold.
              </p>
            </div>
          </div>

          {/* Forecasted Impact Summary (7 cols) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Projected OTIF */}
            <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl">
              <div className="flex items-center justify-between text-xs text-emerald-800 font-medium mb-1">
                <span>Projected OTIF Rate</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold font-mono tabular-nums text-emerald-950">
                  {simulationResults.projectedOtif}%
                </span>
                <span className="text-xs font-semibold text-emerald-700">
                  +{simulationResults.otifDelta}% gain
                </span>
              </div>
              <p className="text-xs text-emerald-700 mt-2">
                Recovers SLA from baseline 88.4% to close the gap against the 95.0% enterprise target.
              </p>
            </div>

            {/* Net Financial Return */}
            <div className="p-4 bg-indigo-50/60 border border-indigo-200 rounded-xl">
              <div className="flex items-center justify-between text-xs text-indigo-800 font-medium mb-1">
                <span>Net Projected Savings</span>
                <TrendingUp className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold font-mono tabular-nums text-indigo-950">
                  +${(simulationResults.netSavings / 1000).toFixed(0)}k
                </span>
                <span className="text-xs text-indigo-700">Annualized</span>
              </div>
              <p className="text-xs text-indigo-700 mt-2">
                Combines ${Math.round(simulationResults.penaltyAvoidance / 1000)}k penalty avoidance + ${Math.round(simulationResults.costSavingsFromMode / 1000)}k modal optimization.
              </p>
            </div>

            {/* Action Card Full Width */}
            <div className="sm:col-span-2 p-3.5 bg-slate-900 text-white rounded-xl text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-emerald-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Executive Decision Recommendation:</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Approve shifting {volumeReallocationPct}% volume from Shenzhen Module Works to Apex Microelectronics ahead of Q3 peak season. The shift requires +$32k in slightly higher component piece-price, but yields +${Math.round(simulationResults.netSavings / 1000)}k in net bottom-line savings by eliminating dock congestion and liquidated delay damages.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
