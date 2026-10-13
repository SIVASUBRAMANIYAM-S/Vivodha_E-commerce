import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';

export type PincodeServiceability = {
  serviceable: boolean;
  mode: 'own_delivery' | 'courier';
  etaText: string;
  codAvailable: boolean;
  minOrderPaise: number;
};

/** check_pincode (migration 14) returns a one-row set; no match means unserviceable. */
export async function checkPincode(pincode: string): Promise<PincodeServiceability | null> {
  const { data, error } = await supabase.rpc('check_pincode', { p_pincode: pincode });
  if (error) throw error;
  const row = data?.[0];
  if (!row) return null;
  return {
    serviceable: row.serviceable,
    mode: row.mode,
    etaText: row.eta_text,
    codAvailable: row.cod_available,
    minOrderPaise: row.min_order_paise,
  };
}

export function useCheckPincode(pincode: string | null) {
  return useQuery({
    queryKey: ['check-pincode', pincode],
    queryFn: () => checkPincode(pincode!),
    enabled: pincode !== null,
    staleTime: 0,
    gcTime: 0,
  });
}
