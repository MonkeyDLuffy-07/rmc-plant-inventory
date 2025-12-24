// lib/storage.ts - Data layer connecting Next.js components to FastAPI

const API_BASE = "http://localhost:8000";

// ============ Type Definitions ============

export interface Material {
  id: string;
  name: string;
  category: string;
  unit: string;
  currentStock: number;
  minStockLevel: number;
  maxStockLevel: number;
  unitPrice: number;
  supplier: string;
  location: string;
  lastUpdated: string;
}

export interface Supplier {
  id: string;
  name: string;
  isActive: boolean;
  rating: number;
  phone: string;
  contactPerson: string;
  email: string;
  address: string;
  materials: string[];
}

export interface Transaction {
  id: string;
  materialId: string;
  materialName: string;
  type: "in" | "out";
  quantity: number;
  referenceNumber: string;
  supplier?: string;
  notes?: string;
  createdAt: string;
  createdBy: string;
}

export interface Alert {
  id: string;
  materialId: string;
  materialName: string;
  category: string;
  currentStock: number;
  minStock: number;
  unit: string;
  severity: "high" | "medium" | "low";
  message: string;
  type: "low_stock" | "out_of_stock";
  createdAt: string;
  isRead: boolean;
}

export interface User {
  id: string;
  username: string;
  role: "admin" | "operator";
  name: string;
}

// ============ Materials API ============

export async function getMaterials(): Promise<Material[]> {
  try {
    const res = await fetch(`${API_BASE}/api/materials`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error("Failed to fetch materials");
    const list = await res.json();
    return list.map((m: any): Material => ({
      id: m.id,
      name: m.name,
      category: m.category,
      unit: m.unit,
      currentStock: m.quantity,
      minStockLevel: m.minquantity,
      maxStockLevel: m.minquantity * 2,
      unitPrice: m.price,
      supplier: m.supplier,
      location: m.location,
      lastUpdated: m.lastupdated,
    }));
  } catch (e) {
    console.error("getMaterials error:", e);
    return [];
  }
}

export async function getMaterial(id: string): Promise<Material | null> {
  try {
    const res = await fetch(`${API_BASE}/api/materials/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) return null;
    const m = await res.json();
    return {
      id: m.id,
      name: m.name,
      category: m.category,
      unit: m.unit,
      currentStock: m.quantity,
      minStockLevel: m.minquantity,
      maxStockLevel: m.minquantity * 2,
      unitPrice: m.price,
      supplier: m.supplier,
      location: m.location,
      lastUpdated: m.lastupdated,
    };
  } catch (e) {
    console.error("getMaterial error:", e);
    return null;
  }
}

export async function createMaterial(data: {
  name: string;
  category: string;
  unit: string;
  currentStock: number;
  minStockLevel: number;
  unitPrice: number;
  supplier: string;
  location: string;
}): Promise<Material | null> {
  try {
    const payload = {
      name: data.name,
      category: data.category,
      unit: data.unit,
      quantity: data.currentStock,
      minquantity: data.minStockLevel,
      price: data.unitPrice,
      supplier: data.supplier,
      location: data.location,
    };

    const res = await fetch(`${API_BASE}/api/materials`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("Failed to create material");
    const m = await res.json();
    return {
      id: m.id,
      name: m.name,
      category: m.category,
      unit: m.unit,
      currentStock: m.quantity,
      minStockLevel: m.minquantity,
      maxStockLevel: m.minquantity * 2,
      unitPrice: m.price,
      supplier: m.supplier,
      location: m.location,
      lastUpdated: m.lastupdated,
    };
  } catch (e) {
    console.error("createMaterial error:", e);
    return null;
  }
}

export async function updateMaterial(
  id: string,
  data: Partial<{
    name: string;
    category: string;
    unit: string;
    currentStock: number;
    minStockLevel: number;
    unitPrice: number;
    supplier: string;
    location: string;
  }>,
): Promise<Material | null> {
  try {
    const payload: any = {};
    if (data.name) payload.name = data.name;
    if (data.category) payload.category = data.category;
    if (data.unit) payload.unit = data.unit;
    if (data.currentStock !== undefined) payload.quantity = data.currentStock;
    if (data.minStockLevel !== undefined)
      payload.minquantity = data.minStockLevel;
    if (data.unitPrice !== undefined) payload.price = data.unitPrice;
    if (data.supplier) payload.supplier = data.supplier;
    if (data.location) payload.location = data.location;

    const res = await fetch(`${API_BASE}/api/materials/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("Failed to update material");
    const m = await res.json();
    return {
      id: m.id,
      name: m.name,
      category: m.category,
      unit: m.unit,
      currentStock: m.quantity,
      minStockLevel: m.minquantity,
      maxStockLevel: m.minquantity * 2,
      unitPrice: m.price,
      supplier: m.supplier,
      location: m.location,
      lastUpdated: m.lastupdated,
    };
  } catch (e) {
    console.error("updateMaterial error:", e);
    return null;
  }
}

export async function deleteMaterial(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/materials/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });
    return res.ok;
  } catch (e) {
    console.error("deleteMaterial error:", e);
    return false;
  }
}

// ============ Suppliers API ============

export async function getSuppliers(): Promise<Supplier[]> {
  try {
    const res = await fetch(`${API_BASE}/api/suppliers`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error("Failed to fetch suppliers");
    const list = await res.json();
    return list.map((s: any): Supplier => ({
      id: s.id,
      name: s.name,
      isActive: s.active,
      rating: s.rating,
      phone: s.phone,
      contactPerson: s.contactperson,
      email: s.email,
      address: s.address,
      materials:
        typeof s.materials === "string"
          ? s.materials.split(",").map((m: string) => m.trim())
          : [],
    }));
  } catch (e) {
    console.error("getSuppliers error:", e);
    return [];
  }
}

export async function createSupplier(data: {
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  materials: string[];
  rating: number;
  isActive: boolean;
}): Promise<Supplier | null> {
  try {
    const payload = {
      name: data.name,
      contactperson: data.contactPerson,
      email: data.email,
      phone: data.phone,
      address: data.address,
      materials: data.materials.join(","),
      rating: data.rating,
      active: data.isActive,
    };

    const res = await fetch(`${API_BASE}/api/suppliers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to create supplier");
    const s = await res.json();
    return {
      id: s.id,
      name: s.name,
      isActive: s.active,
      rating: s.rating,
      phone: s.phone,
      contactPerson: s.contactperson,
      email: s.email,
      address: s.address,
      materials:
        typeof s.materials === "string"
          ? s.materials.split(",").map((m: string) => m.trim())
          : [],
    };
  } catch (e) {
    console.error("createSupplier error:", e);
    return null;
  }
}

export async function updateSupplier(
  id: string,
  data: Partial<{
    name: string;
    contactPerson: string;
    email: string;
    phone: string;
    address: string;
    materials: string[];
    rating: number;
    isActive: boolean;
  }>,
): Promise<Supplier | null> {
  try {
    const payload: any = {};
    if (data.name) payload.name = data.name;
    if (data.contactPerson) payload.contactperson = data.contactPerson;
    if (data.email) payload.email = data.email;
    if (data.phone) payload.phone = data.phone;
    if (data.address) payload.address = data.address;
    if (data.materials)
      payload.materials = data.materials.join(",");
    if (data.rating !== undefined) payload.rating = data.rating;
    if (data.isActive !== undefined) payload.active = data.isActive;

    const res = await fetch(`${API_BASE}/api/suppliers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to update supplier");
    const s = await res.json();
    return {
      id: s.id,
      name: s.name,
      isActive: s.active,
      rating: s.rating,
      phone: s.phone,
      contactPerson: s.contactperson,
      email: s.email,
      address: s.address,
      materials:
        typeof s.materials === "string"
          ? s.materials.split(",").map((m: string) => m.trim())
          : [],
    };
  } catch (e) {
    console.error("updateSupplier error:", e);
    return null;
  }
}

export async function deleteSupplier(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/suppliers/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });
    return res.ok;
  } catch (e) {
    console.error("deleteSupplier error:", e);
    return false;
  }
}

// ============ Transactions API ============

export async function getTransactions(): Promise<Transaction[]> {
  try {
    const res = await fetch(`${API_BASE}/api/transactions`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error("Failed to fetch transactions");
    const list = await res.json();
    return list.map((t: any): Transaction => ({
      id: t.id,
      materialId: t.materialid,
      materialName: t.materialname,
      type: t.type as "in" | "out",
      quantity: t.quantity,
      referenceNumber: t.reference,
      supplier: t.supplier,
      notes: t.notes,
      createdAt: t.date,
      createdBy: t.user,
    }));
  } catch (e) {
    console.error("getTransactions error:", e);
    return [];
  }
}

export async function createTransaction(data: {
  materialId: string;
  materialName: string;
  type: "in" | "out";
  quantity: number;
  referenceNumber: string;
  supplier?: string;
  notes?: string;
  createdBy: string;
}): Promise<Transaction | null> {
  try {
    const payload = {
      materialid: data.materialId,
      materialname: data.materialName,
      type: data.type,
      quantity: data.quantity,
      reference: data.referenceNumber,
      supplier: data.supplier,
      notes: data.notes,
      user: data.createdBy,
    };

    const res = await fetch(`${API_BASE}/api/transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to create transaction");
    const t = await res.json();
    return {
      id: t.id,
      materialId: t.materialid,
      materialName: t.materialname,
      type: t.type as "in" | "out",
      quantity: t.quantity,
      referenceNumber: t.reference,
      supplier: t.supplier,
      notes: t.notes,
      createdAt: t.date,
      createdBy: t.user,
    };
  } catch (e) {
    console.error("createTransaction error:", e);
    return null;
  }
}

// ============ Alerts API ============

export async function getAlerts(): Promise<Alert[]> {
  try {
    const res = await fetch(`${API_BASE}/api/alerts`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error("Failed to fetch alerts");
    const list = await res.json();
    return list.map((a: any): Alert => ({
      id: a.id,
      materialId: a.materialid,
      materialName: a.materialname,
      category: a.category,
      currentStock: a.currentstock,
      minStock: a.minstock,
      unit: a.unit,
      severity: a.severity as "high" | "medium" | "low",
      message: `${a.materialname}: ${a.currentstock} ${a.unit} (Min: ${a.minstock})`,
      type: a.currentstock === 0 ? "out_of_stock" : "low_stock",
      createdAt: a.date,
      isRead: false,
    }));
  } catch (e) {
    console.error("getAlerts error:", e);
    return [];
  }
}

// ============ Local alert read-state helpers ============

const alertsStorageKey = "rmc_alerts_read";

export function markAlertAsRead(id: string): void {
  try {
    const stored = localStorage.getItem(alertsStorageKey);
    const read: string[] = stored ? JSON.parse(stored) : [];
    if (!read.includes(id)) read.push(id);
    localStorage.setItem(alertsStorageKey, JSON.stringify(read));
  } catch {
    // ignore
  }
}

export function deleteAlert(id: string): void {
  try {
    const stored = localStorage.getItem(alertsStorageKey);
    const read: string[] = stored ? JSON.parse(stored) : [];
    localStorage.setItem(
      alertsStorageKey,
      JSON.stringify(read.filter((x) => x !== id)),
    );
  } catch {
    // ignore
  }
}

export function isAlertRead(id: string): boolean {
  try {
    const stored = localStorage.getItem(alertsStorageKey);
    const read: string[] = stored ? JSON.parse(stored) : [];
    return read.includes(id);
  } catch {
    return false;
  }
}
