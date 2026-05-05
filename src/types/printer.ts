// Mirrors backend PrinterResponseDto.
export type PrinterType = 'kitchen' | 'receipt' | 'bar' | 'label';
export type PrinterConnection = 'network' | 'usb' | 'bluetooth' | 'cloud';

export interface Printer {
  id: string;
  storeId: string;
  name: string;
  type: PrinterType;
  connection: PrinterConnection;
  address: string | null;
  config: Record<string, unknown> | null;
  isActive: boolean;
  lastSeenAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePrinterInput {
  storeId: string;
  name: string;
  type: PrinterType;
  connection: PrinterConnection;
  address?: string;
  config?: Record<string, unknown>;
  isActive?: boolean;
}

export interface UpdatePrinterInput {
  name?: string;
  type?: PrinterType;
  connection?: PrinterConnection;
  address?: string;
  config?: Record<string, unknown>;
  isActive?: boolean;
}
