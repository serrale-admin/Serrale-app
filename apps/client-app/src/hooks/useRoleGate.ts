import { useQuery } from "@tanstack/react-query";
import { fetchMe } from "@serrale/api";

export function useRoleGate(enabled = true) {
  return useQuery({
    queryKey: ["client-role-gate"],
    queryFn: fetchMe,
    enabled
  });
}
