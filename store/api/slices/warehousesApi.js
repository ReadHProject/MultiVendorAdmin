import { baseApi } from "../baseApi";

const warehousesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getWarehouses: builder.query({
      query: () => "/warehouses",
      providesTags: ["Warehouse"],
    }),
    getWarehouse: builder.query({
      query: (id) => `/warehouses/${id}`,
      providesTags: (result, error, id) => [{ type: "Warehouse", id }],
    }),
    createWarehouse: builder.mutation({
      query: (body) => ({ url: "/warehouses", method: "POST", body }),
      invalidatesTags: ["Warehouse"],
    }),
    updateWarehouse: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/warehouses/${id}`, method: "PUT", body }),
      invalidatesTags: ["Warehouse"],
    }),
    deleteWarehouse: builder.mutation({
      query: (id) => ({ url: `/warehouses/${id}`, method: "DELETE" }),
      invalidatesTags: ["Warehouse"],
    }),
    getTransfers: builder.query({
      query: (params) => ({ url: "/warehouses/transfers", params }),
      providesTags: ["Warehouse"],
    }),
    createTransfer: builder.mutation({
      query: (body) => ({ url: "/warehouses/transfers", method: "POST", body }),
      invalidatesTags: ["Warehouse"],
    }),
    completeTransfer: builder.mutation({
      query: (id) => ({ url: `/warehouses/transfers/${id}/complete`, method: "PATCH" }),
      invalidatesTags: ["Warehouse"],
    }),
  }),
});

const {
  useGetWarehousesQuery,
  useGetWarehouseQuery,
  useCreateWarehouseMutation,
  useUpdateWarehouseMutation,
  useDeleteWarehouseMutation,
  useGetTransfersQuery,
  useCreateTransferMutation,
  useCompleteTransferMutation,
} = warehousesApi;

export default warehousesApi;
export {
  useGetWarehousesQuery,
  useGetWarehouseQuery,
  useCreateWarehouseMutation,
  useUpdateWarehouseMutation,
  useDeleteWarehouseMutation,
  useGetTransfersQuery,
  useCreateTransferMutation,
  useCompleteTransferMutation,
};
