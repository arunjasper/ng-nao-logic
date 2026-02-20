import { inject } from '@angular/core';
import { catchError, of, pipe, switchMap, tap } from 'rxjs';
import {
  patchState,
  signalStore,
  withMethods,
  withState,
  withHooks
} from '@ngrx/signals';
import { withStorageSync } from '@angular-architects/ngrx-toolkit';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { WorkCenterDocument, WorkOrderDocument } from '../models/timeline.types';
import { DataService } from './data.service';

export interface ApplicationState {
  // Define the shape of your application state here
  workCenters: WorkCenterDocument[];
  workOrders: WorkOrderDocument[];
  error: string | null;
}

const initialState: ApplicationState = {
  workCenters: [],
  workOrders: [],
  error: null
};

export const WorkOrderTimelineStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withStorageSync({
    key: 'workOrderTimelineState', // The key used in session storage
    storage: () => sessionStorage, // Specify sessionStorage / default - localStorage
  }),

  withMethods((store, dataService = inject(DataService)) => ({
    loadWorkCenters: rxMethod<void>(
      pipe(
        switchMap(() => {
          const savedState = localStorage.getItem("workOrderTimelineState");
          if (savedState) {
            const parsedState = JSON.parse(savedState);
            patchState(store, parsedState);
            return of([]);
          }
          return dataService.getWorkCenters().pipe(
            tap((data) => {
              patchState(store, { workCenters: data, error: null });
            }),
            catchError((error) => {
              patchState(store, { error: error.message });
              return of([]); // Return an empty observable to complete the stream
            })
          )
        }
        )
      )
    ),
    loadWorkOrders: rxMethod<void>(
      pipe(
        switchMap(() => {
          const savedState = localStorage.getItem("workOrderTimelineState");
          if (savedState) {
            const parsedState = JSON.parse(savedState);
            patchState(store, parsedState);
            return of([]);
          }
          return dataService.getWorkOrders().pipe(
            tap((data) => {
              patchState(store, { workOrders: data, error: null });
            }),
            catchError((error) => {
              patchState(store, { error: error.message });
              return of([]); // Return an empty observable to complete the stream
            })
          )
        }
        )
      )
    ),
    addWorkOrder(workOrder: WorkOrderDocument) {
      patchState(store, (state) => ({
        ...state,
        workOrders: [...state.workOrders, workOrder],
        // alertMessage: 'Work order created successfully!'
      }));
    },
    removeWorkOrder(workOrder: WorkOrderDocument) {
      patchState(store, (state) => ({
        ...state,
        workOrders: state.workOrders.filter(o => o.docId !== workOrder.docId),
        //  alertMessage: 'Work order removed successfully!'
      }));
    },
    updateWorkOrder(workOrder: WorkOrderDocument) {
      patchState(store, (state) => ({
        ...state,
        workOrders: state.workOrders.map(o => o.docId === workOrder.docId ? workOrder : o),
        //  alertMessage: 'Work order updated successfully!'
      }));
    },
  })),
  withHooks((store) => ({
    onInit() {
      // Check if the state is empty based on the synced data
      if (!store.workCenters() || store.workCenters().length === 0) {
        store.loadWorkCenters(); // Call API only if empty
      }
      if (!store.workOrders() || store.workOrders().length === 0) {
        store.loadWorkOrders(); // Call API only if empty
      }
    },
  })),
);