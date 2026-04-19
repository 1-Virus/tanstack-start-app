/**
 * api.ts — TBVision AI Frontend
 * Central API client for all backend communication.
 */

const API_BASE = "https://tb-detection-using-cnn.onrender.com";

// ── Token helpers ────────────────────────────────────────────

export function getToken(): string | null {
  return localStorage.getItem("tbvision_token");
}

export function setToken(token: string): void {
  localStorage.setItem("tbvision_token", token);
}

export function clearToken(): void {
  localStorage.removeItem("tbvision_token");
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ── Generic fetch wrapper ────────────────────────────────────

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...authHeaders(),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Request failed (${res.status})`);
  }

  return res.json();
}

// ── Auth ─────────────────────────────────────────────────────

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  full_name: string;
  hospital: string;
  role: string;
}

interface TokenResponse {
  access_token: string;
  token_type: string;
}

export async function login(
  username: string,
  password: string
): Promise<UserResponse> {
  // Backend uses OAuth2 form-encoded login
  const form = new URLSearchParams();
  form.append("username", username);
  form.append("password", password);

  const tokenData = await request<TokenResponse>("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString(),
  });

  setToken(tokenData.access_token);
  return getMe();
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  full_name: string;
  hospital: string;
}

export async function register(data: RegisterData): Promise<{ message: string }> {
  return request<{ message: string }>("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function getMe(): Promise<UserResponse> {
  return request<UserResponse>("/api/auth/me");
}

// ── Scans ────────────────────────────────────────────────────

export interface AnalyzeResponse {
  scan_id: string;
  result: string;
  confidence: number;
  quality: {
    overall_ok: boolean;
    [key: string]: unknown;
  };
  heatmap_base64?: string;
}

export async function analyzeScan(
  file: File,
  patient: {
    name: string;
    age: string;
    gender: string;
    patientId: string;
  }
): Promise<AnalyzeResponse> {
  const form = new FormData();
  form.append("file", file);
  form.append("patient_name", patient.name);
  form.append("patient_age", patient.age);
  form.append("patient_gender", patient.gender);
  form.append("patient_id", patient.patientId);

  const res = await fetch(`${API_BASE}/api/scans/analyze`, {
    method: "POST",
    headers: authHeaders(),
    body: form,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Analysis failed (${res.status})`);
  }

  return res.json();
}

export interface ScanRecord {
  id: number;
  user_id: number;
  scan_id: string;
  timestamp: string;
  filename: string;
  result: string;
  confidence: string;
  raw_score: string;
  quality: string;
  patient_name: string;
  patient_age: string;
  patient_gender: string;
  patient_id: string;
  doctor_name: string;
  hospital_name: string;
}

export async function getHistory(): Promise<ScanRecord[]> {
  return request<ScanRecord[]>("/api/scans/history");
}

export async function clearHistory(): Promise<{ message: string }> {
  return request<{ message: string }>("/api/scans/history", {
    method: "DELETE",
  });
}

// ── PDF ──────────────────────────────────────────────────────

export async function downloadPdf(
  scanId: string,
  file: File,
  patient: {
    name: string;
    age: string;
    gender: string;
    patientId: string;
  }
): Promise<Blob> {
  const form = new FormData();
  form.append("file", file);
  form.append("patient_name", patient.name);
  form.append("patient_age", patient.age);
  form.append("patient_gender", patient.gender);
  form.append("patient_id", patient.patientId);

  const res = await fetch(`${API_BASE}/api/scans/${scanId}/pdf`, {
    method: "POST",
    headers: authHeaders(),
    body: form,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `PDF generation failed (${res.status})`);
  }

  return res.blob();
}

// ── Admin ────────────────────────────────────────────────────

export interface AdminUserStats {
  id: number;
  username: string;
  email: string;
  full_name: string;
  hospital: string;
  role: string;
  created_at: string;
  total_scans: number;
  tb_positive: number;
}

export async function getAdminStats(): Promise<AdminUserStats[]> {
  return request<AdminUserStats[]>("/api/auth/admin/stats");
}
