import { useQuery } from '@tanstack/react-query';
import { payslipsService, type PayslipFilter } from '@/services/payslips';

export function useMyPayslips(filter: PayslipFilter = {}) {
  return useQuery({
    queryKey: ['payslips', 'my', filter],
    queryFn: () => payslipsService.myPayslips(filter),
    staleTime: 60 * 1000,
  });
}
