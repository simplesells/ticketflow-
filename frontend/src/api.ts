import type { WorkOrder } from './types';

const BASE = import.meta.env.VITE_API_URL || '/api';

function getHeaders(extraHeaders?: Record<string, string>): Record<string, string> {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  return {
    'Content-Type': 'application/json',
    'x-user-id': String(user?.id || ''),
    ...extraHeaders,
  };
}

export async function fetchWorkOrders(params?: Record<string, string>): Promise<WorkOrder[]> {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  const res = await fetch(`${BASE}/workorders${qs}`, { headers: getHeaders() });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function fetchWorkOrder(id: number): Promise<WorkOrder> {
  const res = await fetch(`${BASE}/workorders/${id}`, { headers: getHeaders() });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function createWorkOrder(data: { title: string; description: string; type: string; priority: string }): Promise<WorkOrder> {
  const res = await fetch(`${BASE}/workorders`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || `API error: ${res.status}`);
  }
  return res.json();
}

export async function updateWorkOrderStatus(id: number, status: string, returnReason?: string): Promise<WorkOrder> {
  const body: any = { status };
  if (returnReason) body.returnReason = returnReason;
  const res = await fetch(`${BASE}/workorders/${id}/status`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || `API error: ${res.status}`);
  }
  return res.json();
}

export async function editWorkOrder(id: number, data: { title: string; description: string }): Promise<WorkOrder> {
  const res = await fetch(`${BASE}/workorders/${id}/edit`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || `API error: ${res.status}`);
  }
  return res.json();
}

export async function assignWorkOrder(id: number, assignee: string): Promise<WorkOrder> {
  const res = await fetch(`${BASE}/workorders/${id}/assign`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ assignee }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || `API error: ${res.status}`);
  }
  return res.json();
}

export interface LoginResponse {
  id: number;
  username: string;
  role: string;
  displayName: string;
}

export async function loginUser(username: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || '登录失败');
  }
  return res.json();
}

export async function fetchResolvers(): Promise<{ id: number; displayName: string; role: string }[]> {
  const res = await fetch(`${BASE}/auth?role=resolver`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export interface Comment {
  id: number;
  workorderId: number;
  content: string;
  author: string;
  createdAt: string;
}

export async function fetchComments(workorderId: number): Promise<Comment[]> {
  const res = await fetch(`${BASE}/workorders/${workorderId}/comments`, { headers: getHeaders() });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function createComment(workorderId: number, content: string): Promise<Comment> {
  const res = await fetch(`${BASE}/workorders/${workorderId}/comments`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ content }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || `API error: ${res.status}`);
  }
  return res.json();
}

export interface Notification {
  id: number;
  userId: number;
  workorderId: number;
  type: 'comment' | 'status_change' | 'assign';
  message: string;
  isRead: boolean;
  createdAt: string;
}

export async function fetchNotifications(): Promise<Notification[]> {
  const res = await fetch(`${BASE}/notifications`, { headers: getHeaders() });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function fetchUnreadCount(): Promise<number> {
  const res = await fetch(`${BASE}/notifications/unread-count`, { headers: getHeaders() });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();
  return data.count;
}

export async function markNotificationRead(id: number): Promise<void> {
  const res = await fetch(`${BASE}/notifications/${id}/read`, { method: 'PATCH', headers: getHeaders() });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
}

export async function markAllNotificationsRead(): Promise<void> {
  const res = await fetch(`${BASE}/notifications/read-all`, { method: 'PATCH', headers: getHeaders() });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
}

export interface FormTemplate {
  id: number;
  name: string;
  titleHint: string;
  descriptionHint: string;
  type: string;
  priority: string;
}

export async function fetchTemplates(): Promise<FormTemplate[]> {
  const res = await fetch(`${BASE}/templates`, { headers: getHeaders() });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function createTemplate(data: { name: string; titleHint?: string; descriptionHint?: string; type: string; priority: string }): Promise<FormTemplate> {
  const res = await fetch(`${BASE}/templates`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) });
  if (!res.ok) { const err = await res.json(); throw new Error(err.error || `API error: ${res.status}`); }
  return res.json();
}

export async function updateTemplate(id: number, data: { name: string; titleHint?: string; descriptionHint?: string; type: string; priority: string }): Promise<FormTemplate> {
  const res = await fetch(`${BASE}/templates/${id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(data) });
  if (!res.ok) { const err = await res.json(); throw new Error(err.error || `API error: ${res.status}`); }
  return res.json();
}

export async function deleteTemplate(id: number): Promise<void> {
  const res = await fetch(`${BASE}/templates/${id}`, { method: 'DELETE', headers: getHeaders() });
  if (!res.ok) { const err = await res.json(); throw new Error(err.error || `API error: ${res.status}`); }
}
