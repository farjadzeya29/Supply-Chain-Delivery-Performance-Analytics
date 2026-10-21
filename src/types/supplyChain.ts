export type Region = 'North America' | 'EMEA' | 'APAC' | 'LATAM';

export type TransportMode = 'Air Freight' | 'Ocean Freight' | 'Road Transport' | 'Rail Express';

export type DeliveryStatus = 'On Time' | 'Delayed' | 'Critical Delay' | 'In Transit';

export type DelayReason = 
  | 'Customs Clearance Congestion'
  | 'Port / Terminal Backlog'
  | 'Warehouse Dispatch Delay'
  | 'Severe Weather Disruption'
  | 'Carrier Capacity Shortage'
  | 'Documentation / Invoice Error'
  | 'None';

export interface Supplier {
  id: string;
  name: string;
  country: string;
  region: Region;
  category: 'Raw Materials' | 'Electronics & Components' | 'Packaging' | 'Industrial Hardware' | 'Chemicals';
  tier: 'Tier 1' | 'Tier 2' | 'Tier 3';
  contractValue: number;
  onTimeRate: number; // percentage (e.g. 92.5)
  avgLeadTimeDays: number;
  defectRate: number; // percentage
  status: 'Preferred' | 'Active' | 'Under Review' | 'High Risk';
}

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  city: string;
  region: Region;
  capacityUtilization: number; // percentage
  avgDispatchHours: number;
  onTimeDispatchRate: number; // percentage
  activeBottleneck: string | null;
}

export interface Carrier {
  id: string;
  name: string;
  modes: TransportMode[];
  avgCostPerKg: number;
  reliabilityScore: number; // percentage
  claimsRate: number; // percentage
}

export interface Shipment {
  id: string;
  trackingNumber: string;
  orderDate: string;
  dispatchDate: string;
  scheduledArrival: string;
  actualArrival: string | null;
  originWarehouseId: string;
  originCity: string;
  destinationRegion: Region;
  destinationCountry: string;
  destinationCity: string;
  supplierId: string;
  carrierId: string;
  transportMode: TransportMode;
  freightCost: number;
  weightKg: number;
  units: number;
  status: DeliveryStatus;
  delayHours: number;
  delayReason: DelayReason;
  warehouseProcessingHours: number;
  transitDays: number;
  isBottleneckIncident: boolean;
}

export interface SlicerFilterState {
  dateRange: 'all' | 'q1' | 'q2' | 'q3' | 'q4';
  region: 'all' | Region;
  transportMode: 'all' | TransportMode;
  carrierId: 'all' | string;
  supplierId: 'all' | string;
  status: 'all' | DeliveryStatus;
  searchQuery: string;
}

export interface SQLPrebuiltQuery {
  id: string;
  title: string;
  description: string;
  sql: string;
  category: 'OTIF & Reliability' | 'Warehouse Bottlenecks' | 'Carrier & Regional Costs' | 'Supplier Scoring';
}

export interface PivotConfig {
  rowField: 'supplier' | 'originWarehouse' | 'destinationRegion' | 'carrier' | 'transportMode';
  columnField: 'transportMode' | 'destinationRegion' | 'status' | 'quarter';
  valueField: 'freightCost' | 'delayHours' | 'count' | 'onTimeRate' | 'weightKg';
  aggregation: 'sum' | 'avg' | 'count';
}
