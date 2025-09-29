import { Timestamp } from "firebase-admin/firestore";

export function sanitizeForClient<T = any>(value: any): T {
  // 1) Timestamps de Firestore
  if (value instanceof Timestamp) {
    return value.toMillis() as T;
  }

  // 2) Dates nativas
  if (value instanceof Date) {
    return value.toISOString() as T;
  }

  // 3) Arrays
  if (Array.isArray(value)) {
    return value.map((v) => sanitizeForClient(v)) as T;
  }

  // 4) Objetos (evitar null prototypes / clases)
  if (value && typeof value === "object") {
    // reconstruye con {} para asegurar prototipo plano
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = sanitizeForClient(v);
    }
    return out as T;
  }

  // 5) Primitivos y null/undefined
  return value as T;
}