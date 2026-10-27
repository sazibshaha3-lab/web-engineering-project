import axios from "axios";

const TOKEN_KEY = "campuseats_token";
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
};

// Laravel decimal column gulo JSON e string ("250.00") hishebe ashe.
// Frontend number chay, tai shudhu ei key gulo convert kora hoy.
const NUMERIC_KEYS = new Set(["price", "rating", "deliveryFee", "minimumOrder", "subtotal", "discount", "total", "latitude", "longitude"]);

const toCamel = (s) => s.replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase());
const toSnake = (s) => s.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
const isPlainObject = (v) => v !== null && typeof v === "object" && Object.getPrototypeOf(v) === Object.prototype;

// response: snake_case -> camelCase, decimal string -> number
function fromApi(value, key) {
  if (Array.isArray(value)) return value.map((v) => fromApi(v));
  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => {
        const ck = toCamel(k);
        return [ck, fromApi(v, ck)];
      })
    );
  }
  if (NUMERIC_KEYS.has(key) && typeof value === "string" && value.trim() !== "" && !Number.isNaN(Number(value))) {
    return Number(value);
  }
  return value;
}

// request: camelCase -> snake_case
function toApi(value) {
  if (Array.isArray(value)) return value.map(toApi);
  if (isPlainObject(value)) {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [toSnake(k), toApi(v)]));
  }
  return value;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { Accept: "application/json" },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (isPlainObject(config.data) || Array.isArray(config.data)) {
    config.data = toApi(config.data);
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    response.data = fromApi(response.data);
    return response;
  },
  (error) => {
    if (error.response?.status === 401 && getToken()) {
      setToken(null);
      window.dispatchEvent(new Event("auth:expired"));
    }
    return Promise.reject(error);
  }
);

// Laravel validation (422) / generic error theke user-friendly message
export function apiErrorMessage(error, fallback = "Something went wrong. Please try again.") {
  const data = error?.response?.data;
  if (data?.errors) return Object.values(data.errors)[0]?.[0] ?? fallback;
  if (error?.response?.status >= 500) return fallback;
  if (data?.message) return data.message;
  if (error?.request && !error.response) return "Cannot reach the server. Is the API running?";
  return fallback;
}

export default api;
