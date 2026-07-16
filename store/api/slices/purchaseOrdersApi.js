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

const purchaseOrdersApi = createApi({
  reducerPath: "purchaseOrdersApi",
  baseQuery,
  tagTypes: ["PurchaseOrder"],
  endpoints: (builder) => ({
    getPurchaseOrders: builder.query({
      query: ({ page = 1, pageSize = 20, status, supplierId } = {}) => {
        let url = `/purchase-orders?page=${page}&pageSize=${pageSize}`;
        if (status) url += `&status=${status}`;
        if (supplierId) url += `&supplierId=${supplierId}`;
        return url;
      },
      providesTags: ["PurchaseOrder"],
    }),
    getPurchaseOrder: builder.query({
      query: (id) => `/purchase-orders/${id}`,
      providesTags: ["PurchaseOrder"],
    }),
    createPurchaseOrder: builder.mutation({
      query: (body) => ({ url: "/purchase-orders", method: "POST", body }),
      invalidatesTags: ["PurchaseOrder"],
    }),
    updatePurchaseOrder: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/purchase-orders/${id}`, method: "PUT", body }),
      invalidatesTags: ["PurchaseOrder"],
    }),
    updatePurchaseOrderStatus: builder.mutation({
      query: ({ id, status }) => ({ url: `/purchase-orders/${id}/status`, method: "PATCH", body: { status } }),
      invalidatesTags: ["PurchaseOrder"],
    }),
    uploadInvoice: builder.mutation({
      query: ({ id, file }) => {
        const formData = new FormData();
        formData.append("invoice", file);
        return { url: `/purchase-orders/${id}/upload-invoice`, method: "POST", body: formData };
      },
      invalidatesTags: ["PurchaseOrder"],
    }),
  }),
});

const {
  useGetPurchaseOrdersQuery,
  useGetPurchaseOrderQuery,
  useCreatePurchaseOrderMutation,
  useUpdatePurchaseOrderMutation,
  useUpdatePurchaseOrderStatusMutation,
  useUploadInvoiceMutation,
} = purchaseOrdersApi;

export default purchaseOrdersApi;
export {
  useGetPurchaseOrdersQuery,
  useGetPurchaseOrderQuery,
  useCreatePurchaseOrderMutation,
  useUpdatePurchaseOrderMutation,
  useUpdatePurchaseOrderStatusMutation,
  useUploadInvoiceMutation,
};
