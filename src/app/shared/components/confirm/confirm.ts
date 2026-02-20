
import { Component, input, model, output } from '@angular/core';

@Component({
  selector: 'app-confirm',
  imports: [],
  templateUrl: './confirm.html',
  styleUrl: './confirm.scss',
})
export class Confirm {
  isVisible = model.required<boolean>();
  readonly message = input.required<string>();
  readonly title = input.required<string>();
  readonly confirmBtnText = input<string>('Confirm');
  readonly cancelBtnText = input<string>('Cancel');
  readonly confirm = output<boolean>();
  readonly cancel = output<boolean>();

  delete() {
    this.confirm.emit(true);
    this.isVisible.set(false);
  }

  close() {
    this.isVisible.set(false);
    this.cancel.emit(false);
  }
}


