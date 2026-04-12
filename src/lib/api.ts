const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface User {
  _id: string;
  email: string;
  role: 'designer' | 'company' | 'admin';
  firstName?: string;
  lastName?: string;
  avatar?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  token?: string;
  user?: User;
}

export const apiCall = async <T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const url = `${API_URL}${endpoint}`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  // Get token from localStorage
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API call failed');
    }

    return data;
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'An error occurred',
    };
  }
};

export const get = <T = any>(endpoint: string) =>
  apiCall<T>(endpoint, { method: 'GET' });

export const post = <T = any>(endpoint: string, data: any) =>
  apiCall<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const put = <T = any>(endpoint: string, data: any) =>
  apiCall<T>(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const del = <T = any>(endpoint: string) =>
  apiCall<T>(endpoint, { method: 'DELETE' });
