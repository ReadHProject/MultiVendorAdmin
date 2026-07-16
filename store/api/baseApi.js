import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

const baseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.accessToken;
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const refreshResult = await baseQuery("/auth/refresh", api, extraOptions);
    if (refreshResult.data) {
      result = await baseQuery(args, api, extraOptions);
    } else {
      api.dispatch({ type: "auth/logout" });
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  }

  return result;
};

const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "User", "Role", "Permission", "Product", "Category", "Brand",
    "Order", "Inventory", "Warehouse", "Supplier", "PurchaseOrder",
    "Commission", "Vendor", "Notification", "Setting", "Dashboard",
    "Report", "Ticket", "Slider", "Ticker", "Store", "Template",
    "RoleUpgrade", "AuditLog", "Activity", "GST", "Tax",
    "StockAlert", "SalesPerson", "CustomerType", "ProductType", "POS",
  ],
  endpoints: () => ({}),
});

export { baseApi };
