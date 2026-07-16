import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

const baseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.accessToken;
    if (token) headers.set("authorization", `Bearer ${token}`);
    return headers;
  },
});

const auditApi = createApi({
  reducerPath: "auditApi",
  baseQuery,
  tagTypes: ["AuditLog"],
  endpoints: (builder) => ({
    getAuditLogs: builder.query({
      query: ({ page = 1, pageSize = 20, entityType } = {}) => {
        let url = `/audit-logs?page=${page}&pageSize=${pageSize}`;
        if (entityType) url += `&entityType=${entityType}`;
        return url;
      },
      providesTags: ["AuditLog"],
    }),
    getActivity: builder.query({
      query: ({ page = 1, pageSize = 20 } = {}) => `/activity?page=${page}&pageSize=${pageSize}`,
      providesTags: ["AuditLog"],
    }),
    getActivityStats: builder.query({
      query: () => "/activity/stats",
      providesTags: ["AuditLog"],
    }),
  }),
});

const { useGetAuditLogsQuery, useGetActivityQuery, useGetActivityStatsQuery } = auditApi;
export default auditApi;
export { useGetAuditLogsQuery, useGetActivityQuery, useGetActivityStatsQuery };
