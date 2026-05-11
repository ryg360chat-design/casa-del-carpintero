type SecurityEvent = {
  ts: string;
  ip: string;
  tipo: "success" | "failed" | "blocked";
  detalle: string;
};

export const securityEvents: SecurityEvent[] = [];

export function logSecurityEvent(
  ip: string,
  tipo: "success" | "failed" | "blocked",
  detalle: string
) {
  securityEvents.unshift({ ts: new Date().toISOString(), ip, tipo, detalle });
  if (securityEvents.length > 200) securityEvents.length = 200;
}
