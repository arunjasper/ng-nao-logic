import { Injectable, signal } from '@angular/core';
import { TimelineColumn, ZoomLevel } from '../models/timeline.types';

@Injectable({
    providedIn: 'root'
})
export class TimelineGridHelper {
    private zoomLevel = signal<ZoomLevel>('Month');
    private viewStartDateSignal = signal<Date>(new Date());
    private viewEndDateSignal = signal<Date>(new Date());

    readonly timescale = this.zoomLevel.asReadonly();
    readonly viewStartDate = this.viewStartDateSignal.asReadonly();
    readonly viewEndDate = this.viewEndDateSignal.asReadonly();

    // Buffer columns to load when scrolling near edges
    private readonly BUFFER_COLUMNS = 6;

    // Fixed column width in pixels
    readonly columnWidth = () => 110;

    // Get initial columns count based on timescale (fewer columns, load more on scroll)
    private getInitialColumns(): number {
        switch (this.zoomLevel()) {
            case 'Day': return 14;    // 2 weeks of days
            case 'Week': return 12;   // ~3 months of weeks
            case 'Month': return 12;  // 1 year of months
        }
    }

    constructor() {
        this.centerOnToday();
    }

    setTimescale(scale: ZoomLevel): void {
        this.zoomLevel.set(scale);
        this.centerOnToday();
    }

    centerOnToday(): void {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const offset = Math.floor(this.getInitialColumns() / 2);

        switch (this.zoomLevel()) {
            case 'Day':
                this.viewStartDateSignal.set(this.addDays(today, -offset));
                this.viewEndDateSignal.set(this.addDays(today, offset));
                break;
            case 'Week':
                const weekStart = this.getWeekStart(today);
                this.viewStartDateSignal.set(this.addDays(weekStart, -offset * 7));
                this.viewEndDateSignal.set(this.addDays(weekStart, offset * 7));
                break;
            case 'Month':
                const monthStart = new Date(today.getFullYear(), today.getMonth() - offset, 1);
                const monthEnd = new Date(today.getFullYear(), today.getMonth() + offset, 1);
                this.viewStartDateSignal.set(monthStart);
                this.viewEndDateSignal.set(monthEnd);
                break;
        }
    }

    /**
     * Expand the timeline by prepending earlier dates
     * @returns Number of columns added (for scroll adjustment)
     */
    expandPast(): number {
        const columnsToAdd = this.BUFFER_COLUMNS;
        const currentStart = new Date(this.viewStartDateSignal());

        switch (this.zoomLevel()) {
            case 'Day':
                this.viewStartDateSignal.set(this.addDays(currentStart, -columnsToAdd));
                break;
            case 'Week':
                this.viewStartDateSignal.set(this.addDays(currentStart, -columnsToAdd * 7));
                break;
            case 'Month':
                this.viewStartDateSignal.set(new Date(currentStart.getFullYear(), currentStart.getMonth() - columnsToAdd, 1));
                break;
        }

        return columnsToAdd;
    }

    /**
     * Expand the timeline by appending future dates
     * @returns Number of columns added
     */
    expandFuture(): number {
        const columnsToAdd = this.BUFFER_COLUMNS;
        const currentEnd = new Date(this.viewEndDateSignal());

        switch (this.zoomLevel()) {
            case 'Day':
                this.viewEndDateSignal.set(this.addDays(currentEnd, columnsToAdd));
                break;
            case 'Week':
                this.viewEndDateSignal.set(this.addDays(currentEnd, columnsToAdd * 7));
                break;
            case 'Month':
                this.viewEndDateSignal.set(new Date(currentEnd.getFullYear(), currentEnd.getMonth() + columnsToAdd, 1));
                break;
        }

        return columnsToAdd;
    }

    /**
     * Get total number of columns based on start and end dates
     */
    getTotalColumns(): number {
        const start = this.viewStartDateSignal();
        const end = this.viewEndDateSignal();

        switch (this.zoomLevel()) {
            case 'Day':
                return this.daysBetween(start, end) + 1;
            case 'Week':
                return Math.ceil(this.daysBetween(start, end) / 7) + 1;
            case 'Month':
                return (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;
        }
    }

    /**
     * Generate timeline columns based on current timescale and date range
     */
    generateColumns(): TimelineColumn[] {
        const columns: TimelineColumn[] = [];
        const startDate = new Date(this.viewStartDateSignal());
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const totalColumns = this.getTotalColumns();

        for (let i = 0; i < totalColumns; i++) {
            let date: Date;
            let label: string;
            let isCurrentPeriod = false;

            switch (this.zoomLevel()) {
                case 'Day':
                    date = this.addDays(startDate, i);
                    label = this.formatDayLabel(date);
                    isCurrentPeriod = this.isSameDay(date, today);
                    break;
                case 'Week':
                    date = this.addDays(startDate, i * 7);
                    label = this.formatWeekLabel(date);
                    isCurrentPeriod = this.isCurrentWeek(date, today);
                    break;
                case 'Month':
                    date = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
                    label = this.formatMonthLabel(date);
                    isCurrentPeriod = this.isSameMonth(date, today);
                    break;
            }

            columns.push({ date, label, isCurrent: isCurrentPeriod });
        }

        return columns;
    }

    /**
     * Calculate the left position (in pixels) for a work order bar
     * @param startDate - Work order start date (ISO string)
     * @returns Left position in pixels, or null if outside visible range
     */
    calculateBarLeft(startDate: string): number | null {
        const orderStart = new Date(startDate);
        orderStart.setHours(0, 0, 0, 0);
        const viewStart = new Date(this.viewStartDateSignal());
        viewStart.setHours(0, 0, 0, 0);

        let position: number;

        switch (this.zoomLevel()) {
            case 'Day':
                const daysDiff = this.daysBetween(viewStart, orderStart);
                position = daysDiff * this.columnWidth();
                break;
            case 'Week':
                const weeksDiff = this.daysBetween(viewStart, orderStart) / 7;
                position = weeksDiff * this.columnWidth();
                break;
            case 'Month':
                const monthsDiff = this.monthsBetween(viewStart, orderStart);
                position = monthsDiff * this.columnWidth();
                break;
        }

        return position;
    }

    /**
     * Calculate the width (in pixels) for a work order bar
     * @param startDate - Work order start date (ISO string)
     * @param endDate - Work order end date (ISO string)
     * @returns Width in pixels
     */
    calculateBarWidth(startDate: string, endDate: string): number {
        const start = new Date(startDate);
        const end = new Date(endDate);
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);

        let width: number;
        const minWidth = 80; // Minimum bar width for readability

        switch (this.zoomLevel()) {
            case 'Day':
                const days = this.daysBetween(start, end) + 1; // +1 to include end date
                width = days * this.columnWidth();
                break;
            case 'Week':
                const weeks = (this.daysBetween(start, end) + 1) / 7;
                width = weeks * this.columnWidth();
                break;
            case 'Month':
                // Calculate width based on actual days difference, converted to months
                const totalDays = this.daysBetween(start, end) + 1;
                const months = totalDays / 30; // Average days per month
                width = Math.max(months, 0.5) * this.columnWidth();
                break;
        }

        return Math.max(width, minWidth);
    }

    /**
     * Get the date from a click position on the timeline
     * @param offsetX - X offset from timeline container start
     * @returns Date at that position
     */
    getDateFromPosition(offsetX: number): Date {
        const columnIndex = Math.floor(offsetX / this.columnWidth());
        const viewStart = new Date(this.viewStartDateSignal());

        switch (this.zoomLevel()) {
            case 'Day':
                return this.addDays(viewStart, columnIndex);
            case 'Week':
                return this.addDays(viewStart, columnIndex * 7);
            case 'Month':
                return new Date(viewStart.getFullYear(), viewStart.getMonth() + columnIndex, 1);
        }
    }

    /**
     * Calculate the position of the "today" indicator line
     * @returns Left position in pixels, or null if today is outside visible range
     */
    getTodayIndicatorPosition(): number | null {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return this.calculateBarLeft(today.toISOString().split('T')[0]);
    }

    // Delegate to DateUtilsService for cleaner code
    private addDays(date: Date, days: number): Date {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }

    private daysBetween(start: Date, end: Date): number {
        const msPerDay = 24 * 60 * 60 * 1000;
        return Math.round((end.getTime() - start.getTime()) / msPerDay);
    }

    private monthsBetween(start: Date, end: Date): number {
        return (end.getFullYear() - start.getFullYear()) * 12 +
            (end.getMonth() - start.getMonth()) +
            (end.getDate() - 1) / 30;
    }

    private getWeekStart(date: Date): Date {
        const result = new Date(date);
        const day = result.getDay();
        const diff = result.getDate() - day + (day === 0 ? -6 : 1);
        result.setDate(diff);
        return result;
    }

    private isSameDay(date1: Date, date2: Date): boolean {
        return date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate();
    }

    private isSameMonth(date1: Date, date2: Date): boolean {
        return date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth();
    }

    private isCurrentWeek(weekStart: Date, today: Date): boolean {

        const weekEnd = this.addDays(weekStart, 6);
        return today >= weekStart && today <= weekEnd;
    }

    private formatDayLabel(date: Date): string {
        return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    }

    private formatWeekLabel(date: Date): string {
        const endDate = this.addDays(date, 6);
        const startStr = this.formatDayLabel(date);
        const endStr = this.formatDayLabel(endDate);
        return `${startStr} - ${endStr}`;
    }

    private formatMonthLabel(date: Date): string {
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }

    formatDateToISO(date: Date): string {
        return date.toISOString().split('T')[0];
    }
}
