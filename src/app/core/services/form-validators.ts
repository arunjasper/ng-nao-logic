import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { WorkOrderDocument } from '../models/timeline.types';

export const timelineOverlapValidator = (existingWorkOrders: WorkOrderDocument[]): ValidatorFn => {
    return (ctl: AbstractControl): ValidationErrors | null => {  
        const startDate = ctl.get('startDate')?.value;
        const endDate = ctl.get('endDate')?.value;
        if (startDate && endDate) {
            const sDate = `${startDate.year}-${startDate.month.toString().padStart(2, '0')}-${startDate.day.toString().padStart(2, '0')}`
            const eDate = `${endDate.year}-${endDate.month.toString().padStart(2, '0')}-${endDate.day.toString().padStart(2, '0')}`
            const newStart = new Date(sDate).getTime();
            const newEnd = new Date(eDate).getTime();
            const isOverlap = existingWorkOrders.some((order: WorkOrderDocument) => {
                const orderStart = new Date(order.data.startDate).getTime();
                const orderEnd = new Date(order.data.endDate).getTime();
                // Overlap occurs if: newStart < orderEnd AND newEnd > orderStart
                return newStart < orderEnd && newEnd > orderStart;
            });
            ctl.get('startDate')?.setErrors({ dateOverlap: true });
            ctl.get('endDate')?.setErrors({ dateOverlap: true });
            if (isOverlap) { return { dateOverlap: true } }
        }
        ctl.get('startDate')?.setErrors(null);
        ctl.get('endDate')?.setErrors(null);
        return null; // No overlap
    }
};


export const startDateBeforeEndDateValidator = (): ValidatorFn => {
    return (ctl: AbstractControl): ValidationErrors | null => {
        if (!ctl.value.submitted)
            return null
        const startDate = ctl.get('startDate')?.value;
        const endDate = ctl.get('endDate')?.value;
        if (startDate && endDate) {
            const sDate = `${startDate.year}-${startDate.month.toString().padStart(2, '0')}-${startDate.day.toString().padStart(2, '0')}`
            const eDate = `${endDate.year}-${endDate.month.toString().padStart(2, '0')}-${endDate.day.toString().padStart(2, '0')}`
            const start = new Date(sDate).getTime();
            const end = new Date(eDate).getTime();
            if (start >= end) {
                ctl.get('startDate')?.setErrors({ startBeforeEnd: true });
                ctl.get('endDate')?.setErrors({ startBeforeEnd: true });
                return { startBeforeEnd: true };
            }
        }
        ctl.get('startDate')?.setErrors(null);
        ctl.get('endDate')?.setErrors(null);
        return null;
    }
};

