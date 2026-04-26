# Frontend Integration Guide

This guide shows how to integrate the frontend (React) with the backend API.

## Setup Backend First

1. Navigate to backend directory:
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. Backend runs on: `http://localhost:5123`

## Frontend Configuration

### 1. Update Frontend Environment

Create or update `.env` in the frontend root:

```bash
VITE_API_URL=http://localhost:5123/api
```

### 2. Create API Client

Create `src/lib/api.ts`:

```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5123/api';

// Get token from localStorage
const getToken = (): string | null => {
  return localStorage.getItem('token');
};

// Generic fetch wrapper
export const apiCall = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'API request failed');
  }

  return response.json();
};

// Auth API calls
export const auth = {
  register: (data: any) => apiCall('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  login: (data: any) => apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getProfile: () => apiCall('/auth/profile'),
  updateProfile: (data: any) => apiCall('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
};

// Work Log API calls
export const workLogs = {
  create: (data: any) => apiCall('/work-logs', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getMyLogs: (params?: any) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/work-logs/my-logs${query ? '?' + query : ''}`);
  },
  getDetail: (id: string) => apiCall(`/work-logs/${id}`),
  update: (id: string, data: any) => apiCall(`/work-logs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => apiCall(`/work-logs/${id}`, {
    method: 'DELETE',
  }),
};

// Admin API calls
export const admin = {
  users: {
    getAll: (params?: any) => {
      const query = new URLSearchParams(params).toString();
      return apiCall(`/admin/users${query ? '?' + query : ''}`);
    },
    getDetail: (id: string) => apiCall(`/admin/users/${id}`),
    updateStatus: (id: string, isActive: boolean) => apiCall(`/admin/users/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ isActive }),
    }),
  },
  logs: {
    getAll: (params?: any) => {
      const query = new URLSearchParams(params).toString();
      return apiCall(`/admin/logs/all${query ? '?' + query : ''}`);
    },
    getToday: (params?: any) => {
      const query = new URLSearchParams(params).toString();
      return apiCall(`/admin/logs/today${query ? '?' + query : ''}`);
    },
  },
  activities: {
    getAll: (params?: any) => {
      const query = new URLSearchParams(params).toString();
      return apiCall(`/admin/activity-logs${query ? '?' + query : ''}`);
    },
  },
};
```

### 3. Update Login Component

Update `src/pages/Login.tsx`:

```typescript
import { auth } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await auth.login({ email, password });
      
      // Store token
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Navigate based on role
      if (response.data.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/employee/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        disabled={isLoading}
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        disabled={isLoading}
      />
      {error && <div className="error">{error}</div>}
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

### 4. Update Dashboard Component

Update `src/pages/employee/Dashboard.tsx`:

```typescript
import { workLogs } from '@/lib/api';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setIsLoading(true);
        const response = await workLogs.getMyLogs({
          limit: 10,
          skip: page * 10,
        });
        setLogs(response.data);
        setTotal(response.pagination.total);
      } catch (error) {
        console.error('Failed to fetch logs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, [page]);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>My Work Logs</h1>
      {logs.map((log: any) => (
        <div key={log._id}>
          <h3>{log.title}</h3>
          <p>{log.accomplishments}</p>
          <span>{log.status}</span>
          <time>{new Date(log.date).toLocaleDateString()}</time>
        </div>
      ))}
      
      {/* Pagination */}
      <div>
        <button disabled={page === 0} onClick={() => setPage(page - 1)}>
          Previous
        </button>
        <span>Page {page + 1} of {Math.ceil(total / 10)}</span>
        <button
          disabled={page >= Math.ceil(total / 10) - 1}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
```

### 5. Add Auth Context (Optional but Recommended)

Create `src/context/AuthContext.tsx`:

```typescript
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'employee';
  team: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await auth.login({ email, password });
    const { token, user } = response.data;

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));

    setToken(token);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!token,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### 6. Protect Routes

Update `src/App.tsx`:

```typescript
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole }: any) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  
  if (!isAuthenticated) return <Navigate to="/" />;
  
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" />;
  }

  return children;
};

// Use in routes
<Route
  path="/admin/dashboard"
  element={
    <ProtectedRoute requiredRole="admin">
      <AdminDashboard />
    </ProtectedRoute>
  }
/>
```

## Test Credentials

After running backend seed:

```
Admin:
- Email: admin@tracely.app
- Password: password123

Employee:
- Email: khushi@tracely.app
- Password: password123

Employee 2:
- Email: john@tracely.app
- Password: password123
```

## Common Issues

### CORS Error
- Ensure backend is running on port 5123
- Check CORS_ORIGIN in backend .env matches frontend URL
- Verify Authorization header is included

### Token Not Working
- Check token is stored in localStorage after login
- Verify token format: `Bearer <token>`
- Check JWT_SECRET matches between frontend and backend

### API 404 Error
- Verify endpoint path matches API documentation
- Check backend is running: `http://localhost:5123/health`
- Verify request body format matches examples

## Next Steps

1. Update all components to use the API
2. Add error handling and loading states
3. Implement React Query for efficient caching
4. Add request/response logging for debugging
5. Implement token refresh logic
6. Add logout functionality

For detailed API documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
