import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { printersService } from '@/services/printers';
import type { CreatePrinterInput, UpdatePrinterInput } from '@/types/printer';

export function usePrinters(storeId?: string) {
  return useQuery({
    queryKey: ['printers', storeId ?? 'all'],
    queryFn: () => printersService.list(storeId),
    staleTime: 60 * 1000,
  });
}

export function useCreatePrinter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePrinterInput) => printersService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['printers'] }),
  });
}

export function useUpdatePrinter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePrinterInput }) =>
      printersService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['printers'] }),
  });
}

export function useDeletePrinter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => printersService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['printers'] }),
  });
}
