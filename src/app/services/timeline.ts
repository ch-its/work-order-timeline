import { Injectable, signal } from '@angular/core';

export type WorkOrderStatus = 'open' | 'in-progress' | 'complete' | 'blocked';

export interface WorkCenterDocument {
  docId: string;
  docType: 'workCenter';
  data: { name: string; };
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

@Injectable({ providedIn: 'root' })
export class TimelineService {
  // Hardcoded Work Centers (Left Column)
  workCenters = signal<WorkCenterDocument[]>([
    { docId: 'wc-1', docType: 'workCenter', data: { name: 'Genesis Hardware' } },
    { docId: 'wc-2', docType: 'workCenter', data: { name: 'Rodriques Electrics' } },
    { docId: 'wc-3', docType: 'workCenter', data: { name: 'Konsulting Inc' } },
    { docId: 'wc-4', docType: 'workCenter', data: { name: 'McMarrow Distribution' } },
    { docId: 'wc-5', docType: 'workCenter', data: { name: 'Spartan Manufacturing' } },
    { docId: 'wc-6', docType: 'workCenter', data: { name: 'Packaging & Shipping' } },
    { docId: 'wc-7', docType: 'workCenter', data: { name: 'Maintenance Bay' } }
  ]);

  // Hardcoded Work Orders (The Timeline Bars)
  workOrders = signal<WorkOrderDocument[]>([
    { docId: 'wo-1', docType: 'workOrder', data: { name: 'Batch 1001', workCenterId: 'wc-1', status: 'complete', startDate: '2024-09-15', endDate: '2024-10-05' } },
    { docId: 'wo-2', docType: 'workOrder', data: { name: 'Batch 1002', workCenterId: 'wc-1', status: 'open', startDate: '2024-11-01', endDate: '2024-11-20' } },
    { docId: 'wo-3', docType: 'workOrder', data: { name: 'Milling A', workCenterId: 'wc-3', status: 'in-progress', startDate: '2024-08-20', endDate: '2024-09-25' } },
    { docId: 'wo-4', docType: 'workOrder', data: { name: 'Milling B', workCenterId: 'wc-3', status: 'in-progress', startDate: '2024-10-10', endDate: '2024-11-15' } },
    { docId: 'wo-5', docType: 'workOrder', data: { name: 'Assembly Sub-A', workCenterId: 'wc-4', status: 'blocked', startDate: '2024-09-20', endDate: '2024-12-05' } },
    { docId: 'wo-6', docType: 'workOrder', data: { name: 'QA Check 1', workCenterId: 'wc-5', status: 'complete', startDate: '2024-08-10', endDate: '2024-08-30' } },
    { docId: 'wo-7', docType: 'workOrder', data: { name: 'QA Check 2', workCenterId: 'wc-5', status: 'in-progress', startDate: '2024-09-05', endDate: '2024-09-15' } },
    { docId: 'wo-8', docType: 'workOrder', data: { name: 'Pack Order 50', workCenterId: 'wc-2', status: 'open', startDate: '2024-10-01', endDate: '2024-10-25' } },
    { docId: 'wo-9', docType: 'workOrder', data: { name: 'Packaging Run Q1', workCenterId: 'wc-6', status: 'complete', startDate: '2026-01-15', endDate: '2026-03-20' } },
    { docId: 'wo-10', docType: 'workOrder', data: { name: 'Packaging Run Q2', workCenterId: 'wc-6', status: 'open', startDate: '2026-04-01', endDate: '2026-06-30' } },
    { docId: 'wo-11', docType: 'workOrder', data: { name: 'Routine Calibration', workCenterId: 'wc-7', status: 'blocked', startDate: '2026-03-05', endDate: '2026-03-15' } },
    { docId: 'wo-12', docType: 'workOrder', data: { name: 'Emergency Repair', workCenterId: 'wc-7', status: 'in-progress', startDate: '2026-03-20', endDate: '2026-04-05' } }
  ]);
}