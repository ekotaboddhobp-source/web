// web/src/api.ts
// Vite Proxy ব্যবহার করার কারণে এখানে সরাসরি '/api' দিলেই কাজ করবে
export const API_URL = (import.meta as any).env?.VITE_API_URL || '/api';