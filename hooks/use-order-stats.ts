import { useQuery } from "@tanstack/react-query";
import type { OrderStatsData } from "@/lib/backend";

export function useOrderStats(enabled: boolean) {
  return useQuery({
    queryKey: ["order-stats"],
    queryFn: async (): Promise<OrderStatsData> => {
      const res = await fetch("/api/order/history/stats");
      if (!res.ok) throw new Error("Gagal memuat statistik pesanan");
      const body = await res.json();
      return body.data;
    },
    enabled,
  });
}
