import { baseApi } from "../baseApi";

const vendorsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getVendors: builder.query({
      query: (params) => ({ url: "/vendors", params }),
      providesTags: ["Vendor"],
    }),
    getVendor: builder.query({
      query: (id) => `/vendors/${id}`,
      providesTags: (result, error, id) => [{ type: "Vendor", id }],
    }),
    createVendor: builder.mutation({
      query: (body) => ({ url: "/vendors", method: "POST", body }),
      invalidatesTags: ["Vendor"],
    }),
    updateVendor: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/vendors/${id}`, method: "PUT", body }),
      invalidatesTags: (result, error, { id }) => [{ type: "Vendor", id }],
    }),
    deleteVendor: builder.mutation({
      query: (id) => ({ url: `/vendors/${id}`, method: "DELETE" }),
      invalidatesTags: ["Vendor"],
    }),
    approveVendor: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/vendors/${id}/approve`, method: "PATCH", body }),
      invalidatesTags: ["Vendor"],
    }),
    getVendorProducts: builder.query({
      query: (id) => `/vendors/${id}/products`,
      providesTags: ["Vendor"],
    }),
    getVendorOrders: builder.query({
      query: (id) => `/vendors/${id}/orders`,
      providesTags: ["Vendor"],
    }),
  }),
});

const {
  useGetVendorsQuery,
  useGetVendorQuery,
  useCreateVendorMutation,
  useUpdateVendorMutation,
  useDeleteVendorMutation,
  useApproveVendorMutation,
  useGetVendorProductsQuery,
  useGetVendorOrdersQuery,
} = vendorsApi;

export default vendorsApi;
export {
  useGetVendorsQuery,
  useGetVendorQuery,
  useCreateVendorMutation,
  useUpdateVendorMutation,
  useDeleteVendorMutation,
  useApproveVendorMutation,
  useGetVendorProductsQuery,
  useGetVendorOrdersQuery,
};
