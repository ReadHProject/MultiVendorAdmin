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

const posApi = createApi({
  reducerPath: "posApi",
  baseQuery,
  tagTypes: ["POS"],
  endpoints: (builder) => ({
    searchProducts: builder.query({
      query: (q) => `/products?q=${encodeURIComponent(q)}&pageSize=20`,
      providesTags: ["POS"],
    }),
    createOrder: builder.mutation({
      query: (body) => ({ url: "/orders", method: "POST", body }),
      invalidatesTags: ["POS"],
    }),
  }),
});

const { useSearchProductsQuery, useCreateOrderMutation } = posApi;
export default posApi;
export { useSearchProductsQuery, useCreateOrderMutation };
