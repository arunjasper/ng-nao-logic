import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { WorkCenterDocument, WorkOrderDocument } from '../models/timeline.types';

@Injectable({
    providedIn: 'root',
})
export class DataService {
    private http = inject(HttpClient);

    getWorkCenters(): Observable<WorkCenterDocument[]> {
        // Reference the file from the root
        const url = 'api/mock-work-centers.json';
        return this.http.get<WorkCenterDocument[]>(url);
    }

    getWorkOrders(): Observable<WorkOrderDocument[]> {
        // Reference the file from the root
        const url = 'api/mock-work-orders.json';
        return this.http.get<WorkOrderDocument[]>(url);
    }
}
