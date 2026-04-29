// API Client for WorkFlow Pro Next backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

interface ApiResponse<T = any> {
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
const apiRequest = async <T = any,>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();

  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
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

  getMyLogs: async (limit = 10, skip = 0, status?: string, startDate?: string, endDate?: string, submittedOnly = false) => {
    const params = new URLSearchParams();
    params.append("limit", limit.toString());
    params.append("skip", skip.toString());
    if (status && status !== "all") params.append("status", status);
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    if (submittedOnly) params.append("submittedOnly", "true");

    return apiRequest(`/work-logs/my-logs?${params.toString()}`);
  },

  getDetail: async (id: string) => {
    const res = await apiRequest(`/work-logs/${id}`);
    if (res.success && res.data) {
      // Extract user name from userId object if it exists
      const log = res.data;
      if (log.userId && typeof log.userId === "object" && "name" in log.userId) {
        log.user = log.userId.name;
      }
    }
    return res;
  },

  update: async (id: string, logData: any) => {
    return apiRequest(`/work-logs/${id}`, {
      method: "PUT",
      body: JSON.stringify(logData),
    });
  },

  getTodayLog: async () => {
    return apiRequest("/work-logs/today");
  },

  updateTaskStatus: async (logId: string, taskId: string, status: string) => {
    return apiRequest(`/work-logs/${logId}/tasks/${taskId}`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  },

  submitLog: async (id: string) => {
    return apiRequest(`/work-logs/${id}/submit`, {
      method: "PUT",
    });
  },

  updateTask: async (logId: string, taskId: string, taskData: { status?: string; notes?: string }) => {
    return apiRequest(`/work-logs/${logId}/tasks/${taskId}`, {
      method: "PUT",
      body: JSON.stringify(taskData),
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

  getSeoReports: async (limit = 10, skip = 0, userId?: string, date?: string, department = "SEO") => {
    const params = new URLSearchParams();
    params.append("limit", limit.toString());
    params.append("skip", skip.toString());
    params.append("department", department);
    if (userId && userId !== "all") params.append("userId", userId);
    if (date) params.append("date", date);
    return apiRequest(`/admin/seo-reports?${params.toString()}`);
  },

  getActivityLogs: async (limit = 10, skip = 0, userId?: string) => {
    const params = new URLSearchParams();
    params.append("limit", limit.toString());
    params.append("skip", skip.toString());
    if (userId) params.append("userId", userId);

    return apiRequest(`/admin/activity-logs?${params.toString()}`);
  },
};

// ===== MESSAGING API =====
export const messaging = {
  sendMessage: async (messageData: {
    message: string;
    contextType: "task" | "log" | "direct";
    contextId?: string;
    receiverIds?: string[];
    mentions?: string[];
    attachments?: {
      name: string;
      url: string;
      type: "image" | "link" | "document" | "spreadsheet" | "presentation";
    }[];
  }) => {
    return apiRequest("/messages", {
      method: "POST",
      body: JSON.stringify(messageData),
    });
  },

  getMessages: async (contextType?: string, contextId?: string, receiverId?: string) => {
    const params = new URLSearchParams();
    if (contextType) params.append("contextType", contextType);
    if (contextId) params.append("contextId", contextId);
    if (receiverId) params.append("receiverId", receiverId);

    return apiRequest(`/messages?${params.toString()}`);
  },

  searchUsers: async (q: string) => {
    return apiRequest(`/users/search?q=${encodeURIComponent(q)}`);
  },

  getConversations: async () => {
    return apiRequest("/messages/conversations");
  },

  deleteConversation: async (userId: string) => {
    return apiRequest(`/messages/conversation/${userId}`, {
      method: "DELETE"
    });
  },

  markMessagesAsRead: async (data: { contextType: string, contextId?: string, senderId?: string }) => {
    return apiRequest("/messages/read", {
      method: "PUT",
      body: JSON.stringify(data)
    });
  },
};

// ===== NOTIFICATIONS API =====
export const notifications = {
  getAll: async () => {
    return apiRequest("/notifications");
  },

  markAllAsRead: async () => {
    return apiRequest("/notifications/read-all", {
      method: "PUT",
    });
  },

  markAsRead: async (id: string) => {
    return apiRequest(`/notifications/${id}/read`, {
      method: "PUT",
    });
  },
};
