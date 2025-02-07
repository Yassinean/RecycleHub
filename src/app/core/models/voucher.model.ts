export interface VoucherOption {
  points: number;
  value: number;
  label: string;
}

export const VOUCHER_OPTIONS: VoucherOption[] = [
  { points: 100, value: 50, label: 'Bon d\'achat de 50 Dh' },
  { points: 200, value: 120, label: 'Bon d\'achat de 120 Dh' },
  { points: 500, value: 350, label: 'Bon d\'achat de 350 Dh' }
]; 