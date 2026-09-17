import { useQuery } from "@tanstack/react-query";
import type { MeUserData } from "@/lib/backend";

export function useAccount(enabled: boolean) {
  return useQuery({
    queryKey: ["account"],
    queryFn: async (): Promise<MeUserData> => {
      const res = await fetch("/api/auth/me");
      if (!res.ok) throw new Error("Gagal memuat akun");
      const body = await res.json();
      return body.data;
    },
    enabled,
  });
}
