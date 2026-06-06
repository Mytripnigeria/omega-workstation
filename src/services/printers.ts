import { workstationApi } from './api';
import type {
  CreatePrinterInput,
  Printer,
  UpdatePrinterInput,
} from '@/types/printer';

export type PrintJobStatus = 'queued' | 'sent' | 'failed';

export interface PrintJob {
  id: string;
  printerId: string;
  storeId: string;
  type: 'test' | 'receipt' | 'kitchen' | 'bar' | 'label';
  payload: Record<string, unknown> | null;
  status: PrintJobStatus;
  attempts: number;
  lastError: string | null;
  sentAt: string | null;
  createdAt: string;
}

export const printersService = {
  list: (storeId?: string): Promise<Printer[]> => {
    const qs = storeId ? `?storeId=${encodeURIComponent(storeId)}` : '';
    return workstationApi.request<Printer[]>(`/printers${qs}`);
  },

  findOne: (id: string): Promise<Printer> => workstationApi.request<Printer>(`/printers/${id}`),

  create: (input: CreatePrinterInput): Promise<Printer> =>
    workstationApi.request<Printer>('/printers', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  update: (id: string, input: UpdatePrinterInput): Promise<Printer> =>
    workstationApi.request<Printer>(`/printers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),

  remove: (id: string): Promise<void> =>
    workstationApi.request<void>(`/printers/${id}`, { method: 'DELETE' }),

  /**
   * Triggers a test print. The backend attempts best-effort ESC/POS delivery
   * for network printers; for USB/Bluetooth/cloud printers the job is queued
   * for a downstream agent to pick up. The returned job row carries the
   * outcome (sent / failed / queued).
   */
  testPrint: (id: string): Promise<PrintJob> =>
    workstationApi.request<PrintJob>(`/printers/${id}/test`, { method: 'POST' }),

  listJobs: (
    id: string,
    opts: { status?: PrintJobStatus; limit?: number } = {},
  ): Promise<PrintJob[]> => {
    const qs = new URLSearchParams();
    if (opts.status) qs.set('status', opts.status);
    if (opts.limit) qs.set('limit', String(opts.limit));
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return workstationApi.request<PrintJob[]>(`/printers/${id}/jobs${suffix}`);
  },
};
