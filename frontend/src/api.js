const BASE = 'http://localhost:8000';

async function request(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Request failed');
  }
  return res.json();
}

export const fetchBriefing = () => request('/briefing');
export const fetchTasks = () => request('/tasks');
export const createTask = (title) => request('/tasks', { method: 'POST', body: JSON.stringify({ title }) });
export const completeTask = (id) => request(`/tasks/${id}/complete`, { method: 'PUT' });
export const deleteTask = (id) => request(`/tasks/${id}`, { method: 'DELETE' });
export const fetchStandup = () => request('/standup');
export const fetchInsights = () => request('/insights');
