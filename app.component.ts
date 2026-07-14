import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { FreightcoreService } from './freightcore.service';
import { CreateShipmentRequest, Shipment, ShipmentMode, ShipmentStatus } from './freightcore.model';

type ToastType = 'success' | 'error' | 'info';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  shipments: Shipment[] = [];
  selectedShipment: Shipment | null = null;
  loading = false;
  tableLoading = false;
  toast: { type: ToastType; message: string } | null = null;

  statusFilter: ShipmentStatus | '' = '';
  modeFilter: ShipmentMode | '' = '';
  searchText = '';

  createForm: CreateShipmentRequest = {
    customerName: 'Northstar Retail',
    origin: 'Chennai',
    destination: 'Seattle',
    mode: 'FREIGHT',
    weight: 125.5
  };

  receiveForm = {
    condition: 'GOOD' as const,
    weightChecked: 125.5,
    receivedBy: 'warehouse-user'
  };

  locationForm = {
    zone: 'A',
    rack: 'R1',
    bin: 'B4',
    assignedBy: 'warehouse-user'
  };

  dispatchForm = {
    vehicleNumber: 'TN-10-AB-2026',
    destination: 'Seattle Delivery Hub',
    dispatchedBy: 'dispatch-user'
  };

  constructor(private readonly freightcoreService: FreightcoreService) {}

  ngOnInit(): void {
    this.loadShipments();
  }

  loadShipments(): void {
    this.tableLoading = true;
    this.freightcoreService.listShipments({
      status: this.statusFilter,
      mode: this.modeFilter,
      customerName: this.searchText
    })
      .pipe(finalize(() => this.tableLoading = false))
      .subscribe({
        next: (shipments) => {
          this.shipments = shipments;
          if (!this.selectedShipment && shipments.length > 0) {
            this.selectedShipment = shipments[0];
          }
          if (this.selectedShipment) {
            this.selectedShipment = shipments.find((item) => item.id === this.selectedShipment?.id) ?? shipments[0] ?? null;
          }
        },
        error: () => this.showToast('error', 'Unable to load shipments. Check that FreightCore backend is running.')
      });
  }

  createShipment(): void {
    if (!this.createForm.customerName || !this.createForm.origin || !this.createForm.destination || this.createForm.weight <= 0) {
      this.showToast('error', 'Complete all required shipment fields.');
      return;
    }

    this.loading = true;
    this.freightcoreService.createShipment(this.createForm)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (shipment) => {
          this.selectedShipment = shipment;
          this.showToast('success', `Shipment ${shipment.trackingNumber} created.`);
          this.loadShipments();
        },
        error: () => this.showToast('error', 'Shipment could not be created.')
      });
  }

  receiveFreight(): void {
    if (!this.selectedShipment) {
      return;
    }
    this.freightcoreService.receiveFreight({ shipmentId: this.selectedShipment.id, ...this.receiveForm })
      .subscribe({
        next: () => this.afterAction('Freight received at warehouse.'),
        error: () => this.showToast('error', 'Receive action failed.')
      });
  }

  assignLocation(): void {
    if (!this.selectedShipment) {
      return;
    }
    this.freightcoreService.assignLocation({ shipmentId: this.selectedShipment.id, ...this.locationForm })
      .subscribe({
        next: () => this.afterAction('Storage location assigned.'),
        error: () => this.showToast('error', 'Location assignment failed.')
      });
  }

  dispatchShipment(): void {
    if (!this.selectedShipment) {
      return;
    }
    this.freightcoreService.dispatchShipment({ shipmentId: this.selectedShipment.id, ...this.dispatchForm })
      .subscribe({
        next: () => this.afterAction('Shipment dispatched.'),
        error: () => this.showToast('error', 'Dispatch action failed.')
      });
  }

  selectShipment(shipment: Shipment): void {
    this.selectedShipment = shipment;
  }

  clearFilters(): void {
    this.statusFilter = '';
    this.modeFilter = '';
    this.searchText = '';
    this.loadShipments();
  }

  metric(status?: ShipmentStatus): number {
    if (!status) {
      return this.shipments.length;
    }
    return this.shipments.filter((shipment) => shipment.status === status).length;
  }

  statusClass(status: ShipmentStatus): string {
    if (status === 'IN_TRANSIT') {
      return 'status-blue';
    }
    if (status === 'DELIVERED') {
      return 'status-green';
    }
    if (status === 'CANCELLED') {
      return 'status-red';
    }
    if (status === 'RECEIVED' || status === 'IN_WAREHOUSE' || status === 'LOADED') {
      return 'status-amber';
    }
    return 'status-gray';
  }

  private afterAction(message: string): void {
    this.showToast('success', message);
    this.loadShipments();
  }

  private showToast(type: ToastType, message: string): void {
    this.toast = { type, message };
    window.setTimeout(() => this.toast = null, 3500);
  }
}
