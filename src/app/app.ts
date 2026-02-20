import { Component, signal } from '@angular/core';
import { WorkOrderScheduler } from "./features/work-order-scheduler/work-order-scheduler";

@Component({
  selector: 'app-root',
  imports: [ WorkOrderScheduler],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('ng-nao-logic-work-order-scheduler');
}
