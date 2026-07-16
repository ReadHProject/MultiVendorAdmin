const API_BASE = typeof window !== "undefined"
  ? (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1")
  : "/api/v1";

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;

  let token = null;
  if (typeof window !== "undefined") {
    token = localStorage.getItem("erp_access_token");
  }

  const config = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "include",
  };

  if (config.body && typeof config.body === "object" && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  if (config.body instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  const res = await fetch(url, config);
  const json = await res.json();

  if (!res.ok) {
    if (res.status === 401 && !path.includes("/auth/")) {
      localStorage.removeItem("erp_access_token");
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    const err = new Error(json.error?.message || "Request failed");
    err.status = res.status;
    err.code = json.error?.code;
    err.details = json.error?.details;
    throw err;
  }

  return json.data !== undefined ? json.data : json;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: "POST", body }),
  put: (path, body) => request(path, { method: "PUT", body }),
  patch: (path, body) => request(path, { method: "PATCH", body }),
  delete: (path) => request(path, { method: "DELETE" }),
};

export async function uploadFile(path, file) {
  const formData = new FormData();
  formData.append("file", file);
  return request(path, { method: "POST", body: formData });
}
