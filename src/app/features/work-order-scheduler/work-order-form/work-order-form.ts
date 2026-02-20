import { Component, input, output, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { ReactiveFormsModule, FormGroup, Validators, FormControl } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormMode, WorkCenterDocument, WorkOrderDocument, WorkOrderStatus } from '../../../core/models/timeline.types';
import { NgClass } from '@angular/common';
import { NgbDatepickerModule, NgbDateStruct, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { CustomDateFormatter } from '../../../core/services/custom-date-formatter';
import { WorkOrderTimelineStore } from '../../../core/services/work-order-timeline-state.service';
import { startDateBeforeEndDateValidator, timelineOverlapValidator } from '../../../core/services/form-validators';
@Component({
  selector: 'app-work-order-form',
  imports: [ReactiveFormsModule, NgSelectModule, NgClass, NgbDatepickerModule,],
  providers: [{ provide: NgbDateParserFormatter, useClass: CustomDateFormatter }],
  templateUrl: './work-order-form.html',
  styleUrl: './work-order-form.scss',
})
export class WorkOrderForm implements OnInit , OnDestroy{
  private readonly store = inject(WorkOrderTimelineStore);
  readonly mode = input<FormMode>();
  readonly selectedWorkOrder = input<WorkOrderDocument | undefined>(undefined);
  readonly selectedWorkCenter = input<WorkCenterDocument | undefined>(undefined);
  readonly initialData = input<{
    workCenterId: string;
    startDate: string;
  } | null>(null);
  validationError = signal<string | null>(null);
  readonly close = output<void>();
  readonly save = output<WorkOrderDocument | undefined>();
  form: FormGroup;
  workOrders: WorkOrderDocument[] = this.store.workOrders();
  statusOptions: { value: WorkOrderStatus, label: string }[] = [
    { value: 'open', label: 'Open' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'complete', label: 'Complete' },
    { value: 'blocked', label: 'Blocked' }
  ];

  constructor() {
    this.form = new FormGroup({})
  }

  ngOnInit() {
    this.initForm();
  }

  private initForm() {
    const mode = this.mode();
    this.form = new FormGroup({
      name: new FormControl('', Validators.required),
      status: new FormControl('open', Validators.required),
      startDate: new FormControl('', Validators.required),
      endDate: new FormControl('', Validators.required)
    }, { validators: [timelineOverlapValidator(this.getExistingWorkOrders()), startDateBeforeEndDateValidator()]});
    const workOrder = this.selectedWorkOrder();
    const initialData = this.initialData();
    if (mode === FormMode.Edit && workOrder) {
      const startDate = this.parseDate(workOrder.data.startDate);
      const endDate = this.parseDate(workOrder.data.endDate);
      this.form.patchValue({
        name: workOrder.data.name,
        status: workOrder.data.status,
        startDate: startDate,
        endDate: endDate
      });
    } else if (mode === FormMode.Create && initialData) {
      const start = new Date(initialData.startDate);
      const end = new Date(start);
      end.setDate(start.getDate() + 7);
      this.form.patchValue({
        name: '',
        status: 'open',
        startDate: this.parseDate(initialData.startDate),
        endDate: this.parseDate(end.toISOString().split('T')[0])
      });
    }
  }

  onSave() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
    } else {
      const formValue = this.form.value;
      const startDate = this.formatDate(formValue.startDate);
      const endDate = this.formatDate(formValue.endDate);
      let workOrder: WorkOrderDocument | undefined = undefined;
      if (this.mode() === FormMode.Create) {
        console.log(this.selectedWorkOrder())
        workOrder = {
          docId: `wo-${Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000}`,
          docType: 'workOrder',
          data: {
            name: formValue.name,
            workCenterId: this.selectedWorkCenter()?.docId || '',
            status: formValue.status,
            startDate: startDate,
            endDate: endDate
          },
        }
      } else if (this.mode() === FormMode.Edit) {
        workOrder = {
          ...this.selectedWorkOrder()!,
          data: {
            name: formValue.name,
            workCenterId: this.selectedWorkOrder()?.data.workCenterId || '',
            status: formValue.status,
            startDate: startDate,
            endDate: endDate
          }
        }
      }
      this.save.emit(workOrder);
    }
  }

  getExistingWorkOrders(): WorkOrderDocument[] {
    const workCenterId = this.selectedWorkCenter()?.docId
    let orders = this.workOrders.filter(wo => wo.data.workCenterId === workCenterId);
    if (this.mode() === FormMode.Edit)
      orders = orders.filter((wo: WorkOrderDocument) => wo.docId !== this.selectedWorkOrder()?.docId);
    return orders;
  }

  onCancel() {
    this.form.reset();
    this.close.emit();
  }

  private parseDate(dateString: string): NgbDateStruct | null {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    return { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate()
    };
  }

  private formatDate(date: NgbDateStruct): string {
    return `${date.year}-${date.month.toString().padStart(2, '0')}-${date.day.toString().padStart(2, '0')}`;
  }

  ngOnDestroy(): void {
    console.log('desct')
      this.form.reset()
  }

}

