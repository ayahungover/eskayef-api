import axios from "axios";

// Set this in `frontend/.env` (see `.env.example`).
// Example: VITE_API_BASE_URL=http://127.0.0.1:8000
const baseURL = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

export const api = axios.create({
  baseURL,
  timeout: 20000,
});

