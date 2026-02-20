import { Component, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectComponent } from '@ng-select/ng-select';
import { TimelineGrid } from './timeline-grid/timeline-grid';
import { DatePipe } from '@angular/common';
import { FormMode, ZoomLevel, WorkCenterDocument, WorkOrderDocument } from '../../core/models/timeline.types';
import { Drawer } from "../../shared/components/drawer/drawer";
import { WorkOrderForm } from "./work-order-form/work-order-form";
import { Confirm } from "../../shared/components/confirm/confirm";
import { DataService } from '../../core/services/data.service';
import { WorkOrderTimelineStore } from '../../core/services/work-order-timeline-state.service';

@Component({
  selector: 'app-work-order-scheduler',
  imports: [NgSelectComponent, FormsModule, TimelineGrid, Drawer, WorkOrderForm, Confirm],
  providers: [DatePipe],
  templateUrl: './work-order-scheduler.html',
  styleUrl: './work-order-scheduler.scss',
})
export class WorkOrderScheduler {
  private readonly store = inject(WorkOrderTimelineStore);
  readonly workCenters = this.store.workCenters;
  readonly workOrders = this.store.workOrders;
  readonly error = this.store.error;
  private datePipe = inject(DatePipe);
  dataService = inject(DataService);
  openModal = signal(false);
  confirmMessage = signal('');
  zoomLevels: ZoomLevel[] = ['Day', 'Week', 'Month'];
  currentZoomLevel = signal<ZoomLevel>('Month');
  selectedCenter = signal<WorkCenterDocument | undefined>(undefined);
  selectedOrder = signal<WorkOrderDocument | undefined>(undefined);
  isDrawerOpen = signal(false);
  formMode = signal<FormMode>(FormMode.Create);
  formData: { workCenterId: string; startDate: string } | null = null;


  updateZoomLevel(mode: ZoomLevel) {
    this.currentZoomLevel.set(mode);
  }

  onCreateOrder(event: { centerId: string; date: Date }) {
    console.log(event)
    this.formMode.set(FormMode.Create);
    this.selectedOrder.set(undefined);
    const formattedDate = this.datePipe.transform(event.date, 'yyyy-MM-dd') || '';
    this.formData = {
      workCenterId: event.centerId,
      startDate: formattedDate,
    };
    this.isDrawerOpen.set(true);
  }

  onEditOrder(order: WorkOrderDocument) {
    this.formMode.set(FormMode.Edit);
    this.selectedOrder.set(order);
    this.formData = null;
    this.isDrawerOpen.set(true);
  }

  deleteOrder() {
    this.store.removeWorkOrder(this.selectedOrder()!);
    this.selectedOrder.set(undefined);
    this.toggleModal(false);
  }

  onDeleteOrder(order: WorkOrderDocument) {
    this.selectedOrder.set(order);
    const msg = `Delete order ${order.data.name}?`
    this.confirmMessage.set(msg);
    this.toggleModal(true);
  }

  toggleModal(value: boolean) {
    this.openModal.set(value);
  }

  onSave(WorkOrder: WorkOrderDocument | undefined) {
    console.log(WorkOrder)
    if (this.formMode() === FormMode.Create) {
      this.store.addWorkOrder(WorkOrder!);
    } else if (this.formMode() === FormMode.Edit) {
      this.store.updateWorkOrder(WorkOrder!);
    }
    this.isDrawerOpen.set(false);
    this.selectedOrder.set(undefined);
  }

  onCenterSelected(center: WorkCenterDocument) {
    console.log(this.selectedCenter())
    this.selectedCenter.set(center);
  }

  onClose() {
    this.isDrawerOpen.set(false);
  }

}
