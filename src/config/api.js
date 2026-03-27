const DEFAULT_API_BASE = 'http://localhost:4000/api';

export const API_BASE = (import.meta.env.VITE_API_BASE || DEFAULT_API_BASE).replace(/\/+$/, '');
export const API_ORIGIN = API_BASE.replace(/\/api$/, '');
