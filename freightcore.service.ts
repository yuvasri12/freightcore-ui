import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  AssignLocationRequest,
  CreateShipmentRequest,
  DispatchRequest,
  Shipment,
  ShipmentMode,
  ShipmentStatus,
  WarehouseReceiveRequest
} from './freightcore.model';

@Injectable({ providedIn: 'root' })
export class FreightcoreService {
  private readonly apiBaseUrl = 'http://localhost:8080/api';

  constructor(private readonly http: HttpClient) {}

  listShipments(filters: { status?: ShipmentStatus | ''; mode?: ShipmentMode | ''; customerName?: string }): Observable<Shipment[]> {
    let params = new HttpParams();
    if (filters.status) {
      params = params.set('status', filters.status);
    }
    if (filters.mode) {
      params = params.set('mode', filters.mode);
    }
    if (filters.customerName?.trim()) {
      params = params.set('customerName', filters.customerName.trim());
    }
    return this.http.get<Shipment[]>(`${this.apiBaseUrl}/shipments`, { params });
  }

  createShipment(request: CreateShipmentRequest): Observable<Shipment> {
    return this.http.post<Shipment>(`${this.apiBaseUrl}/shipments`, request);
  }

  receiveFreight(request: WarehouseReceiveRequest): Observable<unknown> {
    return this.http.post(`${this.apiBaseUrl}/warehouse/receive`, request);
  }

  assignLocation(request: AssignLocationRequest): Observable<unknown> {
    return this.http.post(`${this.apiBaseUrl}/warehouse/assign-location`, request);
  }

  dispatchShipment(request: DispatchRequest): Observable<unknown> {
    return this.http.post(`${this.apiBaseUrl}/dispatch`, request);
  }
}
