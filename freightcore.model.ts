export type ShipmentMode = 'AIR' | 'GROUND' | 'OCEAN' | 'FREIGHT';
export type ShipmentStatus = 'NEW' | 'RECEIVED' | 'IN_WAREHOUSE' | 'LOADED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';

export interface StatusHistory {
  id: number;
  status: ShipmentStatus;
  remarks: string;
  updatedBy: string;
  updatedAt: string;
}

export interface Shipment {
  id: number;
  trackingNumber: string;
  customerName: string;
  origin: string;
  destination: string;
  mode: ShipmentMode;
  weight: number;
  status: ShipmentStatus;
  createdAt: string;
  updatedAt: string;
  timeline: StatusHistory[];
}

export interface CreateShipmentRequest {
  customerName: string;
  origin: string;
  destination: string;
  mode: ShipmentMode;
  weight: number;
}

export interface WarehouseReceiveRequest {
  shipmentId: number;
  condition: 'GOOD' | 'DAMAGED' | 'WEIGHT_MISMATCH' | 'MISSING_ITEMS';
  weightChecked: number;
  receivedBy: string;
}

export interface AssignLocationRequest {
  shipmentId: number;
  zone: string;
  rack: string;
  bin: string;
  assignedBy: string;
}

export interface DispatchRequest {
  shipmentId: number;
  vehicleNumber: string;
  destination: string;
  dispatchedBy: string;
}
