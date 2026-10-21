import React, { useState, useMemo } from 'react';
import { 
  ArrowUpDown, 
  ChevronRight, 
  Clock, 
  Download, 
  Filter, 
  MapPin, 
  Package, 
  Search, 
  ShieldAlert, 
  Truck, 
  Warehouse as WarehouseIcon, 
  X 
} from 'lucide-react';
import { CARRIERS, SHIPMENTS, SUPPLIERS, WAREHOUSES } from '../../data/mockData';
import { DeliveryStatus, Shipment } from '../../types/supplyChain';
import { downloadCSV } from '../../utils/exportUtils';

export const ShipmentInspector: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | DeliveryStatus>('all');
  const [sortField, setSortField] = useState<keyof Shipment>('orderDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [page, setPage] = useState<number>(1);
  const pageSize = 20;

  // Filter & sort shipments
  const filteredShipments = useMemo(() => {
    return SHIPMENTS.filter(s => {
      if (statusFilter !== 'all' && s.status !== statusFilter) return false;
      if (!searchTerm) return true;

      const term = searchTerm.toLowerCase();
      return (
        s.trackingNumber.toLowerCase().includes(term) ||
        s.id.toLowerCase().includes(term) ||
        s.destinationCity.toLowerCase().includes(term) ||
        s.destinationRegion.toLowerCase().includes(term) ||
        s.transportMode.toLowerCase().includes(term) ||
        s.delayReason.toLowerCase().includes(term)
      );
    }).sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];

      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }

      return sortDirection === 'asc' 
        ? String(valA).localeCompare(String(valB)) 
        : String(valB).localeCompare(String(valA));
    });
  }, [statusFilter, searchTerm, sortField, sortDirection]);

  const totalPages = Math.ceil(filteredShipments.length / pageSize) || 1;
  const pagedShipments = filteredShipments.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (field: keyof Shipment) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleExportCSV = () => {
    downloadCSV(filteredShipments as unknown as Record<string, unknown>[], 'shipments_log_export');
  };

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Shipment Delivery Ledger &amp; Journey Audit
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Granular audit trail for all global shipments with milestone tracking, warehouse dock handling latency, and delay root-cause diagnostics.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Filtered ({filteredShipments.length})</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search tracking #, city, carrier, delay reason..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
              />
            </div>
          </div>

          {/* Status Segmented Buttons */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium">
            {(['all', 'On Time', 'Delayed', 'Critical Delay', 'In Transit'] as const).map(st => (
              <button
                key={st}
                onClick={() => { setStatusFilter(st); setPage(1); }}
                className={`px-3 py-1 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  statusFilter === st 
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st === 'all' ? 'All Records' : st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Shipment Records Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
              <tr>
                <th 
                  onClick={() => handleSort('trackingNumber')}
                  className="py-3 px-3 cursor-pointer hover:text-slate-900 whitespace-nowrap"
                >
                  <div className="flex items-center gap-1 font-semibold">
                    <span>Tracking Number</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

                <th 
                  onClick={() => handleSort('orderDate')}
                  className="py-3 px-3 cursor-pointer hover:text-slate-900 whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>Order Date</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

                <th className="py-3 px-3 whitespace-nowrap">Origin Hub</th>
                <th className="py-3 px-3 whitespace-nowrap">Destination</th>
                <th className="py-3 px-3 whitespace-nowrap">Mode &amp; Carrier</th>

                <th 
                  onClick={() => handleSort('freightCost')}
                  className="py-3 px-3 cursor-pointer hover:text-slate-900 text-right whitespace-nowrap"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Freight Cost</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

                <th 
                  onClick={() => handleSort('delayHours')}
                  className="py-3 px-3 cursor-pointer hover:text-slate-900 text-right whitespace-nowrap"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Delay</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

                <th className="py-3 px-3 whitespace-nowrap">Status</th>
                <th className="py-3 px-3 text-right">Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {pagedShipments.map(s => {
                const wh = WAREHOUSES.find(w => w.id === s.originWarehouseId);
                const carrier = CARRIERS.find(c => c.id === s.carrierId);

                const statusColor = 
                  s.status === 'On Time' 
                    ? 'text-emerald-700 font-medium' 
                    : s.status === 'Critical Delay' 
                      ? 'text-rose-600 font-bold' 
                      : s.status === 'Delayed' 
                        ? 'text-amber-700 font-medium' 
                        : 'text-sky-700';

                return (
                  <tr 
                    key={s.id}
                    onClick={() => setSelectedShipment(s)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                  >
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="font-mono font-medium text-slate-900">{s.trackingNumber}</span>
                      <span className="block text-[11px] text-slate-400 font-mono">{s.id}</span>
                    </td>

                    <td className="py-2.5 px-3 font-mono text-slate-600 whitespace-nowrap">
                      {s.orderDate}
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="font-medium text-slate-800">{wh?.code || s.originWarehouseId}</span>
                      <span className="block text-[11px] text-slate-400">{s.originCity}</span>
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="font-medium text-slate-800">{s.destinationCity}</span>
                      <span className="block text-[11px] text-slate-400">{s.destinationRegion}</span>
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="text-slate-800">{carrier?.name}</span>
                      <span className="block text-[11px] text-slate-400">{s.transportMode}</span>
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-900 whitespace-nowrap">
                      ${s.freightCost.toLocaleString()}
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono tabular-nums whitespace-nowrap">
                      {s.delayHours > 0 ? (
                        <span className="text-rose-600 font-medium">+{s.delayHours}h</span>
                      ) : (
                        <span className="text-slate-400">0h</span>
                      )}
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className={statusColor}>
                        {s.status}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <span className="inline-flex items-center text-slate-400 hover:text-slate-900">
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Toolbar */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-600">
          <div>
            Showing <span className="font-medium">{(page - 1) * pageSize + 1}</span> to{' '}
            <span className="font-medium">{Math.min(page * pageSize, filteredShipments.length)}</span> of{' '}
            <span className="font-medium">{filteredShipments.length}</span> shipments
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-2.5 py-1 border border-slate-200 rounded-md bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Previous
            </button>
            <span className="font-mono text-xs">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="px-2.5 py-1 border border-slate-200 rounded-md bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Modal Drawer: Shipment Lifecycle & Bottleneck Audit */}
      {selectedShipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-900 text-white rounded-lg">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 font-mono">
                    {selectedShipment.trackingNumber}
                  </h3>
                  <span className="text-xs text-slate-500">
                    Shipment ID: {selectedShipment.id} · {selectedShipment.transportMode}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedShipment(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto text-xs">
              {/* Delivery Status Banner */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 block text-[11px] mb-0.5">Delivery Status</span>
                  <span className={`text-sm font-bold ${
                    selectedShipment.status === 'On Time' 
                      ? 'text-emerald-700' 
                      : selectedShipment.status === 'Critical Delay' 
                        ? 'text-rose-600' 
                        : 'text-amber-700'
                  }`}>
                    {selectedShipment.status}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-slate-500 block text-[11px] mb-0.5">Recorded Delay Variance</span>
                  <span className="font-mono font-semibold text-slate-900">
                    {selectedShipment.delayHours > 0 ? `+${selectedShipment.delayHours} hours` : '0 hours (SLA Met)'}
                  </span>
                </div>
              </div>

              {/* Journey Milestones Timeline */}
              <div>
                <span className="text-xs font-semibold text-slate-900 uppercase tracking-wider block mb-3">
                  Shipment Lifecycle Audit Trail
                </span>

                <div className="space-y-4 pl-2 border-l-2 border-slate-200">
                  {/* Step 1: Order Placed */}
                  <div className="relative pl-4">
                    <span className="absolute -left-[17px] top-0.5 w-2.5 h-2.5 rounded-full bg-slate-900"></span>
                    <div className="flex justify-between items-baseline">
                      <span className="font-semibold text-slate-900">Purchase Order Released</span>
                      <span className="font-mono text-slate-500">{selectedShipment.orderDate}</span>
                    </div>
                    <p className="text-slate-500 mt-0.5">
                      Supplier: {SUPPLIERS.find(s => s.id === selectedShipment.supplierId)?.name || selectedShipment.supplierId}
                    </p>
                  </div>

                  {/* Step 2: Warehouse Dock Dispatch */}
                  <div className="relative pl-4">
                    <span className="absolute -left-[17px] top-0.5 w-2.5 h-2.5 rounded-full bg-slate-900"></span>
                    <div className="flex justify-between items-baseline">
                      <span className="font-semibold text-slate-900">Dock Staging &amp; Dispatch</span>
                      <span className="font-mono text-slate-500">{selectedShipment.dispatchDate}</span>
                    </div>
                    <p className="text-slate-500 mt-0.5">
                      Warehouse Hub: {selectedShipment.originCity} ({selectedShipment.originWarehouseId}) · Dock Handling: {selectedShipment.warehouseProcessingHours}h
                    </p>
                  </div>

                  {/* Step 3: In Transit & Customs */}
                  <div className="relative pl-4">
                    <span className={`absolute -left-[17px] top-0.5 w-2.5 h-2.5 rounded-full ${selectedShipment.delayHours > 0 ? 'bg-rose-500' : 'bg-slate-900'}`}></span>
                    <div className="flex justify-between items-baseline">
                      <span className="font-semibold text-slate-900">In-Transit Freight Movement</span>
                      <span className="font-mono text-slate-500">{selectedShipment.transitDays} days total transit</span>
                    </div>
                    <p className="text-slate-500 mt-0.5">
                      Carrier: {CARRIERS.find(c => c.id === selectedShipment.carrierId)?.name}
                    </p>
                    {selectedShipment.delayReason !== 'None' && (
                      <div className="mt-2 p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-800">
                        <span className="font-semibold block">Bottleneck Root Cause: {selectedShipment.delayReason}</span>
                        <p className="mt-0.5 text-[11px] text-rose-700">
                          Shipment incurred an unexpected +{selectedShipment.delayHours} hours delay due to congestion at logistics interchange.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Step 4: Arrival */}
                  <div className="relative pl-4">
                    <span className="absolute -left-[17px] top-0.5 w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                    <div className="flex justify-between items-baseline">
                      <span className="font-semibold text-slate-900">Final Consignee Arrival</span>
                      <span className="font-mono text-slate-500">
                        {selectedShipment.actualArrival || 'In Transit (Scheduled: ' + selectedShipment.scheduledArrival + ')'}
                      </span>
                    </div>
                    <p className="text-slate-500 mt-0.5">
                      Destination: {selectedShipment.destinationCity}, {selectedShipment.destinationCountry} ({selectedShipment.destinationRegion})
                    </p>
                  </div>
                </div>
              </div>

              {/* Economic & Cargo Breakdown */}
              <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700">
                <div>
                  <span className="text-slate-400 block text-[11px]">Freight Charge</span>
                  <span className="font-mono font-bold text-slate-900">${selectedShipment.freightCost.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Gross Weight</span>
                  <span className="font-mono font-bold text-slate-900">{selectedShipment.weightKg} kg</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Cargo Volume</span>
                  <span className="font-mono font-bold text-slate-900">{selectedShipment.units} Units</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-2 px-6 py-3 bg-slate-50 border-t border-slate-200">
              <button
                onClick={() => setSelectedShipment(null)}
                className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Close Audit View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
