const DEFAULT_API_BASE_URL = "https://mernproject-12kg.onrender.com/api";

function normalizeApiBaseUrl(value) {
  return value.trim().replace(/^["']|["']$/g, "").replace(/\/+$/, "");
}

export const API_BASE_URL = normalizeApiBaseUrl(
  process.env.REACT_APP_API_URL || DEFAULT_API_BASE_URL
);

export const AUTH_API = `${API_BASE_URL}/auth`;
export const REPAIRS_API = `${API_BASE_URL}/repairs`;
export const TRACK_API = `${REPAIRS_API}/track`;
