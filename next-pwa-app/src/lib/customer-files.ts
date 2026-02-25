"use client";

export type CustomerFile = {
  lastName: string;
  createdAt: string;
  updatedAt: string;
  survey: unknown;
  photos: unknown;
  video: unknown;
};

export type CustomerRegistryEntry = {
  id: string;
  lastName: string;
  createdAt: string;
  updatedAt: string;
};

const REGISTRY_KEY = "ezapp_customer_registry_v1";
const CURRENT_CUSTOMER_KEY = "ezapp_current_customer_v1";

const normalizeCustomerId = (value: string) => value.trim().toUpperCase();

function canUseStorage() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function readRegistry(): CustomerRegistryEntry[] {
  if (!canUseStorage()) return [];
  const raw = localStorage.getItem(REGISTRY_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as CustomerRegistryEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeRegistry(registry: CustomerRegistryEntry[]) {
  if (!canUseStorage()) return;
  localStorage.setItem(REGISTRY_KEY, JSON.stringify(registry));
}

export function listCustomerFiles(): CustomerRegistryEntry[] {
  return readRegistry().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getCurrentCustomerId(): string | null {
  if (!canUseStorage()) return null;
  return localStorage.getItem(CURRENT_CUSTOMER_KEY) || localStorage.getItem("currentCustomer");
}

export function setCurrentCustomer(id: string) {
  if (!canUseStorage()) return;
  const normalizedId = normalizeCustomerId(id);
  localStorage.setItem(CURRENT_CUSTOMER_KEY, normalizedId);
  localStorage.setItem("currentCustomer", normalizedId);
}

export function getCustomerFile(id: string): CustomerFile | null {
  if (!canUseStorage()) return null;
  const normalizedId = normalizeCustomerId(id);
  const raw = localStorage.getItem(`customer_${normalizedId}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CustomerFile;
  } catch {
    return null;
  }
}

export function upsertCustomerFile(lastName: string, data?: Partial<CustomerFile>) {
  if (!canUseStorage()) return null;

  const normalizedId = normalizeCustomerId(lastName);
  if (!normalizedId) return null;

  const now = new Date().toISOString();
  const existing = getCustomerFile(normalizedId);
  const next: CustomerFile = {
    survey: existing?.survey ?? null,
    photos: existing?.photos ?? null,
    video: existing?.video ?? null,
    ...data,
    lastName: normalizedId,
    updatedAt: now,
    createdAt: existing?.createdAt || data?.createdAt || now,
  };

  localStorage.setItem(`customer_${normalizedId}`, JSON.stringify(next));
  setCurrentCustomer(normalizedId);

  const registry = readRegistry();
  const idx = registry.findIndex((entry) => entry.id === normalizedId);
  const entry: CustomerRegistryEntry = {
    id: normalizedId,
    lastName: normalizedId,
    createdAt: next.createdAt,
    updatedAt: next.updatedAt,
  };

  if (idx >= 0) {
    registry[idx] = entry;
  } else {
    registry.push(entry);
  }
  writeRegistry(registry);
  return next;
}

export function importCustomerFile(raw: unknown): CustomerFile | null {
  if (!raw || typeof raw !== "object") return null;
  const candidate = raw as Partial<CustomerFile>;
  if (!candidate.lastName || typeof candidate.lastName !== "string") return null;
  return upsertCustomerFile(candidate.lastName, candidate);
}

export function buildCustomerExport(id: string): string | null {
  if (!canUseStorage()) return null;
  const normalizedId = normalizeCustomerId(id);
  const customer = getCustomerFile(normalizedId);
  if (!customer) return null;

  const exportData = {
    customer,
    tools: {
      survey: localStorage.getItem(`survey_${normalizedId}`),
      photos: localStorage.getItem(`photos_${normalizedId}`),
      fourSquare: localStorage.getItem(`foursquare_${normalizedId}`),
      measurements: localStorage.getItem(`measurements_${normalizedId}`),
      postSaleChecklist: localStorage.getItem(`postSaleChecklist_${normalizedId}`),
    },
    exportedAt: new Date().toISOString(),
    app: "EZAPP",
  };
  return JSON.stringify(exportData, null, 2);
}
