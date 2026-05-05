const API_URL = import.meta.env.VITE_API_URL as string;

const TOKEN_KEY = 'workstation_token';
const STAFF_KEY = 'workstation_staff';

export interface WorkstationStaff {
  id: string;
  staffCode: string;
  firstName: string;
  lastName: string;
  roleId: string;
  roleName: string;
  storeId: string;
  permissions: string[];
}

export const workstationAuth = {
  getToken: () => sessionStorage.getItem(TOKEN_KEY),
  setSession: (token: string, staff: WorkstationStaff) => {
    sessionStorage.setItem(TOKEN_KEY, token);
    sessionStorage.setItem(STAFF_KEY, JSON.stringify(staff));
  },
  getStaff: (): WorkstationStaff | null => {
    const raw = sessionStorage.getItem(STAFF_KEY);
    return raw ? (JSON.parse(raw) as WorkstationStaff) : null;
  },
  clear: () => {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(STAFF_KEY);
  },
  isAuthenticated: () => !!sessionStorage.getItem(TOKEN_KEY),
};

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = workstationAuth.getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(body.message ?? `HTTP ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  const json = await res.json();
  return json.data as T;
}

export const workstationApi = { request };
