import { AdminSummary } from "@/types/admin";
import { apiRequest } from "./client";
import { mapAdminSummary } from "./mappers";

export async function getAdminSummary(token: string): Promise<AdminSummary> {
  const data = await apiRequest<unknown>("/admin/summary/", { token });
  return mapAdminSummary(data);
}
