// Simple API client - keeps auth token in localStorage and adds to requests
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
      ...options.headers,
    },
  });

  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('Session expired');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(error.detail || 'Request failed');
  }

  if (response.status === 204) return null;
  return response.json();
}

// Auth
export const auth = {
  login: (email, password) => request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }),
  signup: (name, email, password) => request('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  }),
};

// User
export const user = {
  me: () => request('/api/users/me'),
  update: (data) => request('/api/users/me', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  changePassword: (oldPassword, newPassword) => request('/api/users/me/password', {
    method: 'PUT',
    body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
  }),
};

// Trips
export const trips = {
  list: () => request('/api/trips/'),
  get: (id) => request(`/api/trips/${id}`),
  create: (data) => request('/api/trips/', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => request(`/api/trips/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => request(`/api/trips/${id}`, { method: 'DELETE' }),
  share: (id) => request(`/api/trips/${id}/share`, { method: 'POST' }),
  unshare: (id) => request(`/api/trips/${id}/unshare`, { method: 'POST' }),
  public: () => request('/api/trips/public'),
  publicBySlug: (slug) => request(`/api/trips/public/${slug}`),
};

// Stops
export const stops = {
  list: (tripId) => request(`/api/stops/trips/${tripId}/stops`),
  create: (tripId, data) => request(`/api/stops/trips/${tripId}/stops`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (stopId, data) => request(`/api/stops/stops/${stopId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (stopId) => request(`/api/stops/stops/${stopId}`, { method: 'DELETE' }),
  reorder: (tripId, stopIds) => request(`/api/stops/trips/${tripId}/stops/reorder`, {
    method: 'PUT',
    body: JSON.stringify(stopIds),
  }),
  addActivity: (stopId, data) => request(`/api/stops/stops/${stopId}/activities`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateActivity: (saId, data) => request(`/api/stops/stop-activities/${saId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  removeActivity: (saId) => request(`/api/stops/stop-activities/${saId}`, { method: 'DELETE' }),
};

// Cities
export const cities = {
  search: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/api/cities/${query ? '?' + query : ''}`);
  },
  popular: (limit = 10) => request(`/api/cities/popular?limit=${limit}`),
  get: (id) => request(`/api/cities/${id}`),
};

// Activities
export const activities = {
  search: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/api/activities/${query ? '?' + query : ''}`);
  },
  popular: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/api/activities/popular${query ? '?' + query : ''}`);
  },
};

// Budget
export const budget = {
  get: (tripId) => request(`/api/budget/trips/${tripId}`),
};

// Checklist
export const checklist = {
  list: (tripId) => request(`/api/checklist/trips/${tripId}`),
  create: (tripId, data) => request(`/api/checklist/trips/${tripId}`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (itemId, data) => request(`/api/checklist/${itemId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (itemId) => request(`/api/checklist/${itemId}`, { method: 'DELETE' }),
  reset: (tripId) => request(`/api/checklist/trips/${tripId}/reset`, { method: 'POST' }),
};

// Notes
export const notes = {
  list: (tripId) => request(`/api/notes/trips/${tripId}`),
  create: (tripId, data) => request(`/api/notes/trips/${tripId}`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (noteId, data) => request(`/api/notes/${noteId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (noteId) => request(`/api/notes/${noteId}`, { method: 'DELETE' }),
};