"use client";

import { useRealtimeAlerts } from "@/core/auth/useRealtimeAlerts";

export function RealtimeManager() {
  useRealtimeAlerts();
  return null;
}
