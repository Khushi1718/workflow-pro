// API Client for WorkFlow Pro Backend
const API_BASE_URL = "http://localhost:5123/api";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    total: number;
    limit: number;
    skip: number;
    page: number;
  };
}

// Get auth token from localStorage
export const getAuthToken = (): string | null => {
  return localStorage.getItem("authToken");
};

// Set auth token in localStorage
export const setAuthToken = (token: string) => {
  localStorage.setItem("authToken", token);
};

// Remove auth token from localStorage
export const removeAuthToken = () => {
  localStorage.removeItem("authToken");
};

// Make API request with auth token
const apiRequest = async <T,>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || data.error || "API request failed");
  }

  return data;
};

// ===== AUTH API =====
export const auth = {
  register: async (
    name: string,
    email: string,
    password: string,
    role: "admin" | "employee" = "employee",
    team: string = ""
  ) => {
    return apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password, role, team }),
    });
  },

  login: async (email: string, password: string) => {
    const response = await apiRequest<{ token: string; user: any }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (response.data?.token) {
      setAuthToken(response.data.token);
    }
    return response;
  },

  getProfile: async () => {
    return apiRequest("/auth/profile");
  },

  updateProfile: async (name: string, email: string, team: string) => {
    return apiRequest("/auth/profile", {
      method: "PUT",
      body: JSON.stringify({ name, email, team }),
    });
  },

  updatePassword: async (currentPassword: string, newPassword: string) => {
    return apiRequest("/auth/password", {
      method: "PUT",
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  logout: () => {
    removeAuthToken();
  },
};

// ===== WORK LOG API =====
export const workLogs = {
  create: async (logData: any) => {
    return apiRequest("/work-logs", {
      method: "POST",
      body: JSON.stringify(logData),
    });
  },

  getMyLogs: async (limit = 10, skip = 0, status?: string, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    params.append("limit", limit.toString());
    params.append("skip", skip.toString());
    if (status && status !== "all") params.append("status", status);
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    return apiRequest(`/work-logs/my-logs?${params.toString()}`);
  },

  getDetail: async (id: string) => {
    return apiRequest(`/work-logs/${id}`);
  },

  update: async (id: string, logData: any) => {
    return apiRequest(`/work-logs/${id}`, {
      method: "PUT",
      body: JSON.stringify(logData),
    });
  },

  delete: async (id: string) => {
    return apiRequest(`/work-logs/${id}`, {
      method: "DELETE",
    });
  },
};

// ===== ADMIN API =====
export const admin = {
  getAllUsers: async (limit = 10, skip = 0) => {
    const params = new URLSearchParams();
    params.append("limit", limit.toString());
    params.append("skip", skip.toString());
    return apiRequest(`/admin/users?${params.toString()}`);
  },

  getUserDetail: async (id: string) => {
    return apiRequest(`/admin/users/${id}`);
  },

  updateUserStatus: async (id: string, isActive: boolean) => {
    return apiRequest(`/admin/users/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ isActive }),
    });
  },

  getAllLogs: async (limit = 10, skip = 0, userId?: string, status?: string, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    params.append("limit", limit.toString());
    params.append("skip", skip.toString());
    if (userId && userId !== "all") params.append("userId", userId);
    if (status && status !== "all") params.append("status", status);
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    return apiRequest(`/admin/logs/all?${params.toString()}`);
  },

  getTodayLogs: async (limit = 10, skip = 0) => {
    const params = new URLSearchParams();
    params.append("limit", limit.toString());
    params.append("skip", skip.toString());
    return apiRequest(`/admin/logs/today?${params.toString()}`);
  },

  getActivityLogs: async (limit = 10, skip = 0, userId?: string) => {
    const params = new URLSearchParams();
    params.append("limit", limit.toString());
    params.append("skip", skip.toString());
    if (userId) params.append("userId", userId);

    return apiRequest(`/admin/activity-logs?${params.toString()}`);
  },
};
