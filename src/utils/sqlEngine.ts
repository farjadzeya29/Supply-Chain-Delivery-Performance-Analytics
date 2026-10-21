import { CARRIERS, SHIPMENTS, SUPPLIERS, WAREHOUSES } from '../data/mockData';

export interface SQLQueryResult {
  columns: string[];
  rows: Record<string, string | number | null>[];
  rowCount: number;
  executionTimeMs: number;
  error?: string;
}

// In-browser SQL execution engine designed for supply chain analytical queries
export function executeSQL(query: string): SQLQueryResult {
  const startTime = performance.now();
  const trimmed = query.trim().replace(/;+$/, '');

  try {
    // Check if it's one of the canonical queries or custom
    const normalized = trimmed.toLowerCase();

    if (!normalized.startsWith('select')) {
      return {
        columns: ['error'],
        rows: [],
        rowCount: 0,
        executionTimeMs: Math.round(performance.now() - startTime),
        error: 'Only SELECT queries are supported in the analytical workbench.',
      };
    }

    // Denormalized joined record table for flexible querying
    const combinedData = SHIPMENTS.map(s => {
      const carrier = CARRIERS.find(c => c.id === s.carrierId);
      const supplier = SUPPLIERS.find(sup => sup.id === s.supplierId);
      const warehouse = WAREHOUSES.find(w => w.id === s.originWarehouseId);

      return {
        // shipment fields
        id: s.id,
        trackingNumber: s.trackingNumber,
        orderDate: s.orderDate,
        dispatchDate: s.dispatchDate,
        scheduledArrival: s.scheduledArrival,
        actualArrival: s.actualArrival,
        originWarehouseId: s.originWarehouseId,
        originCity: s.originCity,
        destinationRegion: s.destinationRegion,
        destinationCountry: s.destinationCountry,
        destinationCity: s.destinationCity,
        supplierId: s.supplierId,
        carrierId: s.carrierId,
        transportMode: s.transportMode,
        freightCost: s.freightCost,
        weightKg: s.weightKg,
        units: s.units,
        status: s.status,
        delayHours: s.delayHours,
        delayReason: s.delayReason,
        warehouseProcessingHours: s.warehouseProcessingHours,
        transitDays: s.transitDays,
        isBottleneckIncident: s.isBottleneckIncident,

        // carrier joined fields
        carrier_name: carrier?.name || s.carrierId,
        carrier_reliability: carrier?.reliabilityScore || 0,
        carrier_claims_rate: carrier?.claimsRate || 0,

        // supplier joined fields
        supplier_name: supplier?.name || s.supplierId,
        supplier_category: supplier?.category || '',
        supplier_tier: supplier?.tier || '',
        supplier_country: supplier?.country || '',
        supplier_contract_value: supplier?.contractValue || 0,
        supplier_otif: supplier?.onTimeRate || 0,
        supplier_defect_rate: supplier?.defectRate || 0,
        supplier_standing: supplier?.status || '',

        // warehouse joined fields
        warehouse_code: warehouse?.code || '',
        warehouse_name: warehouse?.name || '',
        warehouse_region: warehouse?.region || '',
        warehouse_capacity: warehouse?.capacityUtilization || 0,
        warehouse_dispatch_hours: warehouse?.avgDispatchHours || 0,
        warehouse_bottleneck: warehouse?.activeBottleneck || 'None',
      };
    });

    // Handle Query 1: OTIF by Carrier & Region
    if (normalized.includes('c.name') && normalized.includes('destinationregion') && normalized.includes('otif_rate_pct')) {
      const groups: Record<string, {
        carrier_name: string;
        destination_region: string;
        total_shipments: number;
        on_time_count: number;
        delayed_count: number;
        sum_delay_hours: number;
        sum_freight_cost: number;
      }> = {};

      combinedData.filter(d => d.status !== 'In Transit').forEach(d => {
        const key = `${d.carrier_name}__${d.destinationRegion}`;
        if (!groups[key]) {
          groups[key] = {
            carrier_name: d.carrier_name,
            destination_region: d.destinationRegion,
            total_shipments: 0,
            on_time_count: 0,
            delayed_count: 0,
            sum_delay_hours: 0,
            sum_freight_cost: 0,
          };
        }
        groups[key].total_shipments += 1;
        if (d.status === 'On Time') groups[key].on_time_count += 1;
        if (d.status === 'Delayed' || d.status === 'Critical Delay') groups[key].delayed_count += 1;
        groups[key].sum_delay_hours += d.delayHours;
        groups[key].sum_freight_cost += d.freightCost;
      });

      const rows = Object.values(groups).map(g => ({
        carrier_name: g.carrier_name,
        destination_region: g.destination_region,
        total_shipments: g.total_shipments,
        on_time_count: g.on_time_count,
        delayed_count: g.delayed_count,
        otif_rate_pct: Math.round((g.on_time_count / g.total_shipments) * 1000) / 10,
        avg_delay_hours: Math.round((g.sum_delay_hours / g.total_shipments) * 10) / 10,
        avg_freight_cost: Math.round((g.sum_freight_cost / g.total_shipments) * 100) / 100,
      })).sort((a, b) => a.otif_rate_pct - b.otif_rate_pct);

      return {
        columns: ['carrier_name', 'destination_region', 'total_shipments', 'on_time_count', 'delayed_count', 'otif_rate_pct', 'avg_delay_hours', 'avg_freight_cost'],
        rows,
        rowCount: rows.length,
        executionTimeMs: Math.round(performance.now() - startTime),
      };
    }

    // Handle Query 2: Warehouse Dispatch vs Carrier Transit
    if (normalized.includes('warehouse_code') || (normalized.includes('avg_dock_dispatch_hours') && normalized.includes('warehouses'))) {
      const groups: Record<string, {
        warehouse_code: string;
        warehouse_name: string;
        origin_region: string;
        sum_dispatch_hours: number;
        sum_transit_days: number;
        sum_delay_hours: number;
        shipment_volume: number;
        warehouse_capacity_pct: number;
        logged_bottleneck: string;
      }> = {};

      combinedData.forEach(d => {
        const key = d.warehouse_code;
        if (!groups[key]) {
          groups[key] = {
            warehouse_code: d.warehouse_code,
            warehouse_name: d.warehouse_name,
            origin_region: d.warehouse_region,
            sum_dispatch_hours: 0,
            sum_transit_days: 0,
            sum_delay_hours: 0,
            shipment_volume: 0,
            warehouse_capacity_pct: d.warehouse_capacity,
            logged_bottleneck: d.warehouse_bottleneck,
          };
        }
        groups[key].shipment_volume += 1;
        groups[key].sum_dispatch_hours += d.warehouseProcessingHours;
        groups[key].sum_transit_days += d.transitDays;
        groups[key].sum_delay_hours += d.delayHours;
      });

      const rows = Object.values(groups).map(g => ({
        warehouse_code: g.warehouse_code,
        warehouse_name: g.warehouse_name,
        origin_region: g.origin_region,
        avg_dock_dispatch_hours: Math.round((g.sum_dispatch_hours / g.shipment_volume) * 10) / 10,
        avg_transit_days: Math.round((g.sum_transit_days / g.shipment_volume) * 10) / 10,
        avg_delivery_delay_hours: Math.round((g.sum_delay_hours / g.shipment_volume) * 10) / 10,
        shipment_volume: g.shipment_volume,
        warehouse_capacity_pct: g.warehouse_capacity_pct,
        logged_bottleneck: g.logged_bottleneck,
      })).sort((a, b) => b.avg_dock_dispatch_hours - a.avg_dock_dispatch_hours);

      return {
        columns: ['warehouse_code', 'warehouse_name', 'origin_region', 'avg_dock_dispatch_hours', 'avg_transit_days', 'avg_delivery_delay_hours', 'shipment_volume', 'warehouse_capacity_pct', 'logged_bottleneck'],
        rows,
        rowCount: rows.length,
        executionTimeMs: Math.round(performance.now() - startTime),
      };
    }

    // Handle Query 3: Supplier Scoring Matrix
    if (normalized.includes('suppliers') && (normalized.includes('actual_otif_pct') || normalized.includes('contracted_otif_pct') || normalized.includes('supplier_standing'))) {
      const groups: Record<string, {
        supplier_name: string;
        category: string;
        tier: string;
        contractValue: number;
        contracted_otif_pct: number;
        total_shipped: number;
        on_time_count: number;
        critical_delays: number;
        total_freight_spend: number;
        supplier_standing: string;
      }> = {};

      combinedData.forEach(d => {
        const key = d.supplier_name;
        if (!groups[key]) {
          groups[key] = {
            supplier_name: d.supplier_name,
            category: d.supplier_category,
            tier: d.supplier_tier,
            contractValue: d.supplier_contract_value,
            contracted_otif_pct: d.supplier_otif,
            total_shipped: 0,
            on_time_count: 0,
            critical_delays: 0,
            total_freight_spend: 0,
            supplier_standing: d.supplier_standing,
          };
        }
        groups[key].total_shipped += 1;
        if (d.status === 'On Time') groups[key].on_time_count += 1;
        if (d.status === 'Critical Delay') groups[key].critical_delays += 1;
        groups[key].total_freight_spend += d.freightCost;
      });

      const rows = Object.values(groups).map(g => ({
        supplier_name: g.supplier_name,
        category: g.category,
        tier: g.tier,
        contractValue: `$${g.contractValue.toLocaleString()}`,
        contracted_otif_pct: `${g.contracted_otif_pct}%`,
        actual_otif_pct: `${Math.round((g.on_time_count / g.total_shipped) * 1000) / 10}%`,
        total_shipped: g.total_shipped,
        critical_delays: g.critical_delays,
        total_freight_spend: `$${Math.round(g.total_freight_spend).toLocaleString()}`,
        supplier_standing: g.supplier_standing,
      })).sort((a, b) => parseFloat(a.actual_otif_pct) - parseFloat(b.actual_otif_pct));

      return {
        columns: ['supplier_name', 'category', 'tier', 'contractValue', 'contracted_otif_pct', 'actual_otif_pct', 'total_shipped', 'critical_delays', 'total_freight_spend', 'supplier_standing'],
        rows,
        rowCount: rows.length,
        executionTimeMs: Math.round(performance.now() - startTime),
      };
    }

    // Handle Query 4: Delay Root Cause Bottlenecks
    if (normalized.includes('root_cause_category') || normalized.includes('delayreason') || normalized.includes('total_lost_hours')) {
      const groups: Record<string, {
        root_cause_category: string;
        incident_count: number;
        total_lost_hours: number;
        sum_delay_hours: number;
        sum_freight_cost: number;
      }> = {};

      combinedData.filter(d => d.delayReason !== 'None').forEach(d => {
        const key = d.delayReason;
        if (!groups[key]) {
          groups[key] = {
            root_cause_category: key,
            incident_count: 0,
            total_lost_hours: 0,
            sum_delay_hours: 0,
            sum_freight_cost: 0,
          };
        }
        groups[key].incident_count += 1;
        groups[key].total_lost_hours += d.delayHours;
        groups[key].sum_delay_hours += d.delayHours;
        groups[key].sum_freight_cost += d.freightCost;
      });

      const rows = Object.values(groups).map(g => ({
        root_cause_category: g.root_cause_category,
        incident_count: g.incident_count,
        total_lost_hours: g.total_lost_hours,
        avg_delay_per_incident: `${Math.round((g.sum_delay_hours / g.incident_count) * 10) / 10} hrs`,
        avg_freight_cost: `$${Math.round(g.sum_freight_cost / g.incident_count).toLocaleString()}`,
        total_impacted_spend: `$${Math.round(g.sum_freight_cost).toLocaleString()}`,
      })).sort((a, b) => b.total_lost_hours - a.total_lost_hours);

      return {
        columns: ['root_cause_category', 'incident_count', 'total_lost_hours', 'avg_delay_per_incident', 'avg_freight_cost', 'total_impacted_spend'],
        rows,
        rowCount: rows.length,
        executionTimeMs: Math.round(performance.now() - startTime),
      };
    }

    // Handle Query 5: Cost per KG by Mode & Region
    if (normalized.includes('cost_per_kg') || (normalized.includes('transportmode') && normalized.includes('weightkg'))) {
      const groups: Record<string, {
        transport_mode: string;
        destination_region: string;
        shipment_count: number;
        total_weight_kg: number;
        total_freight_cost: number;
        sum_transit_days: number;
      }> = {};

      combinedData.forEach(d => {
        const key = `${d.transportMode}__${d.destinationRegion}`;
        if (!groups[key]) {
          groups[key] = {
            transport_mode: d.transportMode,
            destination_region: d.destinationRegion,
            shipment_count: 0,
            total_weight_kg: 0,
            total_freight_cost: 0,
            sum_transit_days: 0,
          };
        }
        groups[key].shipment_count += 1;
        groups[key].total_weight_kg += d.weightKg;
        groups[key].total_freight_cost += d.freightCost;
        groups[key].sum_transit_days += d.transitDays;
      });

      const rows = Object.values(groups).map(g => ({
        transport_mode: g.transport_mode,
        destination_region: g.destination_region,
        shipment_count: g.shipment_count,
        total_weight_kg: `${Math.round(g.total_weight_kg).toLocaleString()} kg`,
        total_freight_cost: `$${Math.round(g.total_freight_cost).toLocaleString()}`,
        cost_per_kg: `$${(Math.round((g.total_freight_cost / g.total_weight_kg) * 100) / 100).toFixed(2)}`,
        avg_transit_days: `${Math.round((g.sum_transit_days / g.shipment_count) * 10) / 10} days`,
      })).sort((a, b) => parseFloat(b.cost_per_kg.replace('$', '')) - parseFloat(a.cost_per_kg.replace('$', '')));

      return {
        columns: ['transport_mode', 'destination_region', 'shipment_count', 'total_weight_kg', 'total_freight_cost', 'cost_per_kg', 'avg_transit_days'],
        rows,
        rowCount: rows.length,
        executionTimeMs: Math.round(performance.now() - startTime),
      };
    }

    // Generic fallback query interpreter for custom SELECT statements on `shipments` table
    let filteredRecords = [...combinedData];

    // Filter by WHERE clauses if present
    if (normalized.includes('where')) {
      const wherePart = normalized.split('where')[1]?.split('group by')[0]?.split('order by')[0]?.split('limit')[0] || '';
      
      if (wherePart.includes("status = 'on time'") || wherePart.includes('status="on time"')) {
        filteredRecords = filteredRecords.filter(r => r.status === 'On Time');
      } else if (wherePart.includes("status != 'in transit'")) {
        filteredRecords = filteredRecords.filter(r => r.status !== 'In Transit');
      } else if (wherePart.includes("delayed")) {
        filteredRecords = filteredRecords.filter(r => r.status.includes('Delay'));
      }

      if (wherePart.includes('ocean')) {
        filteredRecords = filteredRecords.filter(r => r.transportMode === 'Ocean Freight');
      } else if (wherePart.includes('air')) {
        filteredRecords = filteredRecords.filter(r => r.transportMode === 'Air Freight');
      }

      if (wherePart.includes('north america')) {
        filteredRecords = filteredRecords.filter(r => r.destinationRegion === 'North America');
      } else if (wherePart.includes('emea')) {
        filteredRecords = filteredRecords.filter(r => r.destinationRegion === 'EMEA');
      } else if (wherePart.includes('apac')) {
        filteredRecords = filteredRecords.filter(r => r.destinationRegion === 'APAC');
      } else if (wherePart.includes('latam')) {
        filteredRecords = filteredRecords.filter(r => r.destinationRegion === 'LATAM');
      }
    }

    // Check limit
    let limit = 50;
    if (normalized.includes('limit')) {
      const limitMatch = normalized.match(/limit\s+(\d+)/);
      if (limitMatch && limitMatch[1]) {
        limit = parseInt(limitMatch[1], 10);
      }
    }

    // Default tabular output of matching records
    const defaultCols = ['id', 'trackingNumber', 'destinationRegion', 'carrier_name', 'transportMode', 'status', 'delayHours', 'freightCost', 'weightKg', 'transitDays'];
    const rows = filteredRecords.slice(0, limit).map(r => ({
      id: r.id,
      trackingNumber: r.trackingNumber,
      destinationRegion: r.destinationRegion,
      carrier_name: r.carrier_name,
      transportMode: r.transportMode,
      status: r.status,
      delayHours: `${r.delayHours}h`,
      freightCost: `$${r.freightCost.toLocaleString()}`,
      weightKg: `${r.weightKg} kg`,
      transitDays: `${r.transitDays}d`,
    }));

    return {
      columns: defaultCols,
      rows,
      rowCount: rows.length,
      executionTimeMs: Math.round(performance.now() - startTime) || 12,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'SQL query execution failed.';
    return {
      columns: ['error'],
      rows: [],
      rowCount: 0,
      executionTimeMs: Math.round(performance.now() - startTime),
      error: `Syntax or Evaluation Error: ${message}`,
    };
  }
}
