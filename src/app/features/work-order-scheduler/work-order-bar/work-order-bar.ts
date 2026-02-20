import { Component, HostListener, ElementRef, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkOrderDocument } from '../../../core/models/timeline.types';

@Component({
  selector: 'app-work-order-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './work-order-bar.html',
  styleUrl: './work-order-bar.scss'
})
export class WorkOrderBar {

  readonly left = input<number>(0);
  readonly width = input<number>(100);
  isMenuOpen = false;
  isHovered = false;
  dropdownPosition = { top: 0, left: 0 };
  private eRef = inject(ElementRef);
  readonly workOrder = input.required<WorkOrderDocument>();
  readonly edit = output<WorkOrderDocument>();
  readonly delete = output<WorkOrderDocument>();
  readonly menuToggled = output<boolean>();

  /*
  onCardClick(e: Event) {
    if (this.isMenuOpen) {
      this.isMenuOpen = false;
      this.menuToggled.emit(false);
      return;
    }
  }

  onCardKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this.onCardClick(e);
    }
  } */

  onMenuToggle(e: Event) {
    e.stopPropagation();
    this.isMenuOpen = !this.isMenuOpen;
    this.menuToggled.emit(this.isMenuOpen);
  }

  onEditOption(e: Event) {
    e.stopPropagation();
    this.isMenuOpen = false;
    this.menuToggled.emit(false);
    this.edit.emit(this.workOrder());
  }

  onDeleteOption(e: Event) {
    e.stopPropagation();
    this.isMenuOpen = false;
    this.menuToggled.emit(false);
    this.delete.emit(this.workOrder());
  }

  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    if (this.isMenuOpen && !this.eRef.nativeElement.contains(event.target)) {
      this.isMenuOpen = false;
      this.menuToggled.emit(false);
    }
  }

  get statusLabel(): string {
    switch (this.workOrder().data.status) {
      case 'open': return 'Open';
      case 'in-progress': return 'In progress';
      case 'complete': return 'Complete';
      case 'blocked': return 'Blocked';
      default: return '';
    }
  }

  get statusClass(): string {
    return `status-${this.workOrder().data.status}`;
  }
}
