import { Component, computed, ElementRef, inject, input, OnChanges, output, signal, ViewChild } from '@angular/core';
import { WorkOrderBar } from '../work-order-bar/work-order-bar';
import { TimelineGridHelper } from '../../../core/services/timeline-grid-helper';
import { WorkOrderTimelineStore } from '../../../core/services/work-order-timeline-state.service';
import { TimelineColumn, WorkCenterDocument, WorkOrderDocument, ZoomLevel } from '../../../core/models/timeline.types';

@Component({
  selector: 'app-timeline-grid',
  imports: [WorkOrderBar],
  templateUrl: './timeline-grid.html',
  styleUrl: './timeline-grid.scss',
})
export class TimelineGrid implements OnChanges {
  private readonly store = inject(WorkOrderTimelineStore);
  gridHelper = inject(TimelineGridHelper)
  workCenters = input.required<WorkCenterDocument[]>();
  workOrders = input.required<WorkOrderDocument[]>();
  readonly zoomLevel = input<ZoomLevel>('Day');
  readonly editOrder = output<WorkOrderDocument>();
  readonly deleteOrder = output<WorkOrderDocument>();
  readonly rowClick = output<WorkCenterDocument>();
  readonly createOrder = output<{
    centerId: string;
    date: Date;
  }>();
  @ViewChild('timelineHeader') timelineHeader!: ElementRef<HTMLDivElement>;
  @ViewChild('timelineContent') timelineContent!: ElementRef<HTMLDivElement>;
  @ViewChild('workCentersList') workCentersList!: ElementRef<HTMLDivElement>;

  ngOnChanges(): void {
    this.gridHelper.setTimescale(this.zoomLevel());
    this.centerScroll();
  }
  // Panel state
  isPanelOpen = signal(false);
  panelMode = signal<'create' | 'edit'>('create');
  selectedWorkOrder = signal<WorkOrderDocument | null>(null);
  selectedWorkCenter = signal<WorkCenterDocument | null>(null);

  panelError = signal<string>('');

  // Hover state for rows
  hoveredRowId = signal<string | null>(null);
  showTooltip = signal(false);
  tooltipPosition = signal({ x: 0, y: 0 });

  // Hover placeholder state
  hoverPlaceholder = signal<{ workCenterId: string; left: number; width: number } | null>(null);

  // Computed values
  columns = computed(() => this.gridHelper.generateColumns());
  totalWidth = computed(() => this.columns().length * this.gridHelper.columnWidth());
  todayPosition = computed(() => this.gridHelper.getTodayIndicatorPosition());

  activeMenuOrderId: string | null = null;
  activeMenuRowId: string | null = null;
  //columns = signal<TimelineColumn[]>([]);
  colWidth = signal<number>(60);

  hoveredRowIndex: number | null = null;
  createLeft = 0;
  hoveredDate: Date = new Date();

  isHoveringOrder = false;

  private centerScroll(): void {
    requestAnimationFrame(() => {
      const content = this.timelineContent?.nativeElement;
      const header = this.timelineHeader?.nativeElement;
      if (content) {
        const centerScroll = (content.scrollWidth - content.clientWidth) / 2;
        content.scrollLeft = centerScroll;
        if (header) {
          header.scrollLeft = centerScroll;
        }
      }
    });
  }

  // Current period badge position (center of current period column)
  currentPeriodBadgePosition = computed(() => {
    const cols = this.columns();
    const currentIndex = cols.findIndex(c => c.isCurrent);
    if (currentIndex === -1) return null;
    const columnWidth = this.gridHelper.columnWidth();
    return (currentIndex * columnWidth) + (columnWidth / 2);
  });

  getWorkOrdersForCenter(workCenterId: string): WorkOrderDocument[] {
    return this.workOrders().filter(wo => wo.data.workCenterId === workCenterId);
  }

  getBarLeft(workOrder: WorkOrderDocument): number {
    return this.gridHelper.calculateBarLeft(workOrder.data.startDate) ?? 0;
  }

  getBarWidth(workOrder: WorkOrderDocument): number {
    return this.gridHelper.calculateBarWidth(workOrder.data.startDate, workOrder.data.endDate);
  }


  toggleRowSelection(center: WorkCenterDocument) {
    console.log('toggleRowSelection', center)
    this.rowClick.emit(center);
  }

  onMouseMove(e: MouseEvent, rowIndex: number) {
    if (this.selectedWorkCenter()?.docId !== this.workCenters()[rowIndex].docId) return;

    this.hoveredRowIndex = rowIndex;
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;

    this.createLeft = offsetX - 56;

    const width = this.colWidth() || 60;
    const colIndex = Math.floor(offsetX / width);

    if (colIndex >= 0 && colIndex < this.columns().length) {
      this.hoveredDate = this.columns()[colIndex].date;
    }
  }

  onMouseLeave() {
    this.hoveredRowIndex = null;
  }

  onTimelineClick(event: MouseEvent, workCenter: WorkCenterDocument): void {
    const target = event.target as HTMLElement;
    // Don't trigger if clicking on a work order bar
    if (target.closest('.work-order-bar')) {
      return;
    }
    const container = target.closest('.timeline-row-content') as HTMLElement;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const scrollLeft = container.scrollLeft;
    this.onCenterSelected(workCenter);
    this.createOrder.emit({
      centerId: workCenter.docId!,
      date: this.hoveredDate
    });
    this.panelMode.set('create');
    this.panelError.set('');
    this.isPanelOpen.set(true);
  }


  onRowMouseEnter(workCenterId: string): void {
    this.hoveredRowId.set(workCenterId);
  }

  onRowMouseLeave(): void {
    this.hoveredRowId.set(null);
  }

  onTimelineMouseMove(event: MouseEvent, workCenterId?: string): void {
    const target = event.target as HTMLElement;
    // Only show tooltip and placeholder when hovering over empty timeline area (not on work order bars)
    if (!target.closest('.work-order-bar') && target.closest('.timeline-row-content')) {
      this.showTooltip.set(true);
      this.tooltipPosition.set({ x: event.clientX + 10, y: event.clientY - 30 });

      // Calculate placeholder position
      if (workCenterId) {
        const container = target.closest('.timeline-row-content') as HTMLElement;
        if (container) {
          const rect = container.getBoundingClientRect();
          const offsetX = event.clientX - rect.left + container.scrollLeft;
          const columnWidth = this.gridHelper.columnWidth();
          // Snap to column and center the placeholder
          const columnIndex = Math.floor(offsetX / columnWidth);
          const placeholderWidth = columnWidth * 0.8; // 80% of column width
          const left = columnIndex * columnWidth + (columnWidth - placeholderWidth) / 2;

          this.hoverPlaceholder.set({
            workCenterId,
            left,
            width: placeholderWidth
          });
        }
      }
    } else {
      this.showTooltip.set(false);
      this.hoverPlaceholder.set(null);
    }
  }

  onTimelineMouseLeave(): void {
    this.showTooltip.set(false);
    this.hoverPlaceholder.set(null);
  }

  goToToday(): void {
    this.gridHelper.centerOnToday();
  }

  trackByWorkCenter(index: number, workCenter: WorkCenterDocument): string {
    return workCenter.docId;
  }

  trackByWorkOrder(index: number, workOrder: WorkOrderDocument): string {
    return workOrder.docId;
  }

  trackByColumn(index: number, column: TimelineColumn): string {
    return column.date.toISOString();
  }

  // Threshold in pixels to trigger loading more columns
  private readonly SCROLL_THRESHOLD = 200;
  private isExpandingPast = false;
  private isExpandingFuture = false;

  onTimelineScroll(event: Event): void {
    const target = event.target as HTMLElement;

    // Sync horizontal scroll with header
    if (this.timelineHeader?.nativeElement) {
      this.timelineHeader.nativeElement.scrollLeft = target.scrollLeft;
    }

    // Sync vertical scroll with work centers list
    if (this.workCentersList?.nativeElement) {
      this.workCentersList.nativeElement.scrollTop = target.scrollTop;
    }

    // Check if we need to expand the timeline
    this.checkInfiniteScroll(target);
  }

  private checkInfiniteScroll(container: HTMLElement): void {
    const scrollLeft = container.scrollLeft;
    const scrollWidth = container.scrollWidth;
    const clientWidth = container.clientWidth;
    const scrollRight = scrollWidth - scrollLeft - clientWidth;

    // Expand past (prepend columns) when scrolling near left edge
    if (scrollLeft < this.SCROLL_THRESHOLD && !this.isExpandingPast) {
      this.isExpandingPast = true;
      const columnsAdded = this.gridHelper.expandPast();

      // Adjust scroll position to compensate for prepended content
      requestAnimationFrame(() => {
        const addedWidth = columnsAdded * this.gridHelper.columnWidth();
        container.scrollLeft = scrollLeft + addedWidth;
        this.isExpandingPast = false;
      });
    }

    // Expand future (append columns) when scrolling near right edge
    if (scrollRight < this.SCROLL_THRESHOLD && !this.isExpandingFuture) {
      this.isExpandingFuture = true;
      this.gridHelper.expandFuture();

      requestAnimationFrame(() => {
        this.isExpandingFuture = false;
      });
    }
  }


  onMenuToggle(isOpen: boolean, orderId: string) {
    if (isOpen) {
      this.activeMenuOrderId = orderId;
      const order = this.workOrders().find(o => o.docId === orderId);
      this.activeMenuRowId = order ? order.data.workCenterId : null;
    } else if (this.activeMenuOrderId === orderId) {
      this.activeMenuOrderId = null;
      this.activeMenuRowId = null;
    }
  }

  onOrderEdit(workOrder: WorkOrderDocument): void {
    this.selectedWorkOrder.set(workOrder);
    this.editOrder.emit(workOrder);
    // this.panelMode.set('edit');
    // this.panelError.set('');
    // this.isPanelOpen.set(true);
  }


  onCenterSelected(workCenter: WorkCenterDocument) {
    this.selectedWorkCenter.set(workCenter);
    this.selectedWorkOrder.set(null);
    this.rowClick.emit(workCenter);

  }

  onOrderDelete(order: WorkOrderDocument) {
    this.deleteOrder.emit(order);
  }

}
