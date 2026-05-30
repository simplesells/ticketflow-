import type { WorkOrder } from './types';

const BASE = 'http://localhost:5680/api';

export async function fetchWorkOrders(params?: Record<string, string>): Promise<WorkOrder[]> {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  const res = await fetch(`${BASE}/workorders${qs}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function fetchWorkOrder(id: number): Promise<WorkOrder> {
  const res = await fetch(`${BASE}/workorders/${id}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function createWorkOrder(data: { title: string; description: string; type: string; priority: string; submitter?: string }): Promise<WorkOrder> {
  const res = await fetch(`${BASE}/workorders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
    headers: { 'Content-Type': 'application/json' },
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
    headers: { 'Content-Type': 'application/json' },
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
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ assignee }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || `API error: ${res.status}`);
  }
  return res.json();
}
