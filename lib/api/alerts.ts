import { insforge } from "@/lib/insforge";

export interface SafetyAlertItem {
  id: string;
  worker: string;
  type: string;
  severity: "critical" | "medium" | "low";
  message: string;
  time: string;
  screenshot_url?: string | null;
  status: "new" | "acknowledged" | "resolved";
}

export async function fetchAllAlerts(severityFilter?: string): Promise<SafetyAlertItem[]> {
  try {
    let query = insforge
      .database
      .from("alerts")
      .select("*")
      .order("created_at", { ascending: false });

    if (severityFilter && severityFilter !== "All") {
      query = query.eq("severity", severityFilter);
    }

    const { data, error } = await query;

    if (error) {
      console.warn("fetchAllAlerts database error:", error);
    }

    if (data && data.length > 0) {
      return data.map((a, idx) => ({
        id: a.id || `alt-${idx}`,
        worker: a.message ? a.message.split("•")[0] : `Worker #${idx + 101}`,
        type: a.alert_type || "Safety Alert",
        severity: (a.severity === "Critical"
          ? "critical"
          : a.severity === "Advisory" || a.severity === "medium"
          ? "medium"
          : "low") as "critical" | "medium" | "low",
        message: a.message || "Safety event triggered in operations center.",
        screenshot_url: a.screenshot_url || null,
        time: a.created_at
          ? new Date(a.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          : "10:42 AM",
        status: (a.status === "Acknowledged"
          ? "acknowledged"
          : a.status === "Resolved"
          ? "resolved"
          : "new") as "new" | "acknowledged" | "resolved",
      }));
    }

    // Default fallback alerts if database table empty
    return [
      {
        id: "ALT-101",
        worker: "David Okafor (#ID-11028)",
        type: "High Fatigue",
        severity: "critical",
        message: "Continuous microsleep indicators detected on Assembly A-01.",
        time: "10:42 AM",
        status: "new",
      },
      {
        id: "ALT-102",
        worker: "Zone 12 Sensor",
        type: "Heat Stress Warning",
        severity: "medium",
        message: "Environmental sensor threshold exceeded 95°F in Sector B.",
        time: "09:15 AM",
        status: "acknowledged",
      },
      {
        id: "ALT-103",
        worker: "Gate 4 Camera",
        type: "PPE Detection Fault",
        severity: "low",
        message: "Safety helmet detection unverified for incoming technician.",
        time: "08:30 AM",
        status: "resolved",
      },
    ];
  } catch (err) {
    console.error("fetchAllAlerts exception:", err);
    return [];
  }
}

export async function updateAlertStatus(
  alertId: string,
  newStatus: "Acknowledged" | "Resolved"
): Promise<void> {
  const { error } = await insforge
    .database
    .from("alerts")
    .update({ status: newStatus })
    .eq("id", alertId);

  if (error) {
    console.error("Failed to update alert status in InsForge database:", error);
    throw new Error(error.message || "Failed to update alert status.");
  }
}

/**
 * Subscribe to live InsForge Realtime changes on public.alerts table
 */
export function subscribeToRealtimeAlerts(onNewAlert: (alert: SafetyAlertItem) => void) {
  try {
    const realtimeClient = insforge.realtime as any;
    if (typeof realtimeClient?.channel === "function") {
      const channel = realtimeClient.channel("public:alerts");
      channel
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "alerts" }, (payload: any) => {
          if (payload && payload.new) {
            const a = payload.new;
            const alertItem: SafetyAlertItem = {
              id: a.id,
              worker: a.message ? a.message.split("•")[0] : "Worker",
              type: a.alert_type || "Safety Alert",
              severity: (a.severity === "Critical" ? "critical" : a.severity === "Advisory" || a.severity === "medium" ? "medium" : "low"),
              message: a.message || "Live safety event detected.",
              screenshot_url: a.screenshot_url || null,
              time: a.created_at ? new Date(a.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Just Now",
              status: "new",
            };
            onNewAlert(alertItem);
          }
        })
        .subscribe();

      return () => {
        try {
          if (typeof realtimeClient?.removeChannel === "function") {
            realtimeClient.removeChannel(channel);
          } else if (typeof channel?.unsubscribe === "function") {
            channel.unsubscribe();
          }
        } catch (e) {
          // cleanup ignore
        }
      };
    } else if (typeof realtimeClient?.subscribe === "function") {
      realtimeClient.subscribe("alerts");
      const listener = (msg: any) => {
        if (msg && msg.payload) {
          const a = msg.payload;
          onNewAlert({
            id: a.id || `alt-${Date.now()}`,
            worker: a.message ? a.message.split("•")[0] : "Worker",
            type: a.alert_type || "Safety Alert",
            severity: (a.severity === "Critical" ? "critical" : a.severity === "Advisory" || a.severity === "medium" ? "medium" : "low"),
            message: a.message || "Live safety event detected.",
            screenshot_url: a.screenshot_url || null,
            time: a.created_at ? new Date(a.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Just Now",
            status: "new",
          });
        }
      };
      if (typeof realtimeClient?.on === "function") {
        realtimeClient.on("INSERT", listener);
      }
      return () => {
        try {
          if (typeof realtimeClient?.off === "function") {
            realtimeClient.off("INSERT", listener);
          }
          realtimeClient.unsubscribe("alerts");
        } catch (e) {
          // cleanup
        }
      };
    }

    return () => {};
  } catch (err) {
    console.warn("InsForge Realtime subscription warning:", err);
    return () => {};
  }
}

