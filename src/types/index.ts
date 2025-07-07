export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "super_admin" | "tenant_admin" | "user";
  tenantId?: string;
}

export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  mapData: string; // SVG content
  createdAt: Date;
  updatedAt: Date;
}

export interface Event {
  id: string;
  name: string;
  locationName: string;
  type: "open" | "closed";
  tenantId: string;
  shareableLink: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Registration {
  id: string;
  eventId: string;
  name: string;
  email: string;
  phone: string;
  status: "pending" | "approved" | "rejected";
  qrCode?: string;
  isUsed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface TenantContext {
  tenant: Tenant | null;
  subdomain: string | null;
}

export interface QRCodeData {
  registrationId: string;
  eventId: string;
  userId: string;
  timestamp: number;
}
