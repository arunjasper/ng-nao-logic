
export type ZoomLevel = 'Day' | 'Week' | 'Month';
export type WorkOrderStatus = 'open' | 'in-progress' | 'complete' | 'blocked';

export interface WorkCenterDocument {
  docId: string;
  docType: 'workCenter';
  data: {
    name: string;
  };
}

export interface WorkOrderDocument {
  docId: string;
  docType: 'workOrder';
  data: {
    name: string;
    workCenterId: string;
    status: WorkOrderStatus;
    startDate: string;
    endDate: string;
  };
}

export interface TimelineColumn {
  date: Date;
  label: string;
  subLabel?: string;
  isWeekend?: boolean;
  isToday?: boolean;
  isCurrent?: boolean;
}

export enum FormMode {
  Create = 'create',
  Edit = 'edit'
}