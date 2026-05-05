import { workstationApi } from './api';
import type {
  CreatePrinterInput,
  Printer,
  UpdatePrinterInput,
} from '@/types/printer';

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
};
