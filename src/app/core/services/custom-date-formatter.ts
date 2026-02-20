import { Injectable } from '@angular/core';
import { NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

/**
 * This service handles converting the NgbDateStruct model to and from a custom date string format.
 */
@Injectable()
export class CustomDateFormatter extends NgbDateParserFormatter {
  readonly DELIMITER = '.';

  parse(value: string): NgbDateStruct | null {
    if (value) {
      const dateParts = value.trim().split(this.DELIMITER);
      if (dateParts.length === 3) {
        return {
          month: parseInt(dateParts[0], 10),
          day: parseInt(dateParts[1], 10),
          year: parseInt(dateParts[2], 10),
        };
      }
    }
    return null;
  }

  format(date: NgbDateStruct | null): string {
    return date ? `${this.padNumber(date.month)}${this.DELIMITER}${this.padNumber(date.day)}${this.DELIMITER}${date.year}` : '';
  }

  private padNumber(value: number): string {
    // Helper function to ensure leading zeros for month and day
    return `0${value}`.slice(-2);
  }
}
