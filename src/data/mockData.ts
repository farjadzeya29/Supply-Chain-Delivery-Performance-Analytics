import { Carrier, DelayReason, DeliveryStatus, Region, Shipment, Supplier, TransportMode, Warehouse } from '../types/supplyChain';

export const SUPPLIERS: Supplier[] = [
  {
    id: 'SUP-001',
    name: 'Apex Microelectronics',
    country: 'Taiwan',
    region: 'APAC',
    category: 'Electronics & Components',
    tier: 'Tier 1',
    contractValue: 1420000,
    onTimeRate: 94.2,
    avgLeadTimeDays: 14.5,
    defectRate: 0.8,
    status: 'Preferred',
  },
  {
    id: 'SUP-002',
    name: 'Vanguard Steel & Alloy',
    country: 'United States',
    region: 'North America',
    category: 'Raw Materials',
    tier: 'Tier 1',
    contractValue: 2150000,
    onTimeRate: 96.1,
    avgLeadTimeDays: 8.2,
    defectRate: 1.1,
    status: 'Preferred',
  },
  {
    id: 'SUP-003',
    name: 'Bavaria Auto Components',
    country: 'Germany',
    region: 'EMEA',
    category: 'Industrial Hardware',
    tier: 'Tier 1',
    contractValue: 1890000,
    onTimeRate: 91.8,
    avgLeadTimeDays: 16.0,
    defectRate: 0.9,
    status: 'Active',
  },
  {
    id: 'SUP-004',
    name: 'Shenzhen Module Works',
    country: 'China',
    region: 'APAC',
    category: 'Electronics & Components',
    tier: 'Tier 2',
    contractValue: 980000,
    onTimeRate: 81.4,
    avgLeadTimeDays: 22.4,
    defectRate: 3.4,
    status: 'High Risk',
  },
  {
    id: 'SUP-005',
    name: 'Atlas Industrial Packaging',
    country: 'Mexico',
    region: 'LATAM',
    category: 'Packaging',
    tier: 'Tier 2',
    contractValue: 620000,
    onTimeRate: 88.6,
    avgLeadTimeDays: 9.5,
    defectRate: 1.8,
    status: 'Active',
  },
  {
    id: 'SUP-006',
    name: 'Nordic Chemical Group',
    country: 'Sweden',
    region: 'EMEA',
    category: 'Chemicals',
    tier: 'Tier 1',
    contractValue: 1150000,
    onTimeRate: 95.3,
    avgLeadTimeDays: 11.2,
    defectRate: 0.4,
    status: 'Preferred',
  },
  {
    id: 'SUP-007',
    name: 'Sao Paulo Heavy Tooling',
    country: 'Brazil',
    region: 'LATAM',
    category: 'Industrial Hardware',
    tier: 'Tier 2',
    contractValue: 740000,
    onTimeRate: 79.5,
    avgLeadTimeDays: 24.1,
    defectRate: 4.1,
    status: 'Under Review',
  },
  {
    id: 'SUP-008',
    name: 'Kyoto Optoelectronics',
    country: 'Japan',
    region: 'APAC',
    category: 'Electronics & Components',
    tier: 'Tier 1',
    contractValue: 1650000,
    onTimeRate: 97.4,
    avgLeadTimeDays: 13.0,
    defectRate: 0.3,
    status: 'Preferred',
  },
  {
    id: 'SUP-009',
    name: 'Lyon Polymer Solutions',
    country: 'France',
    region: 'EMEA',
    category: 'Chemicals',
    tier: 'Tier 2',
    contractValue: 830000,
    onTimeRate: 87.2,
    avgLeadTimeDays: 15.8,
    defectRate: 2.1,
    status: 'Active',
  },
  {
    id: 'SUP-010',
    name: 'Ontario Heavy Assembly',
    country: 'Canada',
    region: 'North America',
    category: 'Industrial Hardware',
    tier: 'Tier 2',
    contractValue: 910000,
    onTimeRate: 93.0,
    avgLeadTimeDays: 7.5,
    defectRate: 1.2,
    status: 'Active',
  },
  {
    id: 'SUP-011',
    name: 'Pacific Rim Fasteners',
    country: 'Vietnam',
    region: 'APAC',
    category: 'Raw Materials',
    tier: 'Tier 3',
    contractValue: 490000,
    onTimeRate: 76.8,
    avgLeadTimeDays: 28.5,
    defectRate: 4.8,
    status: 'High Risk',
  },
  {
    id: 'SUP-012',
    name: 'Zenith Metalworks',
    country: 'United Kingdom',
    region: 'EMEA',
    category: 'Raw Materials',
    tier: 'Tier 2',
    contractValue: 880000,
    onTimeRate: 83.7,
    avgLeadTimeDays: 19.2,
    defectRate: 2.9,
    status: 'Under Review',
  },
];

export const WAREHOUSES: Warehouse[] = [
  {
    id: 'WH-ORD',
    name: 'Chicago Central Distribution',
    code: 'ORD-01',
    city: 'Chicago, IL',
    region: 'North America',
    capacityUtilization: 92.4,
    avgDispatchHours: 31.5,
    onTimeDispatchRate: 84.1,
    activeBottleneck: 'Pick & Pack Labor Bottleneck (Q3 backlog)',
  },
  {
    id: 'WH-RTM',
    name: 'Rotterdam Europort Gateway',
    code: 'RTM-04',
    city: 'Rotterdam',
    region: 'EMEA',
    capacityUtilization: 88.0,
    avgDispatchHours: 26.2,
    onTimeDispatchRate: 89.5,
    activeBottleneck: 'EU Customs Regulatory Document Verification',
  },
  {
    id: 'WH-SIN',
    name: 'Singapore Changi Air Logistics',
    code: 'SIN-02',
    city: 'Singapore',
    region: 'APAC',
    capacityUtilization: 79.5,
    avgDispatchHours: 18.4,
    onTimeDispatchRate: 96.8,
    activeBottleneck: null,
  },
  {
    id: 'WH-DFW',
    name: 'Dallas-Fort Worth Intermodal Hub',
    code: 'DFW-03',
    city: 'Dallas, TX',
    region: 'North America',
    capacityUtilization: 74.2,
    avgDispatchHours: 21.0,
    onTimeDispatchRate: 94.7,
    activeBottleneck: null,
  },
  {
    id: 'WH-FRA',
    name: 'Frankfurt Central Air Cargo',
    code: 'FRA-01',
    city: 'Frankfurt',
    region: 'EMEA',
    capacityUtilization: 83.6,
    avgDispatchHours: 23.8,
    onTimeDispatchRate: 93.2,
    activeBottleneck: null,
  },
  {
    id: 'WH-PVG',
    name: 'Shanghai Pudong Global Terminal',
    code: 'PVG-06',
    city: 'Shanghai',
    region: 'APAC',
    capacityUtilization: 94.1,
    avgDispatchHours: 29.8,
    onTimeDispatchRate: 86.4,
    activeBottleneck: 'Export Inspection Quarantine Queuing',
  },
  {
    id: 'WH-GRU',
    name: 'Sao Paulo Aeroporto Logistics',
    code: 'GRU-02',
    city: 'Sao Paulo',
    region: 'LATAM',
    capacityUtilization: 86.7,
    avgDispatchHours: 34.1,
    onTimeDispatchRate: 81.2,
    activeBottleneck: 'Import Clearance & Federal Tariff Audits',
  },
  {
    id: 'WH-LAX',
    name: 'Long Beach Ocean Marine Terminal',
    code: 'LAX-05',
    city: 'Long Beach, CA',
    region: 'North America',
    capacityUtilization: 96.8,
    avgDispatchHours: 38.6,
    onTimeDispatchRate: 77.9,
    activeBottleneck: 'Container Chassis Shortage & Port Congestion',
  },
];

export const CARRIERS: Carrier[] = [
  {
    id: 'CAR-01',
    name: 'Maersk Line Intermodal',
    modes: ['Ocean Freight', 'Rail Express'],
    avgCostPerKg: 1.45,
    reliabilityScore: 89.2,
    claimsRate: 0.6,
  },
  {
    id: 'CAR-02',
    name: 'DHL Global Forwarding',
    modes: ['Air Freight', 'Road Transport'],
    avgCostPerKg: 6.80,
    reliabilityScore: 95.8,
    claimsRate: 0.2,
  },
  {
    id: 'CAR-03',
    name: 'FedEx Express Cargo',
    modes: ['Air Freight', 'Road Transport'],
    avgCostPerKg: 7.20,
    reliabilityScore: 96.4,
    claimsRate: 0.3,
  },
  {
    id: 'CAR-04',
    name: 'Kuehne + Nagel Logistics',
    modes: ['Ocean Freight', 'Air Freight', 'Road Transport'],
    avgCostPerKg: 3.10,
    reliabilityScore: 92.1,
    claimsRate: 0.5,
  },
  {
    id: 'CAR-05',
    name: 'DB Schenker Logistics',
    modes: ['Rail Express', 'Road Transport', 'Ocean Freight'],
    avgCostPerKg: 2.85,
    reliabilityScore: 90.4,
    claimsRate: 0.7,
  },
  {
    id: 'CAR-06',
    name: 'C.H. Robinson Worldwide',
    modes: ['Road Transport', 'Rail Express'],
    avgCostPerKg: 2.20,
    reliabilityScore: 88.0,
    claimsRate: 1.1,
  },
  {
    id: 'CAR-07',
    name: 'Hapag-Lloyd Ocean',
    modes: ['Ocean Freight'],
    avgCostPerKg: 1.35,
    reliabilityScore: 86.5,
    claimsRate: 0.9,
  },
];

// Deterministic generator to build 640 realistic shipments with coherent supply chain patterns
function generateShipments(): Shipment[] {
  const shipments: Shipment[] = [];
  
  const regions: Region[] = ['North America', 'EMEA', 'APAC', 'LATAM'];
  const destCities: Record<Region, string[]> = {
    'North America': ['New York, USA', 'Toronto, Canada', 'Atlanta, USA', 'Dallas, USA', 'Seattle, USA', 'Chicago, USA'],
    'EMEA': ['London, UK', 'Amsterdam, Netherlands', 'Munich, Germany', 'Paris, France', 'Milan, Italy', 'Warsaw, Poland'],
    'APAC': ['Tokyo, Japan', 'Singapore', 'Sydney, Australia', 'Seoul, South Korea', 'Shanghai, China', 'Bangkok, Thailand'],
    'LATAM': ['Mexico City, Mexico', 'Bogota, Colombia', 'Buenos Aires, Argentina', 'Santiago, Chile', 'Lima, Peru', 'Sao Paulo, Brazil'],
  };

  const delayReasonsList: DelayReason[] = [
    'Customs Clearance Congestion',
    'Port / Terminal Backlog',
    'Warehouse Dispatch Delay',
    'Severe Weather Disruption',
    'Carrier Capacity Shortage',
    'Documentation / Invoice Error',
  ];

  // Seeded random helper for reproducible realistic supply chain figures
  let seed = 42;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  // Generate 640 records across Q1-Q4
  for (let i = 1; i <= 640; i++) {
    const id = `SHP-${10000 + i}`;
    const trackingNumber = `TRK-2026-${(i * 137).toString().padStart(6, '0')}`;
    
    // Distribute across year
    const month = (i % 12) + 1;
    const day = (i % 28) + 1;
    const orderDate = `2026-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    
    const supplierIndex = i % SUPPLIERS.length;
    const supplier = SUPPLIERS[supplierIndex];
    
    const warehouseIndex = (i * 3) % WAREHOUSES.length;
    const warehouse = WAREHOUSES[warehouseIndex];
    
    const region = regions[(i + warehouseIndex) % regions.length];
    const cityList = destCities[region];
    const destinationCity = cityList[i % cityList.length];
    const destinationCountry = destinationCity.split(', ')[1] || region;
    
    // Choose mode based on distance and warehouse
    let mode: TransportMode = 'Road Transport';
    if (warehouse.region !== region) {
      mode = rand() > 0.4 ? 'Ocean Freight' : 'Air Freight';
    } else {
      const modeRoll = rand();
      if (modeRoll < 0.5) mode = 'Road Transport';
      else if (modeRoll < 0.8) mode = 'Rail Express';
      else mode = 'Air Freight';
    }

    // Pick compatible carrier
    const compatibleCarriers = CARRIERS.filter(c => c.modes.includes(mode));
    const carrier = compatibleCarriers[i % compatibleCarriers.length] || CARRIERS[0];

    // Weight and cost calculation
    const baseWeight = mode === 'Ocean Freight' ? 800 + Math.floor(rand() * 4200) : 
                       mode === 'Air Freight' ? 50 + Math.floor(rand() * 450) : 
                       200 + Math.floor(rand() * 1800);
    
    const weightKg = baseWeight;
    const units = Math.floor(weightKg / (5 + (i % 15)));
    
    // Transit duration
    const baselineTransit = mode === 'Air Freight' ? 2 + Math.floor(rand() * 3) :
                            mode === 'Road Transport' ? 3 + Math.floor(rand() * 4) :
                            mode === 'Rail Express' ? 5 + Math.floor(rand() * 5) :
                            18 + Math.floor(rand() * 16);

    const whProcessingHours = Math.round((warehouse.avgDispatchHours + (rand() * 16 - 8)) * 10) / 10;
    
    // Probability of delay depends on warehouse bottleneck + supplier reliability + region
    const supplierDelayRisk = (100 - supplier.onTimeRate) / 100;
    const warehouseRisk = warehouse.activeBottleneck ? 0.28 : 0.08;
    const regionRisk = (region === 'LATAM' || region === 'EMEA') ? 0.12 : 0.06;
    
    const totalDelayChance = (supplierDelayRisk * 0.45) + (warehouseRisk * 0.35) + (regionRisk * 0.20);
    const isDelayed = rand() < totalDelayChance;
    
    let status: DeliveryStatus = 'On Time';
    let delayHours = 0;
    let delayReason: DelayReason = 'None';
    let isBottleneck = false;

    if (isDelayed) {
      isBottleneck = true;
      const severityRoll = rand();
      if (severityRoll > 0.82) {
        status = 'Critical Delay';
        delayHours = 72 + Math.floor(rand() * 96); // 3-7 days
      } else {
        status = 'Delayed';
        delayHours = 14 + Math.floor(rand() * 48); // 1-2.5 days
      }

      // Assign realistic delay reason according to location and characteristics
      if (warehouse.activeBottleneck && rand() < 0.5) {
        delayReason = warehouse.activeBottleneck.includes('Customs') 
          ? 'Customs Clearance Congestion'
          : warehouse.activeBottleneck.includes('Pick & Pack') 
            ? 'Warehouse Dispatch Delay'
            : 'Port / Terminal Backlog';
      } else {
        delayReason = delayReasonsList[i % delayReasonsList.length];
      }
    }

    const actualTransit = baselineTransit + Math.ceil(delayHours / 24);
    
    // Cost formula with realistic expediting surcharges if delayed
    const baseCostPerKg = carrier.avgCostPerKg * (1 + (rand() * 0.3 - 0.15));
    let freightCost = Math.round((weightKg * baseCostPerKg) + (mode === 'Air Freight' ? 280 : 90));
    if (status === 'Critical Delay') {
      freightCost += Math.round(freightCost * 0.18); // demurrage, rerouting, customs hold fee
    }

    // Calculate dates
    const dispatchDay = day + Math.floor(whProcessingHours / 24) + 1;
    const dispatchDate = `2026-${month.toString().padStart(2, '0')}-${Math.min(dispatchDay, 28).toString().padStart(2, '0')}`;
    
    const schedArrDay = Math.min(dispatchDay + baselineTransit, 28);
    const scheduledArrival = `2026-${month.toString().padStart(2, '0')}-${schedArrDay.toString().padStart(2, '0')}`;

    let actualArrival: string | null = null;
    if (month <= 10) {
      const actArrDay = Math.min(dispatchDay + actualTransit, 28);
      actualArrival = `2026-${month.toString().padStart(2, '0')}-${actArrDay.toString().padStart(2, '0')}`;
    } else {
      // Future shipments in transit
      status = 'In Transit';
    }

    shipments.push({
      id,
      trackingNumber,
      orderDate,
      dispatchDate,
      scheduledArrival,
      actualArrival,
      originWarehouseId: warehouse.id,
      originCity: warehouse.city,
      destinationRegion: region,
      destinationCountry,
      destinationCity,
      supplierId: supplier.id,
      carrierId: carrier.id,
      transportMode: mode,
      freightCost,
      weightKg,
      units,
      status,
      delayHours,
      delayReason,
      warehouseProcessingHours: whProcessingHours,
      transitDays: actualTransit,
      isBottleneckIncident: isBottleneck,
    });
  }

  return shipments;
}

export const SHIPMENTS: Shipment[] = generateShipments();

// Standard pre-built analyst SQL queries matching supply chain case study
export const PREBUILT_SQL_QUERIES: import('../types/supplyChain').SQLPrebuiltQuery[] = [
  {
    id: 'query-otif-carrier-region',
    title: 'OTIF % & Delay Frequency by Carrier & Destination Region',
    category: 'OTIF & Reliability',
    description: 'Calculates On-Time In-Full delivery rate, total shipments, delayed shipments count, and average delay hours grouped by carrier and destination region to expose regional delivery bottlenecks.',
    sql: `SELECT 
    c.name AS carrier_name,
    s.destinationRegion AS destination_region,
    COUNT(s.id) AS total_shipments,
    SUM(CASE WHEN s.status = 'On Time' THEN 1 ELSE 0 END) AS on_time_count,
    SUM(CASE WHEN s.status IN ('Delayed', 'Critical Delay') THEN 1 ELSE 0 END) AS delayed_count,
    ROUND((SUM(CASE WHEN s.status = 'On Time' THEN 1.0 ELSE 0.0 END) / COUNT(s.id)) * 100, 1) AS otif_rate_pct,
    ROUND(AVG(s.delayHours), 1) AS avg_delay_hours,
    ROUND(AVG(s.freightCost), 2) AS avg_freight_cost
FROM shipments s
JOIN carriers c ON s.carrierId = c.id
WHERE s.status != 'In Transit'
GROUP BY c.name, s.destinationRegion
ORDER BY otif_rate_pct ASC;`,
  },
  {
    id: 'query-wh-dispatch-transit',
    title: 'Warehouse Dispatch Processing Lag vs Carrier In-Transit Delay',
    category: 'Warehouse Bottlenecks',
    description: 'Compares internal warehouse processing and dock dispatch hours against external carrier in-transit delay to isolate whether bottlenecks originate at warehouse fulfillment or during transportation.',
    sql: `SELECT 
    w.code AS warehouse_code,
    w.name AS warehouse_name,
    w.region AS origin_region,
    ROUND(AVG(s.warehouseProcessingHours), 1) AS avg_dock_dispatch_hours,
    ROUND(AVG(s.transitDays), 1) AS avg_transit_days,
    ROUND(AVG(s.delayHours), 1) AS avg_delivery_delay_hours,
    COUNT(s.id) AS shipment_volume,
    w.capacityUtilization AS warehouse_capacity_pct,
    w.activeBottleneck AS logged_bottleneck
FROM shipments s
JOIN warehouses w ON s.originWarehouseId = w.id
GROUP BY w.code, w.name, w.region, w.capacityUtilization, w.activeBottleneck
ORDER BY avg_dock_dispatch_hours DESC;`,
  },
  {
    id: 'query-supplier-risk-cost',
    title: 'Supplier Delivery Reliability & Delay Risk Scoring Matrix',
    category: 'Supplier Scoring',
    description: 'Evaluates supplier contract value against delivery on-time performance, defect rate, and incident frequency to inform quarterly supplier reviews and contractual penalty enforcement.',
    sql: `SELECT 
    sup.name AS supplier_name,
    sup.category,
    sup.tier,
    sup.contractValue,
    sup.onTimeRate AS contracted_otif_pct,
    ROUND((SUM(CASE WHEN s.status = 'On Time' THEN 1.0 ELSE 0.0 END) / COUNT(s.id)) * 100, 1) AS actual_otif_pct,
    COUNT(s.id) AS total_shipped,
    SUM(CASE WHEN s.status = 'Critical Delay' THEN 1 ELSE 0 END) AS critical_delays,
    ROUND(SUM(s.freightCost), 2) AS total_freight_spend,
    sup.status AS supplier_standing
FROM shipments s
JOIN suppliers sup ON s.supplierId = sup.id
GROUP BY sup.name, sup.category, sup.tier, sup.contractValue, sup.onTimeRate, sup.status
ORDER BY actual_otif_pct ASC;`,
  },
  {
    id: 'query-bottleneck-root-cause',
    title: 'Delay Root-Cause Incident Frequency & Total Delay Impact Hours',
    category: 'Warehouse Bottlenecks',
    description: 'Aggregates delay incident logs by root cause category (Customs, Port Backlog, Warehouse, Weather, Capacity) to pinpoint systemic failure points across the global logistics chain.',
    sql: `SELECT 
    delayReason AS root_cause_category,
    COUNT(id) AS incident_count,
    ROUND(SUM(delayHours), 0) AS total_lost_hours,
    ROUND(AVG(delayHours), 1) AS avg_delay_per_incident,
    ROUND(AVG(freightCost), 2) AS avg_freight_cost,
    ROUND(SUM(freightCost), 2) AS total_impacted_spend
FROM shipments
WHERE delayReason != 'None'
GROUP BY delayReason
ORDER BY total_lost_hours DESC;`,
  },
  {
    id: 'query-cost-per-kg-mode-region',
    title: 'Shipping Cost per KG & Weight Efficiency by Mode & Region',
    category: 'Carrier & Regional Costs',
    description: 'Analyzes freight spend efficiency ($/KG) across Transport Modes and Destination Regions to determine potential savings from mode shifting (Air to Intermodal / Sea-Air).',
    sql: `SELECT 
    s.transportMode AS transport_mode,
    s.destinationRegion AS destination_region,
    COUNT(s.id) AS shipment_count,
    ROUND(SUM(s.weightKg), 0) AS total_weight_kg,
    ROUND(SUM(s.freightCost), 2) AS total_freight_cost,
    ROUND(SUM(s.freightCost) / SUM(s.weightKg), 2) AS cost_per_kg,
    ROUND(AVG(s.transitDays), 1) AS avg_transit_days
FROM shipments s
GROUP BY s.transportMode, s.destinationRegion
ORDER BY cost_per_kg DESC;`,
  },
];
