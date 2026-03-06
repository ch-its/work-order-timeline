import { Component, inject, signal, computed, effect, ElementRef, ViewChild, OnInit, AfterViewInit, HostListener, ChangeDetectionStrategy, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbDatepickerModule, NgbInputDatepicker } from '@ng-bootstrap/ng-bootstrap';
import { TimelineService } from './services/timeline';

export type Timescale = 'day' | 'week' | 'month';

interface TimelineColumn {
  date: Date;
  label: string;
}

export interface WorkOrderDocument {
  docId: string;
  docType: string;
  data: {
    name: string;
    workCenterId: string;
    status: string;
    startDate: string;
    endDate: string;
  };
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgSelectModule, NgbDatepickerModule], 
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush 
})
export class App implements OnInit, AfterViewInit {
  @ViewChild('scrollViewport') scrollViewport!: ElementRef<HTMLElement>;
  @ViewChild('dpStart') dpStart?: NgbInputDatepicker;
  @ViewChild('dpEnd') dpEnd?: NgbInputDatepicker;
  @ViewChild('nameInput') nameInput?: ElementRef<HTMLInputElement>;
  
  private timelineService = inject(TimelineService);
  private fb = inject(FormBuilder); 
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef); 
  
  workCenters = this.timelineService.workCenters;
  
  today = signal(new Date()); 
  hoveredRowId = signal<string | null>(null);
  mouseX = signal<number>(0); 

  // Tooltip Mouse Tracking Signals
  hoveredTask = signal<WorkOrderDocument | null>(null);
  mouseXClient = signal<number>(0);
  mouseYClient = signal<number>(0);

  isDropdownOpen = signal(false);
  activeMenuId = signal<string | null>(null); 
  timescale = signal<Timescale>('month');

  // RESTORED: Your preferred scroll prepending limits
  leftOffsetIndex = signal<number>(-12);
  rightOffsetIndex = signal<number>(24);
  isAdjustingScroll = false;
  
  readonly zoomConfigs = {
    day: { columnWidth: 120, label: 'Day' },
    week: { columnWidth: 350, label: 'Week' },
    month: { columnWidth: 114, label: 'Month' }
  };

  columnWidth = computed(() => this.zoomConfigs[this.timescale()].columnWidth);
  timescaleLabel = computed(() => this.zoomConfigs[this.timescale()].label);

  isPanelOpen = signal(false);
  editingDocId = signal<string | null>(null);
  selectedWorkCenterId = signal<string | null>(null);
  overlapError = signal<string | null>(null);

  statusOptions = [
    { value: 'open', label: 'Open' },
    { value: 'in-progress', label: 'In progress' },
    { value: 'complete', label: 'Complete' },
    { value: 'blocked', label: 'Blocked' }
  ];

  workOrderForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    status: ['open', Validators.required],
    startDate: [null, Validators.required],
    endDate: [null, Validators.required]
  });

  private getDefaultData(): WorkOrderDocument[] {
    const defaultData = [
      { docId: 'wo-1', docType: 'workOrder', data: { name: 'Extrusion Line A', workCenterId: 'wc-1', status: 'complete', startDate: '2026-03-01', endDate: '2026-04-15' } },
      { docId: 'wo-2', docType: 'workOrder', data: { name: 'Extrusion Line B', workCenterId: 'wc-1', status: 'open', startDate: '2026-05-01', endDate: '2026-06-15' } },
      { docId: 'wo-8', docType: 'workOrder', data: { name: 'CNC Machine 1', workCenterId: 'wc-2', status: 'open', startDate: '2026-04-01', endDate: '2026-07-20' } },
      { docId: 'wo-3', docType: 'workOrder', data: { name: 'Milling A Large Scale', workCenterId: 'wc-3', status: 'in-progress', startDate: '2026-02-10', endDate: '2026-03-25' } },
      { docId: 'wo-4', docType: 'workOrder', data: { name: 'Milling B Finishing', workCenterId: 'wc-3', status: 'in-progress', startDate: '2026-04-10', endDate: '2026-06-05' } },
      { docId: 'wo-5', docType: 'workOrder', data: { name: 'Major Assembly Sub-A', workCenterId: 'wc-4', status: 'blocked', startDate: '2026-03-10', endDate: '2026-06-30' } },
      { docId: 'wo-6', docType: 'workOrder', data: { name: 'QA Check Quarter 1', workCenterId: 'wc-5', status: 'complete', startDate: '2026-02-01', endDate: '2026-04-10' } },
      { docId: 'wo-7', docType: 'workOrder', data: { name: 'CNC Machine 2', workCenterId: 'wc-5', status: 'in-progress', startDate: '2026-05-01', endDate: '2026-07-15' } }
    ];

    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem('naologic_work_orders');
      if (saved) return JSON.parse(saved);
    }
    return defaultData;
  }

  workOrders = signal<WorkOrderDocument[]>(this.getDefaultData());

  constructor() {
    effect(() => {
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem('naologic_work_orders', JSON.stringify(this.workOrders()));
      }
    });
  }

  ngOnInit() {
    setInterval(() => this.today.set(new Date()), 60000);
    this.resetOffsets(this.timescale());
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => this.scrollToToday(), 150);
    }
  }

  @HostListener('document:keydown.escape')
  handleEscape() {
    if (this.isPanelOpen()) this.closePanel();
    this.closeMenus();
  }

  toNgbDate(dateStr: string) {
    if (!dateStr) return null;
    const [year, month, day] = dateStr.split('-').map(Number);
    return { year, month, day };
  }

  fromNgbDate(dateObj: any) {
    if (!dateObj || !dateObj.year) return '';
    const pad = (n: number) => n < 10 ? '0' + n : n;
    return `${dateObj.year}-${pad(dateObj.month)}-${pad(dateObj.day)}`;
  }

  toggleDropdown(event: Event) {
    event.stopPropagation();
    this.isDropdownOpen.update(val => !val);
    this.activeMenuId.set(null); 
  }

  selectTimescale(scale: Timescale) {
    this.timescale.set(scale);
    this.isDropdownOpen.set(false);
    this.resetOffsets(scale);
    this.scrollToToday();
  }

  handleScroll(event: Event) {
    if (this.isAdjustingScroll || !isPlatformBrowser(this.platformId)) return;
    const el = event.target as HTMLElement;
    
    // RESTORED: Your exact preferred scroll physics
    const threshold = 350; 

    if (el.scrollLeft < threshold) {
      this.isAdjustingScroll = true;
      const preWidth = el.scrollWidth;
      const preLeft = el.scrollLeft;

      this.leftOffsetIndex.update(v => v - 12);
      this.cdr.detectChanges(); 

      // FIXED: Wait exactly 1 frame for the browser flexbox to finish resizing
      requestAnimationFrame(() => {
        el.scrollLeft = preLeft + (el.scrollWidth - preWidth);
        setTimeout(() => { this.isAdjustingScroll = false; }, 100);
      });
    } 
    else if (el.scrollWidth - el.scrollLeft - el.clientWidth < threshold) {
      this.isAdjustingScroll = true;
      this.rightOffsetIndex.update(v => v + 12);
      this.cdr.detectChanges();
      setTimeout(() => { this.isAdjustingScroll = false; }, 100);
    }
  }

  scrollToToday() {
    if (!this.scrollViewport || !isPlatformBrowser(this.platformId)) return;
    const viewport = this.scrollViewport.nativeElement;

    this.isAdjustingScroll = true; 
    this.cdr.detectChanges();

    setTimeout(() => {
      const centerPos = this.currentDayPosition() - (viewport.clientWidth / 2);
      viewport.scrollLeft = centerPos;
      this.isAdjustingScroll = false;
    }, 50);
  }
  
  resetOffsets(scale: Timescale) {
    if (scale === 'month') { this.leftOffsetIndex.set(-12); this.rightOffsetIndex.set(24); }
    if (scale === 'week') { this.leftOffsetIndex.set(-20); this.rightOffsetIndex.set(40); }
    if (scale === 'day') { this.leftOffsetIndex.set(-30); this.rightOffsetIndex.set(60); }
  }

  toggleMenu(event: Event, docId: string) {
    event.stopPropagation(); 
    this.isDropdownOpen.set(false); 
    if (this.activeMenuId() === docId) {
      this.activeMenuId.set(null);
    } else {
      this.activeMenuId.set(docId);
    }
  }

  closeMenus() {
    this.activeMenuId.set(null);
    this.isDropdownOpen.set(false);
  }

 openCreatePanel(workCenterId: string) {
    const startX = Math.max(0, this.mouseX());
    const startDate = this.getDateFromPixelPosition(startX);
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 7);
    const formatYMD = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    this.editingDocId.set(null);
    this.selectedWorkCenterId.set(workCenterId);
    this.overlapError.set(null);
    
    this.workOrderForm.reset();
    this.workOrderForm.patchValue({
      name: '', 
      status: 'open',
      startDate: this.toNgbDate(formatYMD(startDate)),
      endDate: this.toNgbDate(formatYMD(endDate))
    });

    this.isPanelOpen.set(true);
    this.closeMenus();
    setTimeout(() => this.nameInput?.nativeElement.focus(), 100);
  }

  editWorkOrder(docId: string) {
    const wo = this.workOrders().find(w => w.docId === docId);
    if (wo) {
      this.editingDocId.set(docId);
      this.selectedWorkCenterId.set(wo.data.workCenterId);
      this.overlapError.set(null);
      
      this.workOrderForm.patchValue({
        name: wo.data.name,
        status: wo.data.status,
        startDate: this.toNgbDate(wo.data.startDate),
        endDate: this.toNgbDate(wo.data.endDate)
      });

      this.isPanelOpen.set(true);
      setTimeout(() => this.nameInput?.nativeElement.focus(), 100);
    }
    this.closeMenus();
  }

  closePanel() {
    
    this.workOrderForm.reset();
    this.overlapError.set(null);
    this.isPanelOpen.set(false);
  }

  saveWorkOrder() {
    if (this.workOrderForm.invalid) {
      this.workOrderForm.markAllAsTouched();
      this.overlapError.set(null); 
      return;
    }

    const val = this.workOrderForm.value;
    const currentId = this.editingDocId();
    const wcId = this.selectedWorkCenterId();

    const startStr = this.fromNgbDate(val.startDate);
    const endStr = this.fromNgbDate(val.endDate);
    
    if (!startStr || !endStr) return;
    
    const newStart = new Date(startStr).getTime();
    const newEnd = new Date(endStr).getTime();

    if (newEnd < newStart) {
      this.overlapError.set('End date cannot be before the start date.');
      return;
    }

    const hasOverlap = this.workOrders().some(wo => {
      if (currentId && wo.docId === currentId) return false;
      if (wo.data.workCenterId !== wcId) return false;
      const exStart = new Date(wo.data.startDate).getTime();
      const exEnd = new Date(wo.data.endDate).getTime();
      return newStart <= exEnd && newEnd >= exStart;
    });

    if (hasOverlap) {
      this.overlapError.set('This timeline overlaps with an existing order in this Work Center.');
      return;
    }

    this.overlapError.set(null); 

    const finalData = {
      ...val,
      startDate: startStr,
      endDate: endStr,
      workCenterId: wcId!
    };

    if (currentId) {
      this.workOrders.update(orders => orders.map(wo => 
        wo.docId === currentId ? { ...wo, data: { ...wo.data, ...finalData } } : wo
      ));
    } else {
      this.workOrders.update(orders => [...orders, {
        docId: 'wo-' + Date.now(), 
        docType: 'workOrder',
        data: finalData
      }]);
    }
    this.closePanel();
  }

  deleteWorkOrder(docId: string) {
    this.workOrders.update(orders => orders.filter(wo => wo.docId !== docId));
    this.hoveredTask.set(null);
    this.activeMenuId.set(null);
    this.isPanelOpen.set(false);
    this.editingDocId.set(null);
  }

  isOverExistingOrder(workCenterId: string): boolean {
    const x = this.mouseX();
    const orders = this.getWorkOrdersForCenter(workCenterId);
    return orders.some(wo => {
      const left = this.getBarLeft(wo);
      const width = this.getBarWidth(wo);
      return x >= left && x <= (left + width);
    });
  }

  handleMouseMove(event: MouseEvent, rowIndex: string) {
    this.hoveredRowId.set(rowIndex);
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    this.mouseX.set(event.clientX - rect.left);
  }

  handleMouseLeave() {
    this.hoveredRowId.set(null);
  }

  handleTaskMouseMove(event: MouseEvent, wo: WorkOrderDocument) {
    this.hoveredTask.set(wo);
    this.mouseXClient.set(event.clientX);
    this.mouseYClient.set(event.clientY);
  }

  handleTaskMouseLeave() {
    this.hoveredTask.set(null);
  }

  timelineDates = computed<TimelineColumn[]>(() => {
    const scale = this.timescale();
    const columns: TimelineColumn[] = [];
    const baseDate = this.today();
    for (let i = this.leftOffsetIndex(); i <= this.rightOffsetIndex(); i++) {
      let d = new Date(baseDate);
      if (scale === 'month') {
        d = new Date(baseDate.getFullYear(), baseDate.getMonth() + i, 1);
        columns.push({ date: d, label: d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) });
      } else if (scale === 'week') {
        d.setDate(baseDate.getDate() - baseDate.getDay() + (i * 7));
        columns.push({ date: d, label: `Week of ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` });
      } else if (scale === 'day') {
        d.setDate(baseDate.getDate() + i);
        columns.push({ date: d, label: d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) });
      }
    }
    return columns;
  });

  isCurrentMonth(date: any): boolean {
    if (this.timescale() !== 'month') return false;
    const now = this.today();
    return date.date.getMonth() === now.getMonth() && date.date.getFullYear() === now.getFullYear();
  }

  getPixelPositionFromDate(dateInput: string | Date): number {
    let targetDate = (typeof dateInput === 'string') ? new Date(dateInput) : dateInput;
    if (!this.timelineDates().length) return 0;
    const firstDate = this.timelineDates()[0].date;
    const colWidth = this.columnWidth();

    if (this.timescale() === 'month') {
      const monthsDiff = (targetDate.getFullYear() - firstDate.getFullYear()) * 12 + (targetDate.getMonth() - firstDate.getMonth());
      const dayOffset = (targetDate.getDate() - 1) / new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0).getDate();
      return (monthsDiff + dayOffset) * colWidth;
    } 
    const diffDays = (targetDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24);
    return (this.timescale() === 'week') ? (diffDays / 7) * colWidth : diffDays * colWidth;
  }

  getDateFromPixelPosition(x: number): Date {
    if (!this.timelineDates().length) return new Date();
    
    const ref = this.timelineDates()[0].date;
    const firstDate = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate()); 
    
    const colWidth = this.columnWidth();
    const scale = this.timescale();

    if (scale === 'month') {
      const totalMonths = x / colWidth;
      const monthsDiff = Math.floor(totalMonths);
      const fraction = totalMonths - monthsDiff; 

      const targetYear = firstDate.getFullYear();
      const targetMonth = firstDate.getMonth() + monthsDiff;
      
      const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
      const targetDay = Math.round(fraction * daysInMonth) + 1;
      
      return new Date(targetYear, targetMonth, targetDay);
    } else {
      const diffDays = scale === 'week' ? (x / colWidth) * 7 : (x / colWidth);
      firstDate.setDate(firstDate.getDate() + Math.round(diffDays));
      return firstDate;
    }
  }

  currentDayPosition(): number { return this.getPixelPositionFromDate(this.today()); }
  getWorkOrdersForCenter(id: string) { return this.workOrders().filter(wo => wo.data.workCenterId === id); }
  getBarLeft(wo: any) { return this.getPixelPositionFromDate(wo.data.startDate); }
  getBarWidth(wo: any) { return Math.max(this.getPixelPositionFromDate(wo.data.endDate) - this.getPixelPositionFromDate(wo.data.startDate), 40); }
  getStatusClass(s: string) { return `status-${s}`; }
  
  formatStatusLabel(status: string): string {
    if (!status) return '';
    if (status === 'in-progress') return 'In progress';
    return status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ');
  }

  trackByWorkOrder(index: number, item: any): string {
    return item.docId;
  }

  trackByDate(index: number, date: Date): string {
    return date.toISOString();
  }
}